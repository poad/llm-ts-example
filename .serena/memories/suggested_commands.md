# Suggested Commands

## Development Commands

### Package Management
```bash
# Install dependencies for all packages
pnpm install

# Install dependencies for specific package
pnpm --filter <package-name> install
```

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter <package-name> build
```

### Linting and Formatting
```bash
# Lint all packages
pnpm lint

# Fix linting issues in all packages
pnpm lint-fix

# Lint specific package
pnpm --filter <package-name> lint
```

### Testing
```bash
# Run tests (in packages that have tests)
pnpm --filter <package-name> test

# Run tests in watch mode
pnpm --filter <package-name> test:watch
```

### Running Examples
```bash
# Run development server (for packages with dev script)
pnpm --filter <package-name> dev

# Run built application
pnpm --filter <package-name> start
```

### Cleaning
```bash
# Clean all packages
pnpm clean

# Clean specific package
pnpm --filter <package-name> clean
```

## System Commands (macOS)
```bash
# File operations
ls -la          # List files with details
find . -name    # Find files by name
grep -r         # Search in files recursively

# Git operations
git status      # Check repository status
git add .       # Stage all changes
git commit -m   # Commit with message
git push        # Push to remote

# Process management
ps aux          # List running processes
kill -9 <pid>   # Force kill process
```