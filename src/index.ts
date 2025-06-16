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

// Interfaces
export * from './interfaces';

// Listeners
export * from './listeners';


// Playground

import { container } from 'tsyringe';
import { setAllChain, setRPCProvider } from './resources';
import { PoolCreatedListener } from './listeners';

async function playground() {
  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');

  const listener = container.resolve(PoolCreatedListener);

  // Example: Listen for new pool creation events
  console.log('Starting PoolCreated event listener...');
  
  await listener.start(async (event) => {
    console.log('🎉 New pool created!');
    console.log('Token0:', event.token0);
    console.log('Token1:', event.token1);
    console.log('Fee:', event.fee);
    console.log('Tick Spacing:', event.tickSpacing);
    console.log('Pool Address:', event.pool);
    console.log('Block Number:', event.blockNumber);
    console.log('Transaction Hash:', event.transactionHash);
    console.log('---');
  });

  // Example: Get historical events
  try {
    console.log('Fetching historical PoolCreated events...');
    const historicalEvents = await listener.getHistoricalEvents(5000000); // From block 5M
    console.log(`Found ${historicalEvents.length} historical pool creation events`);
    
    for (const historicalEvent of historicalEvents) {
      console.log('\nPool created:', historicalEvent);
    }
  } catch (error) {
    console.error('Error fetching historical events:', error);
  }

  // Keep the process running to listen for events
  console.log('Listening for events... Press Ctrl+C to stop');
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nStopping listener...');
    listener.stop();
    process.exit(0);
  });
}

playground();
