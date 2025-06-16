#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export interface VersionManagerOptions {
  branch: string;
  packagePath?: string;
  simulate?: boolean;
  tags?: string[];
  useGitTags?: boolean;
}

interface PackageJson {
  name: string;
  version: string;
  [key: string]: any;
}

const INITIAL_VERSION = '1.0.0';

export class VersionManager {
  private options: VersionManagerOptions;
  private packagePath: string;

  constructor(options: VersionManagerOptions) {
    this.options = options;
    this.packagePath = options.packagePath || resolve(process.cwd(), 'package.json');
  }

  /**
   * Get existing tags from Git or use provided tags
   */
  private getTags(): string[] {
    if (this.options.simulate && this.options.tags) {
      return this.options.tags;
    }

    if (this.options.useGitTags) {
      try {
        const output = execSync('git tag --list', { encoding: 'utf-8', cwd: process.cwd() });
        return output.trim().split('\n').filter(tag => tag.length > 0);
      } catch (error) {
        console.warn('Failed to get Git tags, using empty list');
        return [];
      }
    }

    return this.options.tags || [];
  }

  /**
   * Extract base version triples from tags, ignoring any suffix
   */
  private extractBaseVersions(tags: string[], stableOnly = false): Array<[number, number, number]> {
    const baseVersions: Array<[number, number, number]> = [];

    // Stable tags: X.Y.Z
    for (const tag of tags) {
      const match = tag.match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (match) {
        baseVersions.push([parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]);
      }
    }

    // RC tags: X.Y.Z-rc.N -> treat base X.Y.Z (only if not stableOnly)
    if (!stableOnly) {
      for (const tag of tags) {
        const match = tag.match(/^(\d+)\.(\d+)\.(\d+)-rc\.\d+$/);
        if (match) {
          baseVersions.push([parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]);
        }
      }
    }

    return baseVersions;
  }

  /**
   * Get the highest base version based on branch rules
   */
  private getBaseVersion(branch: string, tags: string[]): string {
    // For main, hotfix, and bugfix branches, only consider stable releases
    if (branch === 'main' || branch.startsWith('hotfix/') || branch.startsWith('bugfix/')) {
      const stableVersions: Array<[number, number, number]> = [];
      for (const tag of tags) {
        const match = tag.match(/^(\d+)\.(\d+)\.(\d+)$/);
        if (match) {
          stableVersions.push([parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]);
        }
      }

      if (stableVersions.length > 0) {
        const maxVersion = stableVersions.reduce((max, current) => {
          return (current[0] > max[0] || 
                  (current[0] === max[0] && current[1] > max[1]) ||
                  (current[0] === max[0] && current[1] === max[1] && current[2] > max[2])) 
                 ? current : max;
        });
        return `${maxVersion[0]}.${maxVersion[1]}.${maxVersion[2]}`;
      }
      return INITIAL_VERSION;
    }

    // For develop, feature, and release branches, consider all versions including pre-releases
    const baseVersions = this.extractBaseVersions(tags);
    if (baseVersions.length > 0) {
      const maxVersion = baseVersions.reduce((max, current) => {
        return (current[0] > max[0] || 
                (current[0] === max[0] && current[1] > max[1]) ||
                (current[0] === max[0] && current[1] === max[1] && current[2] > max[2])) 
               ? current : max;
      });
      return `${maxVersion[0]}.${maxVersion[1]}.${maxVersion[2]}`;
    }

    return INITIAL_VERSION;
  }

