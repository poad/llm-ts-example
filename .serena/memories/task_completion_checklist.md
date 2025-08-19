# Task Completion Checklist

## Before Committing Code

### 1. Code Quality Checks
```bash
# Run linting
pnpm lint

# Fix any linting issues
pnpm lint-fix

# Build the project to check for compilation errors
pnpm build
```

### 2. Testing
```bash
# Run tests if available
pnpm --filter <package-name> test

# Ensure all tests pass
```

### 3. Documentation
- [ ] Update README.md if functionality changed
- [ ] Add/update code comments for complex logic
- [ ] Ensure TypeScript types are properly documented

### 4. Dependencies
- [ ] Check if new dependencies are properly added to package.json
- [ ] Ensure version compatibility across packages
- [ ] Update pnpm-lock.yaml if needed

### 5. Git Operations
```bash
# Check status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new functionality"

# Push to remote
git push
```

## Specific Checks for LLM Examples

### 1. Environment Variables
- [ ] Ensure .env files are properly configured
- [ ] Check API keys and credentials are not committed
- [ ] Verify environment variable documentation

### 2. Model Configuration
- [ ] Test with different model providers if applicable
- [ ] Verify streaming/non-streaming configurations
- [ ] Check token limits and error handling

### 3. Agent Functionality
- [ ] Test agent responses with various inputs
- [ ] Verify tool integrations work correctly
- [ ] Check error handling for API failures

## Markdown Specific (for README updates)
```bash
# Install markdownlint if not available
npm install -g markdownlint-cli

# Check markdown files
markdownlint README.md

# Fix common issues automatically
markdownlint --fix README.md
```