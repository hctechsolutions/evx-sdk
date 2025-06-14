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
