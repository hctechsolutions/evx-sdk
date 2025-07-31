import { ethers } from 'ethers';
import { container } from 'tsyringe';
import { RPC } from '@providers';

/**
 * @notice Gets comprehensive gas price information from network
 * @return Object with gas prices in wei
 */
export async function getNetworkGasPrices() {
  const rpc = container.resolve(RPC);
  if (!rpc.provider) {
    throw new Error('RPC provider not initialized');
  }

  const feeData = await rpc.provider.getFeeData();

  return {
    // Legacy gas price (for legacy transactions)
    legacy: feeData.gasPrice ?? 0n,

    // EIP-1559 gas prices
    maxFeePerGas: feeData.maxFeePerGas ?? 0n,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? 0n,

    // Recommended gas price (current network gas price)
    current: feeData.gasPrice ?? feeData.maxFeePerGas ?? 1n,

    // Minimum gas price (priority fee)
    minimum: feeData.maxPriorityFeePerGas ?? 1n,

    // Maximum gas price (max fee per gas)
    maximum: feeData.maxFeePerGas ?? feeData.gasPrice ?? 1n
  };
}

/**
 * @notice Gets the current network gas price in wei
 * @return The current gas price in wei
 */
export async function getCurrentNetworkGasPrice(): Promise<bigint> {
  const rpc = container.resolve(RPC);
  if (!rpc.provider) {
    throw new Error('RPC provider not initialized');
  }

  const feeData = await rpc.provider.getFeeData();
  return feeData.gasPrice ?? feeData.maxFeePerGas ?? 1n;
}

/**
 * @notice Converts gas estimate to ETH cost with different gas price scenarios
 * @param gasEstimateInUnits The gas estimate from contract (in gas units)
 * @return Object with costs in ETH for different gas price scenarios
 */
export async function convertGasEstimateToEthCost(gasEstimateInUnits: bigint) {
  const gasPricesInWei = await getNetworkGasPrices();

  return {
    // Cost with current gas price
    current: Number(gasEstimateInUnits * gasPricesInWei.current) / Number(ethers.WeiPerEther),

    // Cost with minimum gas price (priority fee)
    minimum: Number(gasEstimateInUnits * gasPricesInWei.minimum) / Number(ethers.WeiPerEther),

    // Cost with maximum gas price (max fee per gas)
    maximum: Number(gasEstimateInUnits * gasPricesInWei.maximum) / Number(ethers.WeiPerEther),

    // Cost with legacy gas price
    legacy: Number(gasEstimateInUnits * gasPricesInWei.legacy) / Number(ethers.WeiPerEther),

    // Gas prices in wei for reference
    gasPricesInWei: {
      current: gasPricesInWei.current.toString(),
      minimum: gasPricesInWei.minimum.toString(),
      maximum: gasPricesInWei.maximum.toString(),
      legacy: gasPricesInWei.legacy.toString()
    }
  };
}
