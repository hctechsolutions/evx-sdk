import 'reflect-metadata';

// Contracts
export * from './contracts';

// Commands
export * from './commands';

// Providers
export * from './providers';

// Queries
export * from './queries';

// Resources
export * from './resources';

// Utils
export * from './utils';





// ----------------------------------

// import { container } from 'tsyringe';

// import { GetPositionQuery } from '@queries';
// import { setAllChain, setRPCProvider } from '@resources';
// import { IGetPositionParams } from '@interfaces/queries/params/IGetPositionParams';



// (async () => {
//     await setRPCProvider('https://sepolia.infura.io/v3/bee828df1f514cbcaa66c72a9c18a4dd');
//     await setAllChain('sepolia');
    
//     const getFeeAmountTickSpacingQuery = container.resolve(GetPositionQuery);
//     const params: IGetPositionParams = { tokenId: 1n };
//     const output = await getFeeAmountTickSpacingQuery.execute(params);
//     console.log('Result:', output);
// })()

// ----------------------------------

// import { container } from 'tsyringe';
// import { setAllChain, setRPCProvider } from './resources/settings';
// import { QuoteExactInputSingleQuery } from './queries';
// import { sqrtX96ToDecimalPrice } from './utils';

// async function main() {
//   await setRPCProvider('https://sepolia.infura.io/v3/bee828df1f514cbcaa66c72a9c18a4dd');
//   await setAllChain('sepolia');

//   const quoteExactInputSingleQuery = container.resolve(QuoteExactInputSingleQuery);

//   const result = await quoteExactInputSingleQuery.execute({
//     tokenIn: '0x109b39d11aE5036A7E14458A769F20d55f7F28da', // WETH
//     tokenOut: '0x8B6b1DC75e232F3D41D26A8439B2141AEaf49663', // USDC
//     fee: BigInt('3000'), // 0.3%
//     amountIn: BigInt('1000000000000000000'), // 1 WETH
//     sqrtPriceLimitX96: BigInt(0), // No price limit
//   });

//   console.log('Quote Result:', {
//     amountOut: sqrtX96ToDecimalPrice(result.amountOut, 18, 18),
//     sqrtPriceX96After: sqrtX96ToDecimalPrice(result.sqrtPriceX96After, 18, 18),
//     initializedTicksCrossed: result.initializedTicksCrossed,
//     gasEstimate: result.gasEstimate,
//   });
// }

// main().catch(console.error);
