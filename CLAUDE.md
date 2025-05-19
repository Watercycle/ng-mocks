# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ng-mocks is an Angular testing library that facilitates testing by helping to:
- Mock Components, Directives, Pipes, Modules, Services and Tokens
- Reduce boilerplate in tests
- Access declarations via a simple interface

The library supports Angular versions 5 through 20 with both Jasmine and Jest testing frameworks.

## Development Setup

The project uses Docker for development. To set up:

1. Ensure Docker and Docker Compose are installed
2. Run `sh ./compose.sh` to install dependencies

For local development without Docker:
1. Use `nvm use` to ensure the correct Node.js version
2. Run `npm install` to install dependencies

## Common Commands

### Building
- `npm run build` - Build the library
- `npm run build:dev` - Build in development mode
- `npm run build:all` - Lint, build and test the library

### Testing
- `npm run test` - Run tests with Karma
- `npm run test:debug` - Run tests in debug mode with Chrome browser
- `npm run test:watch` - Run tests in watch mode
- `npm run e2e` - Run end-to-end tests

### Linting and Formatting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run prettier:repo` - Format all files with Prettier
- `npm run prettier:check` - Check formatting with Prettier
- `npm run ts:check` - Type check TypeScript files

### Running a Single Test
To run a specific test file:
1. Use debug mode: `npm run test:debug`
2. Filter tests in Karma browser interface, or
3. For specific e2e tests: `cd e2e/[angular-version] && npm run test:jasmine` or `npm run test:jest`

## Code Architecture

### Project Structure
- `/libs/ng-mocks/src/` - Main library source code
- `/examples/` - Example usage patterns
- `/tests/` - Unit and integration tests
- `/e2e/` - End-to-end tests for different Angular versions
- `/docs/` - Documentation website source

### Core Components

1. **MockBuilder** - Creates TestBed configuration with specified real and mocked dependencies
   - Simplifies test setup using a fluent API

2. **MockRender** - Advanced component rendering for tests
   - Creates a test component that renders the tested component with desired inputs
   - Respects all lifecycle hooks and change detection

3. **ngMocks** - Helper utilities for interacting with mocked components
   - `ngMocks.find()` - Find elements in the DOM
   - `ngMocks.findInstance()` - Find component instances
   - `ngMocks.change()` - Change form control values
   - `ngMocks.trigger()` - Trigger events

4. **MockInstance** - Configure mock behavior before initialization
   - Useful for setting up spies and custom behavior

5. Core Mocking Functions:
   - `MockComponent` - Mock Angular components
   - `MockDirective` - Mock Angular directives
   - `MockPipe` - Mock Angular pipes
   - `MockModule` - Mock Angular modules
   - `MockProvider` - Mock services and other providers

## Testing Philosophy

ng-mocks follows these testing principles:
1. Only test what you need, mock everything else
2. Keep real components/services you're testing, mock their dependencies
3. Use MockBuilder to configure the testing module
4. Use MockRender to create components with inputs and test context

## Common Patterns

### Basic Test Setup
```typescript
describe('Component under test', () => {
  // Reset mock customizations after each test
  MockInstance.scope();

  beforeEach(() => {
    // Keep the component under test and needed modules, mock everything else
    return MockBuilder(
      TestedComponent,
      FeatureModule
    ).keep(ReactiveFormsModule);
  });

  it('should render correctly', () => {
    const fixture = MockRender(TestedComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
```

### Testing with Inputs and Outputs
```typescript
it('responds to input changes', () => {
  // Render with inputs
  const fixture = MockRender(TestedComponent, {
    inputValue: 'test value'
  });
  
  // Access the tested component
  const component = fixture.point.componentInstance;
  
  // Trigger outputs
  component.outputEvent.emit('test');
  
  // Update inputs
  fixture.componentInstance.inputValue = 'new value';
  fixture.detectChanges();
});
```