import { ethers } from 'ethers';
import { injectable, inject, singleton } from 'tsyringe';
import { ErrorRegistry } from './ErrorRegistry';
import PoolABI from '@abis/Pool.json';
import QuoterABI from '@abis/Quoter.json';

/**
 * @title Error Extractor
 * @notice Extracts and decodes contract custom errors from exceptions
 * @dev Handles various error formats and nested errors (e.g., PoolQuoteFailed)
 */
@injectable()
@singleton()
export class ErrorExtractor {
  constructor(
    @inject(ErrorRegistry)
    private readonly errorRegistry: ErrorRegistry
  ) {}

  /**
   * @notice Extracts contract error from an exception
   * @param error The error to extract
   * @param contractInterface Optional contract interface for direct parsing
   * @returns Standardized contract error format
   */
  extractContractError(error: unknown, contractInterface?: ethers.Interface): any {
    // Try to extract error data from different error formats
    let errorData: string | undefined;

    // Handle ethers.js errors
    if (error instanceof Error) {
      // Check for error.data property (ethers.js format)
      if ((error as any).data) {
        errorData = (error as any).data;
      }
      // Check for error.reason property
      else if ((error as any).reason) {
        errorData = (error as any).reason;
      }
      // Try to extract from error message (common pattern: "execution reverted: 0x...")
      else {
        const match = /0x[a-fA-F0-9]+/i.exec(error.message);
        if (match) {
          errorData = match[0];
        }
      }
    }
    // Handle string errors
    else if (typeof error === 'string') {
      const match = /0x[a-fA-F0-9]+/i.exec(error);
      if (match) {
        errorData = match[0];
      }
    }
    // Handle objects with data property
    else if (error && typeof error === 'object' && 'data' in error) {
      errorData = (error as any).data;
    }

    // Check for Solidity Panic errors (selector: 0x4e487b71) BEFORE trying to parse with contract interface
    // Panic errors are built-in Solidity errors with format: Panic(uint256 code)
    // IMPORTANT: In the context of Quoter, PanicUnderflowOverflow (0x11) typically indicates
    // insufficient liquidity (type(int256).min conversion), so we map it to InsufficientLiquidity
    if (errorData?.startsWith('0x4e487b71')) {
      try {
        // Panic(uint256) - extract the panic code
        // Error data format: 0x4e487b71 (selector) + 32 bytes (panic code)
        if (errorData.length >= 74) {
          // Extract panic code (bytes 4-36, after selector)
          const panicCodeHex = '0x' + errorData.slice(10, 74);
          const panicCode = BigInt(panicCodeHex);

          // Map panic codes to friendly error names
          const panicCodeMap: Record<string, string> = {
            '0x00': 'PanicGeneric',
            '0x01': 'PanicAssert',
            '0x11': 'PanicUnderflowOverflow',
            '0x12': 'PanicDivisionByZero',
            '0x21': 'PanicEnumConversion',
            '0x22': 'PanicStorageEncoding',
            '0x31': 'PanicEmptyArrayPop',
            '0x32': 'PanicArrayOutOfBounds',
            '0x41': 'PanicResourceError',
            '0x51': 'PanicInvalidInternalFunction'
          };

          const panicCodeKey = '0x' + panicCode.toString(16).padStart(2, '0');
          let panicName = panicCodeMap[panicCodeKey] || 'PanicUnknown';

          // Special handling: If this is PanicUnderflowOverflow and we have a Quoter interface,
          // map it to InsufficientLiquidity (this happens when Quoter isn't updated or Panic occurs before check)
          if (panicCodeKey === '0x11' && contractInterface) {
            // Check if this is a Quoter-related error by checking if the interface has Quoter errors
            try {
              const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
              // If we can parse InsufficientLiquidity, this is likely a Quoter context
              const insufficientLiquidityError = quoterInterface.getError('InsufficientLiquidity');
              if (insufficientLiquidityError) {
                panicName = 'InsufficientLiquidity';
                return {
                  errorCode: insufficientLiquidityError.selector,
                  errorMessage: 'InsufficientLiquidity',
                  errorArgs: [],
                  originalErrorData: errorData
                };
              }
            } catch {
              // If we can't check, fall through to return Panic
            }
          }

          return {
            errorCode: '0x4e487b71',
            errorMessage: panicName,
            errorArgs: [panicCode],
            originalErrorData: errorData
          };
        }
      } catch {
        // If parsing fails, return generic panic
      }

      // Fallback: return generic panic error
      return {
        errorCode: '0x4e487b71',
        errorMessage: 'PanicGeneric',
        originalErrorData: errorData
      };
    }

    // If we have a contract interface, try to parse the error directly
    if (contractInterface && errorData) {
      try {
        const decoded = contractInterface.parseError(errorData);
        if (decoded) {
          // Special handling for InsufficientRevertData - try to extract original error if possible
          if (decoded.name === 'InsufficientRevertData') {
            // InsufficientRevertData(uint256 length) - we only have the length, not the original error
            // But we can still return the InsufficientRevertData with its argument
            return {
              errorCode: decoded.selector,
              errorMessage: decoded.name,
              errorArgs: decoded.args,
              originalErrorData: errorData
            };
          }

          // Special handling for PoolQuoteFailed - always try to extract the nested error
          // The nested error can be from either Pool or Quoter
          // IMPORTANT: Check if nested error is Panic - if so, it means the Quoter wasn't updated
          // and we should still try to extract the real error (e.g., InsufficientLiquidity)
          if (
            decoded.name === 'PoolQuoteFailed' &&
            decoded.args?.length &&
            decoded.args.length > 0
          ) {
            const nestedErrorData = decoded.args[0] as string;
            if (nestedErrorData?.startsWith('0x')) {
              // Check if nested error is Panic - if so, the Quoter may not be updated
              // But we should still try to extract the real error from Quoter/Pool ABIs
              if (nestedErrorData.startsWith('0x4e487b71')) {
                // Panic inside PoolQuoteFailed - this shouldn't happen with updated Quoter
                // Map PanicUnderflowOverflow (0x11) to InsufficientLiquidity for better UX
                try {
                  const panicCodeHex = '0x' + nestedErrorData.slice(10, 74);
                  const panicCode = BigInt(panicCodeHex);
                  const panicCodeKey = '0x' + panicCode.toString(16).padStart(2, '0');

                  // Special case: PanicUnderflowOverflow in Quoter context = InsufficientLiquidity
                  if (panicCodeKey === '0x11') {
                    try {
                      const quoterInterface = new ethers.Interface(
                        QuoterABI as ethers.InterfaceAbi
                      );
                      const insufficientLiquidityError =
                        quoterInterface.getError('InsufficientLiquidity');
                      if (insufficientLiquidityError) {
                        return {
                          errorCode: insufficientLiquidityError.selector,
                          errorMessage: 'InsufficientLiquidity',
                          errorArgs: [],
                          originalErrorData: nestedErrorData
                        };
                      }
                    } catch {
                      // Fall through to return Panic
                    }
                  }

                  const panicCodeMap: Record<string, string> = {
                    '0x00': 'PanicGeneric',
                    '0x01': 'PanicAssert',
                    '0x11': 'PanicUnderflowOverflow',
                    '0x12': 'PanicDivisionByZero',
                    '0x21': 'PanicEnumConversion',
                    '0x22': 'PanicStorageEncoding',
                    '0x31': 'PanicEmptyArrayPop',
                    '0x32': 'PanicArrayOutOfBounds',
                    '0x41': 'PanicResourceError',
                    '0x51': 'PanicInvalidInternalFunction'
                  };
                  const panicName = panicCodeMap[panicCodeKey] || 'PanicUnknown';
                  return {
                    errorCode: '0x4e487b71',
                    errorMessage: panicName,
                    errorArgs: [panicCode],
                    originalErrorData: nestedErrorData
                  };
                } catch {
                  // Fall through to try extracting with ABIs
                }
              }

              // Try to parse nested error using Quoter ABI first (e.g., InsufficientLiquidity)
              try {
                const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
                const nestedDecoded = quoterInterface.parseError(nestedErrorData);
                if (nestedDecoded) {
                  return {
                    errorCode: nestedDecoded.selector,
                    errorMessage: nestedDecoded.name,
                    errorArgs: nestedDecoded.args,
                    originalErrorData: nestedErrorData
                  };
                }
              } catch {
                // If Quoter ABI parsing fails, try Pool ABI
                try {
                  const poolInterface = new ethers.Interface(PoolABI as ethers.InterfaceAbi);
                  const nestedDecoded = poolInterface.parseError(nestedErrorData);
                  if (nestedDecoded) {
                    return {
                      errorCode: nestedDecoded.selector,
                      errorMessage: nestedDecoded.name,
                      errorArgs: nestedDecoded.args,
                      originalErrorData: nestedErrorData
                    };
                  }
                } catch {
                  // If both parsing fail, extract selector manually
                  // Even if data is small (4 bytes = selector only), we can still identify the error
                  if (nestedErrorData.length >= 10) {
                    const nestedSelector = nestedErrorData.slice(0, 10);
                    const nestedErrorName = this.errorRegistry.getErrorName(nestedSelector);
                    if (nestedErrorName) {
                      return {
                        errorCode: nestedSelector,
                        errorMessage: nestedErrorName,
                        originalErrorData: nestedErrorData
                      };
                    }
                  }
                }
              }
            }
            // If we can't extract nested error, fall through to return PoolQuoteFailed
          }

          return {
            errorCode: decoded.selector,
            errorMessage: decoded.name,
            errorArgs: decoded.args,
            originalErrorData: errorData
          };
        }
      } catch {
        // If parseError fails, fall through to selector extraction
      }
    }

    // Extract selector from error data (first 4 bytes after "0x")
    // This works even with insufficient data (< 68 bytes) as long as we have at least 10 chars (selector)
    if (errorData && errorData.startsWith('0x') && errorData.length >= 10) {
      const selector = errorData.slice(0, 10); // 0x + 8 hex chars = 4 bytes

      // Check for Panic error by selector (0x4e487b71) - handle it specially
      // Map PanicUnderflowOverflow (0x11) to InsufficientLiquidity in Quoter context
      if (selector === '0x4e487b71') {
        try {
          if (errorData.length >= 74) {
            const panicCodeHex = '0x' + errorData.slice(10, 74);
            const panicCode = BigInt(panicCodeHex);
            const panicCodeKey = '0x' + panicCode.toString(16).padStart(2, '0');

            // Special case: PanicUnderflowOverflow in Quoter context = InsufficientLiquidity
            if (panicCodeKey === '0x11' && contractInterface) {
              try {
                const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
                const insufficientLiquidityError =
                  quoterInterface.getError('InsufficientLiquidity');
                if (insufficientLiquidityError) {
                  return {
                    errorCode: insufficientLiquidityError.selector,
                    errorMessage: 'InsufficientLiquidity',
                    errorArgs: [],
                    originalErrorData: errorData
                  };
                }
              } catch {
                // Fall through to return Panic
              }
            }

            const panicCodeMap: Record<string, string> = {
              '0x00': 'PanicGeneric',
              '0x01': 'PanicAssert',
              '0x11': 'PanicUnderflowOverflow',
              '0x12': 'PanicDivisionByZero',
              '0x21': 'PanicEnumConversion',
              '0x22': 'PanicStorageEncoding',
              '0x31': 'PanicEmptyArrayPop',
              '0x32': 'PanicArrayOutOfBounds',
              '0x41': 'PanicResourceError',
              '0x51': 'PanicInvalidInternalFunction'
            };
            const panicName = panicCodeMap[panicCodeKey] || 'PanicUnknown';
            return {
              errorCode: '0x4e487b71',
              errorMessage: panicName,
              errorArgs: [panicCode],
              originalErrorData: errorData
            };
          }
        } catch {
          // Fall through
        }
        return {
          errorCode: '0x4e487b71',
          errorMessage: 'PanicGeneric',
          originalErrorData: errorData
        };
      }

      // Calculate data length in bytes (excluding 0x prefix)
      const dataLengthBytes = (errorData.length - 2) / 2;

      // If data is insufficient (< 68 bytes) but we have a selector, try to identify the error
      // This allows us to identify errors even when we can't fully decode them
      if (dataLengthBytes < 68 && dataLengthBytes >= 4) {
        // Look up error name in registry
        const errorName = this.errorRegistry.getErrorName(selector);
        if (errorName) {
          return {
            errorCode: selector,
            errorMessage: errorName,
            originalErrorData: errorData,
            errorArgs: undefined // Can't decode args with insufficient data
          };
        }
      }

      // Look up error name in registry
      const errorName = this.errorRegistry.getErrorName(selector);
      if (errorName) {
        return {
          errorCode: selector,
          errorMessage: errorName,
          originalErrorData: errorData
        };
      }

      // If not found in registry, return with selector
      return {
        errorCode: selector,
        errorMessage: 'UnknownError',
        originalErrorData: errorData
      };
    }

    // Handle nested errors (e.g., PoolQuoteFailed contains Pool error)
    if (errorData && contractInterface) {
      try {
        // Try to decode as PoolQuoteFailed
        const decoded = contractInterface.parseError(errorData);
        if (
          decoded?.name === 'PoolQuoteFailed' &&
          decoded.args?.length &&
          decoded.args.length > 0
        ) {
          // Extract nested error from bytes parameter
          // The nested error can be from either Pool or Quoter
          const nestedErrorData = decoded.args?.[0] as string;
          if (nestedErrorData?.startsWith('0x')) {
            // Try to parse nested error using Quoter ABI first (e.g., InsufficientLiquidity)
            try {
              const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
              const nestedDecoded = quoterInterface.parseError(nestedErrorData);
              if (nestedDecoded) {
                return {
                  errorCode: nestedDecoded.selector,
                  errorMessage: nestedDecoded.name,
                  errorArgs: nestedDecoded.args,
                  originalErrorData: nestedErrorData
                };
              }
            } catch {
              // If Quoter ABI parsing fails, try Pool ABI
              try {
                const poolInterface = new ethers.Interface(PoolABI as ethers.InterfaceAbi);
                const nestedDecoded = poolInterface.parseError(nestedErrorData);
                if (nestedDecoded) {
                  return {
                    errorCode: nestedDecoded.selector,
                    errorMessage: nestedDecoded.name,
                    errorArgs: nestedDecoded.args,
                    originalErrorData: nestedErrorData
                  };
                }
              } catch {
                // If both parsing fail, extract selector manually
                // Even if data is small (4 bytes = selector only), we can still identify the error
                if (nestedErrorData.length >= 10) {
                  const nestedSelector = nestedErrorData.slice(0, 10);
                  const nestedErrorName = this.errorRegistry.getErrorName(nestedSelector);
                  return {
                    errorCode: nestedSelector,
                    errorMessage: nestedErrorName ?? 'UnknownError',
                    originalErrorData: nestedErrorData
                    // errorArgs will be undefined for errors without arguments or insufficient data
                  };
                }
              }
            }
          }
        }
      } catch {
        // If parsing fails, continue to unknown error
      }
    }

    // Unknown error - return default format
    return {
      errorCode: '0x000000',
      errorMessage: 'UnknownError'
    };
  }
}
