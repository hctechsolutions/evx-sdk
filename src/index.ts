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

// import { GetFeeAmountTickSpacingQuery } from './queries';
// import { setAllChain, setRPCProvider } from './resources';
// import { IGetFeeAmountTickSpacingQueryParams } from '@interfaces/queries/params/IGetFeeAmountTickSpacingQueryParams';


// (async () => {
//     await setRPCProvider('https://sepolia.infura.io/v3/bee828df1f514cbcaa66c72a9c18a4dd');
//     await setAllChain('sepolia');
    
//     const getFeeAmountTickSpacingQuery = container.resolve(GetFeeAmountTickSpacingQuery);
//     const params: IGetFeeAmountTickSpacingQueryParams = { fee: 3000 };
//     console.log('Result:', await getFeeAmountTickSpacingQuery.execute(params));
// })()
