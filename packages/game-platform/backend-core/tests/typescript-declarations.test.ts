import { describe, it, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('@platform/backend-core TypeScript Declarations', () => {
  const packageRoot = path.join(__dirname, '..');
  const distDir = path.join(packageRoot, 'dist');

  beforeAll(() => {
    // Build the package to generate declarations
    execSync('pnpm build', { cwd: packageRoot });
  });

  it('should generate TypeScript declaration files', () => {
    expect(fs.existsSync(distDir)).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'index.d.ts'))).toBe(true);
  });

  it('should export all main modules with proper types', () => {
    const indexDtsPath = path.join(distDir, 'index.d.ts');
    const indexDtsContent = fs.readFileSync(indexDtsPath, 'utf-8');

    // Check for main exports
    expect(indexDtsContent).toContain('createApp');
    expect(indexDtsContent).toContain('ApiError');
    expect(indexDtsContent).toContain('ValidationError');
    expect(indexDtsContent).toContain('errorHandler');
    expect(indexDtsContent).toContain('asyncHandler');
    expect(indexDtsContent).toContain('healthCheck');
    expect(indexDtsContent).toContain('requestLogger');
    expect(indexDtsContent).toContain('validate');
    expect(indexDtsContent).toContain('logger');
    expect(indexDtsContent).toContain('catchAsync');
  });

  it('should generate bundled output files', () => {
    // tsup generates bundled output files, not individual declaration files
    const outputFiles = [
      'index.js',      // CommonJS
      'index.mjs',     // ES modules
      'index.d.ts',    // TypeScript declarations
      'index.d.mts'    // ES module TypeScript declarations
    ];

    outputFiles.forEach(file => {
      const filePath = path.join(distDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('should export all expected types and functions', () => {
    const indexDtsPath = path.join(distDir, 'index.d.ts');
    const indexDtsContent = fs.readFileSync(indexDtsPath, 'utf-8');

    // Verify that all the expected exports are declared
    const expectedExports = [
      'createApp',
      'setupErrorHandling',
      'AppConfig',
      'errorHandler',
      'requestLogger',
      'healthCheck',
      'validate',
      'asyncHandler',
      'ApiError',
      'ValidationError',
      'logger',
      'catchAsync',
      'pick',
      'sendSuccess',
      'sendError',
      'sendPaginated',
      'toJSON',
      'paginate',
      'PaginateOptions',
      'PaginateResult',
      'ApiResponse',
      'ErrorResponse'
    ];

    expectedExports.forEach(exportName => {
      expect(indexDtsContent).toContain(exportName);
    });
  });

  it('should have correct package.json configuration', () => {
    const packageJsonPath = path.join(packageRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.types).toBe('dist/index.d.ts');
    expect(packageJson.main).toBe('dist/index.js');
    expect(packageJson.files).toContain('dist');
  });
});