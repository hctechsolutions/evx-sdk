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
//     await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
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
//   await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
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

// Playground

// import { container } from 'tsyringe';
// import { setAllChain, setRPCProvider, TICK_BITMAP_INDEX } from './resources';

// function getBitmapIndex(tick: number, tickSpacing: number): number {
//     return Math.floor(tick / tickSpacing) >> 8;
// }

// async function playground() {
//   const rpc = container.resolve(RPC);

//   await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
//   await setAllChain('sepolia');

//   const query = container.resolve(GetPopulatedTicksQuery);
//   const bitmapIndexes: number[] = [];
//   let current = 0;
//   for (let index = TICK_BITMAP_INDEX.MIN; index <= TICK_BITMAP_INDEX.MAX; index++) {
//     current = getBitmapIndex(index, 200);
//     if (!bitmapIndexes.includes(current)) {
//         bitmapIndexes.push(current);
//     }
//   }

//   console.log(bitmapIndexes);

//   for (const index of bitmapIndexes) {
//     try {
//         const result = await query.execute({
//           pool: '0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F', // Replace with actual pool address
//           tickBitmapIndex: index
//         });

//         console.log('Populated Ticks:', result.populatedTicks);
//     } catch (error) {
//         console.error('Error:', error);
//     }
//   }
// }

// playground();