  /**
   * Determine next numeric suffix for rc, alpha, or hotfix on given base
   */
  private getNextSuffix(base: string, tags: string[], label: string): string {
    const pattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-${label}\\.(\\d+)$`);
    const nums = tags
      .map(tag => {
        const match = tag.match(pattern);
        return match ? parseInt(match[1]) : null;
      })
      .filter(num => num !== null) as number[];

    const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `${label}.${nextNum}`;
  }

  /**
   * Compute new version string based on GitFlow branch type
   */
  private computeVersion(branch: string, base: string, tags: string[]): string {
    const [major, minor, patch] = base.split('.').map(Number);

    // GitFlow: main branch should only receive final versions from release/hotfix merges
    if (branch === 'main') {
      return `${major}.${minor}.${patch}`;
    }

    // GitFlow: develop is the integration branch for features
    if (branch === 'develop') {
      const nextMinor = minor + 1;
      return `${major}.${nextMinor}.0-dev`;
    }

    // GitFlow: release branches prepare for production
    if (branch.startsWith('release/')) {
      const match = branch.match(/release\/(\d+)\.(\d+)\.(\d+)/);
      if (!match) {
        throw new Error('Invalid release branch format. Use release/X.Y.Z');
      }
      const releaseBase = `${match[1]}.${match[2]}.${match[3]}`;
      return `${releaseBase}-${this.getNextSuffix(releaseBase, tags, 'rc')}`;
    }

    // GitFlow: hotfix branches fix production issues
    if (branch.startsWith('hotfix/')) {
      const hotfixBase = `${major}.${minor}.${patch}`;
      return `${hotfixBase}-${this.getNextSuffix(hotfixBase, tags, 'hotfix')}`;
    }

    // GitFlow: bugfix branches are like hotfixes but for develop
    if (branch.startsWith('bugfix/')) {
      const bugfixBase = `${major}.${minor}.${patch}`;
      return `${bugfixBase}-${this.getNextSuffix(bugfixBase, tags, 'alpha')}`;
    }

    // GitFlow: feature branches develop new functionality
    if (branch.startsWith('feature/')) {
      const nextMinor = minor + 1;
      const featureBase = `${major}.${nextMinor}.0`;
      return `${featureBase}-${this.getNextSuffix(featureBase, tags, 'alpha')}`;
    }

    // Fallback for unknown branches
    return `${major}.${minor}.${patch}-unknown`;
  }

  /**
   * Generate new version based on branch and existing tags
   */
  generateVersion(): string {
    const tags = this.getTags();
    const base = this.getBaseVersion(this.options.branch, tags);
    return this.computeVersion(this.options.branch, base, tags);
  }

  /**
   * Read current package.json
   */
  private readPackageJson(): PackageJson {
    try {
      const content = readFileSync(this.packagePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read package.json: ${error}`);
    }
  }

  /**
   * Write updated package.json
   */
  private writePackageJson(packageJson: PackageJson): void {
    try {
      const content = JSON.stringify(packageJson, null, 2) + '\n';
      writeFileSync(this.packagePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write package.json: ${error}`);
    }
  }

  /**
   * Update package.json version
   */
  updatePackageVersion(): { oldVersion: string; newVersion: string } {
    const packageJson = this.readPackageJson();
    const oldVersion = packageJson.version;
    const newVersion = this.generateVersion();

    if (this.options.simulate) {
      console.log(`[SIMULATE] Would update version from ${oldVersion} to ${newVersion}`);
      return { oldVersion, newVersion };
    }

    packageJson.version = newVersion;
    this.writePackageJson(packageJson);

    console.log(`✅ Updated package.json version: ${oldVersion} -> ${newVersion}`);
    return { oldVersion, newVersion };
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion(): string {
    const packageJson = this.readPackageJson();
    return packageJson.version;
  }
}

// CLI interface
if (process.argv[1]?.includes('version-manager')) {
  const args = process.argv.slice(2);
  const options: VersionManagerOptions = {
    branch: '',
    simulate: false,
    useGitTags: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--branch':
        options.branch = args[++i];
        break;
      case '--package-path':
        options.packagePath = args[++i];
        break;
      case '--simulate':
        options.simulate = true;
        break;
      case '--tags':
        options.tags = JSON.parse(args[++i]);
        options.useGitTags = false;
        break;
      case '--help':
        console.log(`
Usage: tsx version-manager.ts [options]

Options:
  --branch <name>        Branch name (required)
  --package-path <path>  Path to package.json (default: ./package.json)
  --simulate             Simulate only, don't update files
  --tags <json>          JSON array of tags (for testing)
  --help                 Show this help

Examples:
  tsx version-manager.ts --branch main
  tsx version-manager.ts --branch feature/new-api --simulate
  tsx version-manager.ts --branch release/1.2.0 --tags '["1.1.0", "1.1.1"]'
        `);
        process.exit(0);
    }
  }

  if (!options.branch) {
    console.error('❌ Error: --branch is required');
    process.exit(1);
  }

  try {
    const manager = new VersionManager(options);
    manager.updatePackageVersion();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
} 