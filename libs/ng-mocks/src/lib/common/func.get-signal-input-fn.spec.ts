import { getSignalInputFn } from './func.get-signal-input-fn';

describe('getSignalInputFn', () => {
  let originalGlobalThis: any;

  beforeEach(() => {
    // Store the original globalThis
    originalGlobalThis = global.globalThis;
  });

  afterEach(() => {
    // Restore the original globalThis
    global.globalThis = originalGlobalThis;
  });

  it('should return input function if available', () => {
    const mockInput = () => {};
    global.globalThis = {
      ng: {
        input: mockInput
      }
    };
    
    expect(getSignalInputFn()).toBe(mockInput);
  });

  it('should return undefined if input function is not available', () => {
    global.globalThis = {
      ng: {}
    };
    
    expect(getSignalInputFn()).toBeUndefined();
  });

  it('should return undefined if ng object is not available', () => {
    global.globalThis = {};
    
    expect(getSignalInputFn()).toBeUndefined();
  });
});