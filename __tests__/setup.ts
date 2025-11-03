import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with testing-library matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
    cleanup();
});

// Mock window.performance for performance monitoring tests
Object.defineProperty(window, 'performance', {
    value: {
        now: vi.fn(() => Date.now()),
        timing: {
            navigationStart: Date.now(),
            loadEventEnd: Date.now() + 1000,
        },
    },
    writable: true,
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {}
    disconnect() {}
    observe(element: Element) {}
    unobserve(element: Element) {}
    takeRecords() { return [] }
};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {}
    disconnect() {}
    observe(element: Element) {}
    unobserve(element: Element) {}
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock console methods to catch errors and warnings during tests
console.error = vi.fn();
console.warn = vi.fn();