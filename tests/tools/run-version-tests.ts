#!/usr/bin/env tsx

import { VersionManager } from '@tools/version-manager';

interface TestCase {
  name: string;
  branch: string;
  tags: string[];
  expected: string;
}

const testCases: TestCase[] = [
  {
    name: 'Main branch',
    branch: 'main',
    tags: ['1.2.3', '1.2.4-rc.1', '1.3.0-alpha.1'],
    expected: '1.2.3'
  },
  {
    name: 'Develop branch',
    branch: 'develop',
    tags: ['1.2.3', '1.2.4-rc.1', '1.3.0-alpha.1'],
    expected: '1.3.0-dev'
  },
  {
    name: 'Feature branch',
    branch: 'feature/new-api',
    tags: ['1.2.3', '1.2.4-rc.1', '1.3.0-alpha.1'],
    expected: '1.3.0-alpha.2'
  },
  {
    name: 'Release branch',
    branch: 'release/1.4.0',
    tags: ['1.2.3', '1.2.4-rc.1', '1.3.0-alpha.1'],
    expected: '1.4.0-rc.1'
  },
  {
    name: 'Hotfix branch',
    branch: 'hotfix/critical-bug',
    tags: ['1.2.3', '1.2.4-rc.1', '1.3.0-alpha.1'],
    expected: '1.2.3-hotfix.1'
  },
  {
    name: 'Bugfix branch',
    branch: 'bugfix/minor-issue',
    tags: ['1.2.3', '1.2.4-rc.1', '1.3.0-alpha.1'],
    expected: '1.2.3-alpha.1'
  },
  {
    name: 'No existing tags',
    branch: 'main',
    tags: [],
    expected: '1.0.0'
  },
  {
    name: 'Unknown branch',
    branch: 'unknown/branch',
    tags: ['1.2.3'],
    expected: '1.2.3-unknown'
  }
];

function runTest(testCase: TestCase): boolean {
  try {
    const manager = new VersionManager({
      branch: testCase.branch,
      tags: testCase.tags,
      useGitTags: false,
      simulate: true
    });

    const result = manager.generateVersion();
    const passed = result === testCase.expected;

    console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
    console.log(`   Branch: ${testCase.branch}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got: ${result}`);
    
    if (!passed) {
      console.log(`   ❌ FAILED`);
    }
    
    console.log();
    return passed;
  } catch (error) {
    console.log(`❌ ${testCase.name} - ERROR: ${error}`);
    console.log();
    return false;
  }
}

function main() {
  console.log('🧪 Running TypeScript Version Manager Tests');
  console.log('=' .repeat(50));
  console.log();

  let passed = 0;
  const total = testCases.length;

  for (const testCase of testCases) {
    if (runTest(testCase)) {
      passed++;
    }
  }

  console.log('=' .repeat(50));
  console.log(`Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Version manager is working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

if (process.argv[1]?.includes('run-version-tests')) {
  main();
} 