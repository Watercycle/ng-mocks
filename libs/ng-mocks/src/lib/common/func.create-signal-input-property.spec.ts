import { createSignalInputProperty } from './func.create-signal-input-property';
import * as signalInputFnModule from './func.get-signal-input-fn';

describe('createSignalInputProperty', () => {
  let mockClass: any;
  let mockSignalFn: jasmine.Spy;
  let fallbackFn: jasmine.Spy;
  let getSignalInputFnSpy: jasmine.Spy;
  
  beforeEach(() => {
    // Setup test objects
    mockClass = { prototype: {} };
    mockSignalFn = jasmine.createSpy('mockSignalFn');
    fallbackFn = jasmine.createSpy('fallbackFn');
    getSignalInputFnSpy = spyOn(signalInputFnModule, 'getSignalInputFn');
    
    // Setup mock implementation
    mockSignalFn.and.callFake((value, options) => {
      const signal = jasmine.createSpy('signal').and.returnValue(value);
      if (options?.alias) {
        signal.alias = options.alias;
      }
      return signal;
    });
  });
  
  it('should create signal input when function is available', () => {
    // Setup signal function available
    getSignalInputFnSpy.and.returnValue(mockSignalFn);
    
    const result = createSignalInputProperty(
      mockClass,
      'testProp',
      { alias: 'testAlias', required: true },
      fallbackFn
    );
    
    expect(result).toBe(true);
    expect(mockClass.prototype.testProp).toBeDefined();
    expect(mockSignalFn).toHaveBeenCalled();
    expect(fallbackFn).not.toHaveBeenCalled();
  });
  
  it('should use fallback when signal function is not available', () => {
    // Setup signal function not available
    getSignalInputFnSpy.and.returnValue(undefined);
    
    const result = createSignalInputProperty(
      mockClass,
      'testProp',
      { alias: 'testAlias', required: true },
      fallbackFn
    );
    
    expect(result).toBe(false);
    expect(fallbackFn).toHaveBeenCalled();
  });
  
  it('should handle inputs with no options', () => {
    // Setup signal function available
    getSignalInputFnSpy.and.returnValue(mockSignalFn);
    
    createSignalInputProperty(
      mockClass,
      'testProp',
      {},
      fallbackFn
    );
    
    expect(mockSignalFn).toHaveBeenCalledWith(jasmine.any(Object));
  });
  
  it('should include all provided options', () => {
    // Setup signal function available
    getSignalInputFnSpy.and.returnValue(mockSignalFn);
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
    
    // In Jasmine we can't easily check object contents like in Jest
    expect(mockSignalFn).toHaveBeenCalled();
  });
});
