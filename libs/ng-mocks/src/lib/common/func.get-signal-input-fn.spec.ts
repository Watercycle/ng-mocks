import { getSignalInputFn } from './func.get-signal-input-fn';

describe('getSignalInputFn', () => {
  let originalGlobalThis: any;

  beforeEach(() => {
    // Store the original globalThis
    originalGlobalThis = window;
  });

  afterEach(() => {
    // Restore the original globalThis
    window = originalGlobalThis;
  });

  it('should return input function if available', () => {
    const mockInput = jasmine.createSpy('mockInput');
    // Use property assignment instead of direct replacement
    const mockNg = { input: mockInput };
    (window as any).ng = mockNg;
    
    expect(getSignalInputFn()).toBe(mockInput);
  });

  it('should return undefined if input function is not available', () => {
    // Create ng without input
    (window as any).ng = {};
    
    expect(getSignalInputFn()).toBeUndefined();
  });

  it('should return undefined if ng object is not available', () => {
    // Remove ng from global
    delete (window as any).ng;
    
    expect(getSignalInputFn()).toBeUndefined();
  });
});