import 'reflect-metadata';
import { setAllChain, setRPCProvider } from './resources';
import { container } from 'tsyringe';
import { 
  MintListener, 
  BurnListener, 
  CollectListener, 
  CollectProtocolListener, 
  FlashListener, 
  InitializeObservationListener,
  IncreaseObservationCardinalityNextListener,
  SetFeeProtocolListener,
  SwapListener
} from '@listeners/pool';
import { 
  IMintEvent, 
  IBurnEvent, 
  ICollectEvent, 
  ICollectProtocolEvent, 
  IFlashEvent, 
  IInitializeObservationEvent,
  IIncreaseObservationCardinalityNextEvent,
  ISetFeeProtocolEvent,
  ISwapEvent
} from '@interfaces/events';

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



async function getHistoricalMintEvents() {
  console.log('=== Obtendo Eventos Históricos de Mint ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const mintListener = container.resolve(MintListener);

  mintListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  mintListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  mintListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de mint do bloco 0 até o bloco mais recente
    const events = await mintListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de mint:`);
    
    events.forEach((event: IMintEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Sender: ${event.sender}`);
      console.log(`  Owner: ${event.owner}`);
      console.log(`  Tick Lower: ${event.tickLower}`);
      console.log(`  Tick Upper: ${event.tickUpper}`);
      console.log(`  Amount: ${event.amount.toString()}`);
      console.log(`  Amount0: ${event.amount0.toString()}`);
      console.log(`  Amount1: ${event.amount1.toString()}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new mint events
  console.log('\n=== Iniciando Listener para Novos Eventos de Mint ===');
  
  await mintListener.start(async (event: IMintEvent) => {
    console.log('\n🆕 Novo evento de Mint detectado:');
    console.log(`  Sender: ${event.sender}`);
    console.log(`  Owner: ${event.owner}`);
    console.log(`  Tick Lower: ${event.tickLower}`);
    console.log(`  Tick Upper: ${event.tickUpper}`);
    console.log(`  Amount: ${event.amount.toString()}`);
    console.log(`  Amount0: ${event.amount0.toString()}`);
    console.log(`  Amount1: ${event.amount1.toString()}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de mint...');
  console.log(`📡 Monitorando pools: ${mintListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalBurnEvents() {
  console.log('\n=== Obtendo Eventos Históricos de Burn ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const burnListener = container.resolve(BurnListener);

  burnListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  burnListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  burnListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de burn do bloco 0 até o bloco mais recente
    const events = await burnListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de burn:`);
    
    events.forEach((event: IBurnEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Owner: ${event.owner}`);
      console.log(`  Tick Lower: ${event.tickLower}`);
      console.log(`  Tick Upper: ${event.tickUpper}`);
      console.log(`  Amount: ${event.amount.toString()}`);
      console.log(`  Amount0: ${event.amount0.toString()}`);
      console.log(`  Amount1: ${event.amount1.toString()}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new burn events
  console.log('\n=== Iniciando Listener para Novos Eventos de Burn ===');
  
  await burnListener.start(async (event: IBurnEvent) => {
    console.log('\n🔥 Novo evento de Burn detectado:');
    console.log(`  Owner: ${event.owner}`);
    console.log(`  Tick Lower: ${event.tickLower}`);
    console.log(`  Tick Upper: ${event.tickUpper}`);
    console.log(`  Amount: ${event.amount.toString()}`);
    console.log(`  Amount0: ${event.amount0.toString()}`);
    console.log(`  Amount1: ${event.amount1.toString()}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de burn...');
  console.log(`📡 Monitorando pools: ${burnListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalCollectEvents() {
  console.log('\n=== Obtendo Eventos Históricos de Collect ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const collectListener = container.resolve(CollectListener);

  collectListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  collectListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  collectListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de collect do bloco 0 até o bloco mais recente
    const events = await collectListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de collect:`);
    
    events.forEach((event: ICollectEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Owner: ${event.owner}`);
      console.log(`  Recipient: ${event.recipient}`);
      console.log(`  Tick Lower: ${event.tickLower}`);
      console.log(`  Tick Upper: ${event.tickUpper}`);
      console.log(`  Amount0: ${event.amount0.toString()}`);
      console.log(`  Amount1: ${event.amount1.toString()}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new collect events
  console.log('\n=== Iniciando Listener para Novos Eventos de Collect ===');
  
  await collectListener.start(async (event: ICollectEvent) => {
    console.log('\n💰 Novo evento de Collect detectado:');
    console.log(`  Owner: ${event.owner}`);
    console.log(`  Recipient: ${event.recipient}`);
    console.log(`  Tick Lower: ${event.tickLower}`);
    console.log(`  Tick Upper: ${event.tickUpper}`);
    console.log(`  Amount0: ${event.amount0.toString()}`);
    console.log(`  Amount1: ${event.amount1.toString()}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de collect...');
  console.log(`📡 Monitorando pools: ${collectListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalCollectProtocolEvents() {
  console.log('\n=== Obtendo Eventos Históricos de CollectProtocol ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const collectProtocolListener = container.resolve(CollectProtocolListener);

  collectProtocolListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  collectProtocolListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  collectProtocolListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de collect protocol do bloco 0 até o bloco mais recente
    const events = await collectProtocolListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de collect protocol:`);
    
    events.forEach((event: ICollectProtocolEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Sender: ${event.sender}`);
      console.log(`  Recipient: ${event.recipient}`);
      console.log(`  Amount0: ${event.amount0.toString()}`);
      console.log(`  Amount1: ${event.amount1.toString()}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new collect protocol events
  console.log('\n=== Iniciando Listener para Novos Eventos de CollectProtocol ===');
  
  await collectProtocolListener.start(async (event: ICollectProtocolEvent) => {
    console.log('\n🏛️ Novo evento de CollectProtocol detectado:');
    console.log(`  Sender: ${event.sender}`);
    console.log(`  Recipient: ${event.recipient}`);
    console.log(`  Amount0: ${event.amount0.toString()}`);
    console.log(`  Amount1: ${event.amount1.toString()}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de collect protocol...');
  console.log(`📡 Monitorando pools: ${collectProtocolListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalFlashEvents() {
  console.log('\n=== Obtendo Eventos Históricos de Flash ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const flashListener = container.resolve(FlashListener);

  flashListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  flashListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  flashListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de flash do bloco 0 até o bloco mais recente
    const events = await flashListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de flash:`);
    
    events.forEach((event: IFlashEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Sender: ${event.sender}`);
      console.log(`  Recipient: ${event.recipient}`);
      console.log(`  Amount0: ${event.amount0.toString()}`);
      console.log(`  Amount1: ${event.amount1.toString()}`);
      console.log(`  Paid0: ${event.paid0.toString()}`);
      console.log(`  Paid1: ${event.paid1.toString()}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new flash events
  console.log('\n=== Iniciando Listener para Novos Eventos de Flash ===');
  
  await flashListener.start(async (event: IFlashEvent) => {
    console.log('\n⚡ Novo evento de Flash detectado:');
    console.log(`  Sender: ${event.sender}`);
    console.log(`  Recipient: ${event.recipient}`);
    console.log(`  Amount0: ${event.amount0.toString()}`);
    console.log(`  Amount1: ${event.amount1.toString()}`);
    console.log(`  Paid0: ${event.paid0.toString()}`);
    console.log(`  Paid1: ${event.paid1.toString()}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de flash...');
  console.log(`📡 Monitorando pools: ${flashListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalInitializeObservationEvents() {
  console.log('\n=== Obtendo Eventos Históricos de InitializeObservation ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const initializeObservationListener = container.resolve(InitializeObservationListener);

  initializeObservationListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  initializeObservationListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  initializeObservationListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de initialize observation do bloco 0 até o bloco mais recente
    const events = await initializeObservationListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de initialize observation:`);
    
    events.forEach((event: IInitializeObservationEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  SqrtPriceX96: ${event.sqrtPriceX96.toString()}`);
      console.log(`  Tick: ${event.tick}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new initialize observation events
  console.log('\n=== Iniciando Listener para Novos Eventos de InitializeObservation ===');
  
  await initializeObservationListener.start(async (event: IInitializeObservationEvent) => {
    console.log('\n🔍 Novo evento de InitializeObservation detectado:');
    console.log(`  SqrtPriceX96: ${event.sqrtPriceX96.toString()}`);
    console.log(`  Tick: ${event.tick}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de initialize observation...');
  console.log(`📡 Monitorando pools: ${initializeObservationListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalIncreaseObservationCardinalityNextEvents() {
  console.log('\n=== Obtendo Eventos Históricos de IncreaseObservationCardinalityNext ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const increaseObservationCardinalityNextListener = container.resolve(IncreaseObservationCardinalityNextListener);

  increaseObservationCardinalityNextListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  increaseObservationCardinalityNextListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  increaseObservationCardinalityNextListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de increase observation cardinality next do bloco 0 até o bloco mais recente
    const events = await increaseObservationCardinalityNextListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de increase observation cardinality next:`);
    
    events.forEach((event: IIncreaseObservationCardinalityNextEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Observation Cardinality Next Old: ${event.observationCardinalityNextOld}`);
      console.log(`  Observation Cardinality Next New: ${event.observationCardinalityNextNew}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new increase observation cardinality next events
  console.log('\n=== Iniciando Listener para Novos Eventos de IncreaseObservationCardinalityNext ===');
  
  await increaseObservationCardinalityNextListener.start(async (event: IIncreaseObservationCardinalityNextEvent) => {
    console.log('\n📊 Novo evento de IncreaseObservationCardinalityNext detectado:');
    console.log(`  Observation Cardinality Next Old: ${event.observationCardinalityNextOld}`);
    console.log(`  Observation Cardinality Next New: ${event.observationCardinalityNextNew}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de increase observation cardinality next...');
  console.log(`📡 Monitorando pools: ${increaseObservationCardinalityNextListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalSetFeeProtocolEvents() {
  console.log('\n=== Obtendo Eventos Históricos de SetFeeProtocol ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const setFeeProtocolListener = container.resolve(SetFeeProtocolListener);

  setFeeProtocolListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  setFeeProtocolListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  setFeeProtocolListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de set fee protocol do bloco 0 até o bloco mais recente
    const events = await setFeeProtocolListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de set fee protocol:`);
    
    events.forEach((event: ISetFeeProtocolEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Fee Protocol 0 Old: ${event.feeProtocol0Old}`);
      console.log(`  Fee Protocol 1 Old: ${event.feeProtocol1Old}`);
      console.log(`  Fee Protocol 0 New: ${event.feeProtocol0New}`);
      console.log(`  Fee Protocol 1 New: ${event.feeProtocol1New}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new set fee protocol events
  console.log('\n=== Iniciando Listener para Novos Eventos de SetFeeProtocol ===');
  
  await setFeeProtocolListener.start(async (event: ISetFeeProtocolEvent) => {
    console.log('\n💰 Novo evento de SetFeeProtocol detectado:');
    console.log(`  Fee Protocol 0 Old: ${event.feeProtocol0Old}`);
    console.log(`  Fee Protocol 1 Old: ${event.feeProtocol1Old}`);
    console.log(`  Fee Protocol 0 New: ${event.feeProtocol0New}`);
    console.log(`  Fee Protocol 1 New: ${event.feeProtocol1New}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de set fee protocol...');
  console.log(`📡 Monitorando pools: ${setFeeProtocolListener.getMonitoredPools().join(', ')}`);
}

async function getHistoricalSwapEvents() {
  console.log('\n=== Obtendo Eventos Históricos de Swap ===');

  await setRPCProvider('https://sepolia.infura.io/v3/YOUR_KEY');
  await setAllChain('sepolia');
  
  const swapListener = container.resolve(SwapListener);

  swapListener.addPool('0x882dB66537B0256e62cd7abf02B5bc9519204D66');
  swapListener.addPool('0x7A7c0571A89b01dF4EBBc70e95B9a6c19DC7571F');
  swapListener.addPool('0x7Fc01B2d929Edcad3d3a05b4B7A511ACA1C66aD9');
  
  try {
    // Obter eventos de swap do bloco 0 até o bloco mais recente
    const events = await swapListener.getHistoricalEvents(0);
    
    console.log(`Encontrados ${events.length} eventos de swap:`);
    
    events.forEach((event: ISwapEvent, index: number) => {
      console.log(`\nEvento ${index + 1}:`);
      console.log(`  Sender: ${event.sender}`);
      console.log(`  Recipient: ${event.recipient}`);
      console.log(`  Amount0: ${event.amount0.toString()}`);
      console.log(`  Amount1: ${event.amount1.toString()}`);
      console.log(`  SqrtPriceX96: ${event.sqrtPriceX96.toString()}`);
      console.log(`  Liquidity: ${event.liquidity.toString()}`);
      console.log(`  Tick: ${event.tick}`);
      console.log(`  Pool Address: ${event.poolAddress}`);
      console.log(`  Block Number: ${event.blockNumber}`);
      console.log(`  Transaction Hash: ${event.transactionHash}`);
      console.log(`  Log Index: ${event.logIndex}`);
    });
    
  } catch (error) {
    console.error('Erro ao obter eventos históricos:', error);
  }

  // Start listening for new swap events
  console.log('\n=== Iniciando Listener para Novos Eventos de Swap ===');
  
  await swapListener.start(async (event: ISwapEvent) => {
    console.log('\n🔄 Novo evento de Swap detectado:');
    console.log(`  Sender: ${event.sender}`);
    console.log(`  Recipient: ${event.recipient}`);
    console.log(`  Amount0: ${event.amount0.toString()}`);
    console.log(`  Amount1: ${event.amount1.toString()}`);
    console.log(`  SqrtPriceX96: ${event.sqrtPriceX96.toString()}`);
    console.log(`  Liquidity: ${event.liquidity.toString()}`);
    console.log(`  Tick: ${event.tick}`);
    console.log(`  Pool Address: ${event.poolAddress}`);
    console.log(`  Block Number: ${event.blockNumber}`);
    console.log(`  Transaction Hash: ${event.transactionHash}`);
    console.log(`  Log Index: ${event.logIndex}`);
  });

  console.log('✅ Listener iniciado. Aguardando novos eventos de swap...');
  console.log(`📡 Monitorando pools: ${swapListener.getMonitoredPools().join(', ')}`);
}

// Execute all listeners
getHistoricalMintEvents();
// getHistoricalBurnEvents();
// getHistoricalCollectEvents();
// getHistoricalCollectProtocolEvents();
// getHistoricalFlashEvents();
// getHistoricalInitializeObservationEvents();
// getHistoricalIncreaseObservationCardinalityNextEvents();
// getHistoricalSetFeeProtocolEvents();
// getHistoricalSwapEvents();