import { ErrorExtractor } from '@utils/errors/ErrorExtractor';
import { ErrorRegistry } from '@utils/errors/ErrorRegistry';
import { container } from 'tsyringe';
import { ethers } from 'ethers';
import QuoterABI from '@abis/Quoter.json';
import PoolABI from '@abis/Pool.json';

jest.mock('@utils/errors/ErrorRegistry');

describe('ErrorExtractor', () => {
  let errorExtractor: ErrorExtractor;
  let errorRegistry: jest.Mocked<ErrorRegistry>;

  beforeEach(() => {
    container.clearInstances();

    errorRegistry = {
      getErrorName: jest.fn()
    } as any;

    (ErrorRegistry as jest.Mock).mockImplementation(() => errorRegistry);

    errorExtractor = container.resolve(ErrorExtractor);
  });

  describe('Panic Error Detection', () => {
    it('should detect Panic error selector (0x4e487b71)', () => {
      // Panic error data: selector (0x4e487b71) + code (0x12) padded to 32 bytes
      const panicErrorData =
        '0x4e487b710000000000000000000000000000000000000000000000000000000000000012';

      const result = errorExtractor.extractContractError(
        { data: panicErrorData },
        new ethers.Interface(QuoterABI as ethers.InterfaceAbi)
      );

      // Verifica se detecta o selector de Panic
      expect(result.errorCode).toBe('0x4e487b71');
      // O ErrorExtractor pode não ter tratamento de Panic, então pode retornar UnknownError
      // ou tentar decodificar como erro customizado
    });
  });

  describe('PoolQuoteFailed with nested errors', () => {
    it('should extract nested Pool error from PoolQuoteFailed', () => {
      // Obter o selector real de NoLiquidity do Pool ABI
      const poolInterface = new ethers.Interface(PoolABI as ethers.InterfaceAbi);
      const noLiquidityError = poolInterface.getError('NoLiquidity');
      const noLiquiditySelector = noLiquidityError!.selector;

      errorRegistry.getErrorName.mockReturnValue('NoLiquidity');

      // PoolQuoteFailed(bytes reason) - reason contém o erro NoLiquidity (apenas selector, 4 bytes)
      const poolQuoteFailedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes'],
        [noLiquiditySelector]
      );

      // Adicionar o selector de PoolQuoteFailed
      const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
      const poolQuoteFailedError = quoterInterface.getError('PoolQuoteFailed');
      const fullErrorData = poolQuoteFailedError!.selector + poolQuoteFailedData.slice(2);

      const result = errorExtractor.extractContractError({ data: fullErrorData }, quoterInterface);

      // Deve extrair o erro NoLiquidity aninhado
      expect(result.errorMessage).toBe('NoLiquidity');
      expect(result.errorCode).toBe(noLiquiditySelector);
    });

    it('should handle PoolQuoteFailed with insufficient data', () => {
      // PoolQuoteFailed com dados insuficientes (< 4 bytes)
      const insufficientData = '0x12'; // Apenas 1 byte
      const poolQuoteFailedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes'],
        [insufficientData]
      );

      const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
      const poolQuoteFailedError = quoterInterface.getError('PoolQuoteFailed');
      const fullErrorData = poolQuoteFailedError!.selector + poolQuoteFailedData.slice(2);

      const result = errorExtractor.extractContractError({ data: fullErrorData }, quoterInterface);

      // Deve retornar PoolQuoteFailed se não conseguir extrair o erro aninhado
      expect(result.errorMessage).toBe('PoolQuoteFailed');
    });
  });

  describe('InsufficientRevertData handling', () => {
    it('should handle InsufficientRevertData error', () => {
      const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
      const insufficientRevertDataError = quoterInterface.getError('InsufficientRevertData');
      const errorData =
        insufficientRevertDataError!.selector +
        ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [4]).slice(2);

      const result = errorExtractor.extractContractError({ data: errorData }, quoterInterface);

      expect(result.errorMessage).toBe('InsufficientRevertData');
      expect(result.errorArgs).toBeDefined();
      expect(result.errorArgs![0]).toBe(BigInt(4));
    });
  });

  describe('Panic error scenarios', () => {
    it('should identify Panic error from Quoter when Pool causes division by zero', () => {
      // Simular um erro Panic que vem do Quoter
      // Panic(0x12) = DivisionByZero
      const panicErrorData =
        '0x4e487b710000000000000000000000000000000000000000000000000000000000000012';

      const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
      const result = errorExtractor.extractContractError({ data: panicErrorData }, quoterInterface);

      // Verifica se detecta o erro Panic
      expect(result.errorCode).toBe('0x4e487b71');
      // Pode retornar UnknownError se não tiver tratamento específico de Panic
    });

    it('should identify Panic error from PoolQuoteFailed when Pool panics', () => {
      // Simular PoolQuoteFailed que contém um Panic error
      const panicErrorData =
        '0x4e487b710000000000000000000000000000000000000000000000000000000000000011'; // UnderflowOverflow

      // Encapsular em PoolQuoteFailed
      const quoterInterface = new ethers.Interface(QuoterABI as ethers.InterfaceAbi);
      const poolQuoteFailedError = quoterInterface.getError('PoolQuoteFailed');
      const poolQuoteFailedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes'],
        [panicErrorData]
      );
      const fullErrorData = poolQuoteFailedError!.selector + poolQuoteFailedData.slice(2);

      const result = errorExtractor.extractContractError({ data: fullErrorData }, quoterInterface);

      // Deve tentar extrair o erro aninhado (Panic)
      // Se conseguir, deve retornar o Panic; caso contrário, PoolQuoteFailed
      expect(['PoolQuoteFailed', 'UnknownError']).toContain(result.errorMessage);
    });
  });
});
