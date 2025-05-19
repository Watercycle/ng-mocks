import { extractSignalInputMetadata } from './func.extract-signal-input-metadata';
import * as directiveIoParseModule from './func.directive-io-parse';
import * as isSignalInputModule from './func.is-signal-input';
import * as getSignalTransformModule from './func.get-signal-transform';

describe('extractSignalInputMetadata', () => {
  let directiveIoParseSpy: jasmine.Spy;
  let isSignalInputSpy: jasmine.Spy;
  let getSignalTransformSpy: jasmine.Spy;
  
  beforeEach(() => {
    directiveIoParseSpy = spyOn(directiveIoParseModule, 'default').and.callFake(param => {
      return { 
        name: param.name,
        alias: param.alias,
        required: param.required
      };
    });
    
    isSignalInputSpy = spyOn(isSignalInputModule, 'isSignalInput').and.callFake(meta => {
      return meta && (meta.__isSignal || meta.isSignal);
    });
    
    getSignalTransformSpy = spyOn(getSignalTransformModule, 'getSignalTransform').and.callFake(meta => {
      return meta && (meta.__transform || meta.transform);
    });
  });
  
  it('should extract metadata from input decorator', () => {
    const transformFn = () => 'transformed';
    const input = {
      alias: 'aliasName',
      required: true,
      __isSignal: true,
      __transform: transformFn
    };
    
    const result = extractSignalInputMetadata(input, 'propName');
    
    expect(result).toEqual({
      name: 'propName',
      alias: 'aliasName',
      required: true,
      isSignal: true,
      transform: transformFn
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
