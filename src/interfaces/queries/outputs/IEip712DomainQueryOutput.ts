/**
 * @notice Output interface for the EIP-712 domain query
 * @dev Contains all the fields returned by the eip712Domain function
 */
export interface IEip712DomainQueryOutput {
  fields: string; // bytes1
  name: string;
  version: string;
  chainId: bigint;
  verifyingContract: string; // address
  salt: string; // bytes32
  extensions: bigint[]; // uint256[]
} 