# Test Infrastructure Setup

This document describes the complete test infrastructure implemented for the Sankhya Products Dashboard.

## Overview

The project uses a comprehensive testing setup with:

- **Vitest** as the test runner
- **React Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking
- **@testing-library/user-event** for user interaction simulation
- **Coverage reporting** with Vitest's built-in coverage

## Scripts

Available npm scripts for testing:

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode (alias for test)
pnpm test:watch
```

## Configuration Files

### `vitest.config.ts`

Main Vitest configuration with:

- jsdom environment for DOM testing
- Path aliases (`@/` for `src/`)
- Coverage configuration with 70% thresholds
- Global test setup file

### `src/test/setup.ts`

Global test setup with:

- MSW server setup and teardown
- Mock API handlers for all endpoints
- Mock implementations for browser APIs (matchMedia, ResizeObserver, etc.)

### `src/test/utils.tsx`

Custom render utilities with:

- React Router wrapper
- TanStack Query provider with test configuration
- Toast notifications support
- Custom query client for isolated tests

### `src/test/mocks.ts`

Mock data for tests:

- Product data
- User data
- API responses
- Price history data

## Test Structure

### Component Tests

Location: `src/components/**/*.test.tsx`

Example structure:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Component } from '@/components/component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### Hook Tests

Location: `src/hooks/**/*.test.ts`

Example structure:

```ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHook } from '@/hooks/use-hook';

describe('useHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useHook());
    expect(result.current).toBe(expectedValue);
  });
});
```

### Integration Tests

Location: `src/**/*.integration.test.ts{x}`

Example structure:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { server } from '@/test/setup';

describe('Component Integration', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('integrates with API correctly', async () => {
    render(<Component />);
    await waitFor(() => {
      expect(screen.getByText('API data')).toBeInTheDocument();
    });
  });
});
```

## API Mocking with MSW

MSW provides comprehensive API mocking:

### Available Mock Handlers

- **Authentication**: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`
- **Products**: `/api/tgfpro`, `/api/tgfpro/:codprod`
- **Groups**: `/api/tgfgru`
- **Price History**: `/api/tgfpro/:codprod/price-history`

### Custom Mock Responses

In tests, you can override default mocks:

```tsx
import { rest } from 'msw';
import { server } from '@/test/setup';

// Override specific endpoint
server.use(
  rest.get('/api/tgfpro', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: [], total: 0, page: 1, perPage: 10, lastPage: 0, hasMore: false })
    );
  })
);
```

## Coverage Configuration

Coverage is configured with:

- **Provider**: v8 (built into Vitest)
- **Reporters**: text, json, html
- **Thresholds**: 70% for branches, functions, lines, statements
- **Exclusions**: Test files, config files, node_modules, dist, coverage

Coverage reports are generated in `coverage/` directory:

- `coverage/index.html` - Interactive HTML report
- `coverage/coverage-final.json` - JSON report
- Terminal output with summary

## Best Practices

### Test Organization

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test component interactions and API integration
3. **Mock Data**: Use consistent mock data from `src/test/mocks.ts`
4. **Test Utilities**: Use custom render utilities from `src/test/utils.tsx`

### Component Testing

1. **User Behavior**: Test from user's perspective, not implementation details
2. **Accessibility**: Include accessibility assertions when relevant
3. **Async Operations**: Use `waitFor` for async operations
4. **User Interactions**: Use `@testing-library/user-event` for realistic interactions

### API Testing

1. **MSW Integration**: Always reset handlers in `beforeEach`
2. **Error Scenarios**: Test both success and error cases
3. **Loading States**: Test loading and error states
4. **Data Transformations**: Test API response transformations

### Hook Testing

1. **State Changes**: Test hook state changes over time
2. **Side Effects**: Test useEffect and other side effects
3. **Returns**: Test all returned values and functions
4. **Dependencies**: Test hook behavior with different dependencies

## Running Tests

### Development Mode

```bash
pnpm test
```

Runs tests in watch mode, useful during development.

### Full Test Suite

```bash
pnpm test:coverage
```

Runs all tests with coverage reporting.

### Specific Test File

```bash
pnpm test src/components/ui/button.test.tsx
```

### UI Mode

```bash
pnpm test:ui
```

Opens Vitest UI for interactive test exploration.

## Troubleshooting

### Common Issues

1. **Import Path Issues**: Ensure all imports use `@/` alias
2. **Test Setup Issues**: Check `src/test/setup.ts` for proper mock setup
3. **Async Test Timeouts**: Use `waitFor` and increase timeout if needed
4. **Mock Handler Conflicts**: Reset handlers in `beforeEach`

### Debug Tests

1. **Console Logs**: Test logs are shown in terminal output
2. **Test UI**: Use `pnpm test:ui` for visual debugging
3. **Breakpoints**: Add `debugger` statements or use VS Code debugging
4. **Screen Debug**: Use `screen.debug()` to print DOM state

## Future Enhancements

1. **Visual Regression Testing**: Add visual testing with tools like Percy
2. **E2E Testing**: Add Playwright for end-to-end testing
3. **Performance Testing**: Add performance benchmarks
4. **Component Testing**: Add Storybook integration for component testing
