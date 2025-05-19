import { createSignalInputProperty } from './func.create-signal-input-property';

// Mock dependencies
jest.mock('./func.get-signal-input-fn', () => {
  return {
    getSignalInputFn: jest.fn()
  };
});

import { getSignalInputFn } from './func.get-signal-input-fn';

describe('createSignalInputProperty', () => {
  let mockClass: any;
  let mockSignalFn: jest.Mock;
  let fallbackFn: jest.Mock;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test objects
    mockClass = { prototype: {} };
    mockSignalFn = jest.fn();
    fallbackFn = jest.fn();
    
    // Setup mock implementation
    mockSignalFn.mockImplementation((value, options) => {
      const signal = jest.fn().mockReturnValue(value);
      if (options?.alias) {
        signal.alias = options.alias;
      }
      return signal;
    });
  });
  
  it('should create signal input when function is available', () => {
    // Setup signal function available
    (getSignalInputFn as jest.Mock).mockReturnValue(mockSignalFn);
    
    const result = createSignalInputProperty(
      mockClass,
      'testProp',
      { alias: 'testAlias', required: true },
      fallbackFn
    );
    
    expect(result).toBe(true);
    expect(mockClass.prototype.testProp).toBeDefined();
    expect(mockSignalFn).toHaveBeenCalledTimes(1);
    expect(fallbackFn).not.toHaveBeenCalled();
  });
  
  it('should use fallback when signal function is not available', () => {
    // Setup signal function not available
    (getSignalInputFn as jest.Mock).mockReturnValue(undefined);
    
    const result = createSignalInputProperty(
      mockClass,
      'testProp',
      { alias: 'testAlias', required: true },
      fallbackFn
    );
    
    expect(result).toBe(false);
    expect(fallbackFn).toHaveBeenCalledTimes(1);
  });
  
  it('should handle inputs with no options', () => {
    // Setup signal function available
    (getSignalInputFn as jest.Mock).mockReturnValue(mockSignalFn);
    
    createSignalInputProperty(
      mockClass,
      'testProp',
      {},
      fallbackFn
    );
    
    expect(mockSignalFn).toHaveBeenCalledWith(undefined);
  });
  
  it('should include all provided options', () => {
    // Setup signal function available
    (getSignalInputFn as jest.Mock).mockReturnValue(mockSignalFn);
    const transformFn = () => 'transformed';
    
    createSignalInputProperty(
      mockClass,
      'testProp',
      { 
        alias: 'testAlias', 
        required: true,
        transform: transformFn
      },
      fallbackFn
    );
    
    expect(mockSignalFn).toHaveBeenCalledWith(
      undefined, 
      expect.objectContaining({
        alias: 'testAlias',
        required: true,
        transform: transformFn
      })
    );
  });
});