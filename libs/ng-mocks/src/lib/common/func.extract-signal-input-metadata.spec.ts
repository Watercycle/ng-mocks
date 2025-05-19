import { extractSignalInputMetadata } from './func.extract-signal-input-metadata';

// Mock dependencies
jest.mock('./func.directive-io-parse', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((param) => {
      return { 
        name: param.name,
        alias: param.alias,
        required: param.required
      };
    })
  };
});

jest.mock('./func.is-signal-input', () => {
  return {
    isSignalInput: jest.fn().mockImplementation(meta => {
      return meta && (meta.__isSignal || meta.isSignal);
    })
  };
});

jest.mock('./func.get-signal-transform', () => {
  return {
    getSignalTransform: jest.fn().mockImplementation(meta => {
      return meta && (meta.__transform || meta.transform);
    })
  };
});

describe('extractSignalInputMetadata', () => {
  it('should extract metadata from input decorator', () => {
    const input = {
      alias: 'aliasName',
      required: true,
      __isSignal: true,
      __transform: () => 'transformed'
    };
    
    const result = extractSignalInputMetadata(input, 'propName');
    
    expect(result).toEqual({
      name: 'propName',
      alias: 'aliasName',
      required: true,
      isSignal: true,
      transform: input.__transform
    });
  });

  it('should use bindingPropertyName as alias if provided', () => {
    const input = {
      bindingPropertyName: 'bindingName',
      required: false
    };
    
    const result = extractSignalInputMetadata(input, 'propName');
    
    expect(result.alias).toBeDefined();
  });

  it('should handle minimal input metadata', () => {
    const result = extractSignalInputMetadata({}, 'propName');
    
    expect(result.name).toBe('propName');
    expect(result.isSignal).toBeFalsy();
    expect(result.transform).toBeUndefined();
  });
});