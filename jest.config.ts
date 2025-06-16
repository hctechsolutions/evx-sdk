import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage',
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  testMatch: [
    '**/tests/**/*.spec.ts',
  ],

  moduleNameMapper: {
    '^@interfaces': '<rootDir>/src/interfaces/index.ts',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',

    '^@contracts': '<rootDir>/src/contracts/index.ts',
    '^@contracts/(.*)$': '<rootDir>/src/contracts/$1',

    '^@providers': '<rootDir>/src/providers/index.ts',
    '^@providers/(.*)$': '<rootDir>/src/providers/$1',

    '^@resources': '<rootDir>/src/resources/index.ts',
    '^@resources/(.*)$': '<rootDir>/src/resources/$1',

    '^@commands': '<rootDir>/src/commands/index.ts',
    '^@commands/(.*)$': '<rootDir>/src/commands/$1',

    '^@queries': '<rootDir>/src/queries/index.ts',
    '^@queries/(.*)$': '<rootDir>/src/queries/$1',

    '^@utils': '<rootDir>/src/utils/index.ts',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',

    '^@abis/(.*)$': '<rootDir>/src/abis/$1',

    '^@listeners': '<rootDir>/src/listeners/index.ts',
    '^@listeners/(.*)$': '<rootDir>/src/listeners/$1',

    '^@tools': '<rootDir>/tools/index.ts',
    '^@tools/(.*)$': '<rootDir>/tools/$1'
  },

  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};

export default config;
