# Code Style and Conventions

## TypeScript Configuration
- **Module System**: ES modules (`"type": "module"`)
- **Target**: Modern ES versions
- **Strict Mode**: Enabled for type safety

## Linting and Code Quality
- **ESLint**: Used for code linting with TypeScript support
- **Configuration**: Modern ESLint flat config format
- **Plugins**: 
  - @typescript-eslint for TypeScript-specific rules
  - @stylistic/eslint-plugin for code formatting
  - eslint-plugin-import for import/export rules
  - eslint-plugin-promise for Promise handling
  - @vitest/eslint-plugin for test files

## File Organization
- **Source Code**: Located in `src/` directory
- **Entry Point**: `src/index.ts`
- **Configuration Files**: Root level (eslint.config.js, tsconfig.json, etc.)

## Naming Conventions
- **Files**: kebab-case for directories and files
- **Variables/Functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase with descriptive names

## Import/Export Style
- **Imports**: Use explicit imports with proper paths
- **Exports**: Prefer named exports over default exports
- **Path Resolution**: Use TypeScript path mapping when available

## Error Handling
- **Async/Await**: Preferred over Promises with .then()
- **Try/Catch**: Comprehensive error handling with specific error types
- **Logging**: Console logging for development, structured logging for production

## Documentation
- **README.md**: Each package should have comprehensive documentation
- **Code Comments**: JSDoc style for functions and classes
- **Type Annotations**: Explicit typing preferred over inference where clarity is needed