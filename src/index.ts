import 'reflect-metadata';

import { config } from 'dotenv';
config();

// Commands
export * from './commands';

// Contracts
export * from './contracts';

// Providers
export * from './providers';

// ------------------------------------------------------

import { container } from 'tsyringe';
import { ListPoolsCommand } from 'commands/factory';

const command = container.resolve(ListPoolsCommand);
const pools = await command.execute();
console.log("Verbosity added ~ :22 ~ pools:", pools);
