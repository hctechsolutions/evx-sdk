import { VersionManager } from '@tools/version-manager';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Mock file operations for testing
const mockPackageJson = {
  name: 'test-package',
  version: '1.0.0',
  description: 'Test package'
};

describe('VersionManager', () => {
  const testPackagePath = resolve(__dirname, 'test-package.json');
  
  beforeEach(() => {
    // Create a test package.json file
    writeFileSync(testPackagePath, JSON.stringify(mockPackageJson, null, 2));
  });

  afterEach(() => {
    // Clean up test file
    if (existsSync(testPackagePath)) {
      require('fs').unlinkSync(testPackagePath);
    }
  });

  describe('Version Generation', () => {
    const testTags = ['1.2.3', '1.2.4-rc.1', '1.3.0-alpha.1'];

    it('should generate correct version for main branch', () => {
      const manager = new VersionManager({
        branch: 'main',
        packagePath: testPackagePath,
        tags: testTags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.2.3');
    });

    it('should generate correct version for develop branch', () => {
      const manager = new VersionManager({
        branch: 'develop',
        packagePath: testPackagePath,
        tags: testTags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.3.0-dev');
    });

    it('should generate correct version for feature branch', () => {
      const manager = new VersionManager({
        branch: 'feature/new-api',
        packagePath: testPackagePath,
        tags: testTags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.3.0-alpha.2');
    });

    it('should generate correct version for release branch', () => {
      const manager = new VersionManager({
        branch: 'release/1.4.0',
        packagePath: testPackagePath,
        tags: testTags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.4.0-rc.1');
    });

    it('should generate correct version for hotfix branch', () => {
      const manager = new VersionManager({
        branch: 'hotfix/critical-bug',
        packagePath: testPackagePath,
        tags: testTags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.2.3-hotfix.1');
    });

    it('should generate correct version for bugfix branch', () => {
      const manager = new VersionManager({
        branch: 'bugfix/minor-issue',
        packagePath: testPackagePath,
        tags: testTags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.2.3-alpha.1');
    });

    it('should handle initial version when no tags exist', () => {
      const manager = new VersionManager({
        branch: 'main',
        packagePath: testPackagePath,
        tags: [],
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.0.0');
    });

    it('should handle unknown branch types', () => {
      const manager = new VersionManager({
        branch: 'unknown/branch',
        packagePath: testPackagePath,
        tags: testTags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.2.4-unknown');
    });
  });

  describe('Package.json Operations', () => {
    it('should read current version from package.json', () => {
      const manager = new VersionManager({
        branch: 'main',
        packagePath: testPackagePath,
        useGitTags: false
      });

      const version = manager.getCurrentVersion();
      expect(version).toBe('1.0.0');
    });

    it('should update package.json version', () => {
      const manager = new VersionManager({
        branch: 'develop',
        packagePath: testPackagePath,
        tags: ['1.2.3'],
        useGitTags: false
      });

      const { oldVersion, newVersion } = manager.updatePackageVersion();
      
      expect(oldVersion).toBe('1.0.0');
      expect(newVersion).toBe('1.3.0-dev');

      // Verify file was actually updated
      const updatedPackage = JSON.parse(readFileSync(testPackagePath, 'utf-8'));
      expect(updatedPackage.version).toBe('1.3.0-dev');
    });

    it('should simulate version update without changing file', () => {
      const manager = new VersionManager({
        branch: 'feature/test',
        packagePath: testPackagePath,
        tags: ['1.2.3'],
        useGitTags: false,
        simulate: true
      });

      const { oldVersion, newVersion } = manager.updatePackageVersion();
      
      expect(oldVersion).toBe('1.0.0');
      expect(newVersion).toBe('1.3.0-alpha.1');

      // Verify file was NOT changed
      const packageAfter = JSON.parse(readFileSync(testPackagePath, 'utf-8'));
      expect(packageAfter.version).toBe('1.0.0');
    });

    it('should preserve other package.json fields when updating version', () => {
      const manager = new VersionManager({
        branch: 'main',
        packagePath: testPackagePath,
        tags: ['1.2.3'],
        useGitTags: false
      });

      manager.updatePackageVersion();

      const updatedPackage = JSON.parse(readFileSync(testPackagePath, 'utf-8'));
      expect(updatedPackage.name).toBe('test-package');
      expect(updatedPackage.description).toBe('Test package');
      expect(updatedPackage.version).toBe('1.2.3');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid release branch format', () => {
      const manager = new VersionManager({
        branch: 'release/invalid',
        packagePath: testPackagePath,
        tags: [],
        useGitTags: false
      });

      expect(() => manager.generateVersion()).toThrow('Invalid release branch format');
    });

    it('should throw error when package.json cannot be read', () => {
      const manager = new VersionManager({
        branch: 'main',
        packagePath: '/nonexistent/package.json',
        useGitTags: false
      });

      expect(() => manager.getCurrentVersion()).toThrow('Failed to read package.json');
    });
  });

  describe('Suffix Increment Logic', () => {
    it('should increment existing alpha versions', () => {
      const tags = ['1.3.0-alpha.1', '1.3.0-alpha.2', '1.2.3'];
      const manager = new VersionManager({
        branch: 'feature/another-feature',
        packagePath: testPackagePath,
        tags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.3.0-alpha.3');
    });

    it('should increment existing rc versions', () => {
      const tags = ['1.4.0-rc.1', '1.4.0-rc.2', '1.2.3'];
      const manager = new VersionManager({
        branch: 'release/1.4.0',
        packagePath: testPackagePath,
        tags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.4.0-rc.3');
    });

    it('should increment existing hotfix versions', () => {
      const tags = ['1.2.3-hotfix.1', '1.2.3'];
      const manager = new VersionManager({
        branch: 'hotfix/another-fix',
        packagePath: testPackagePath,
        tags,
        useGitTags: false
      });

      const version = manager.generateVersion();
      expect(version).toBe('1.2.3-hotfix.2');
    });
  });
}); 