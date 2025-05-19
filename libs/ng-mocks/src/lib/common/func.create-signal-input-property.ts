import { getSignalInputFn } from './func.get-signal-input-fn';

/**
 * Creates a signal input property on a class prototype if signals are supported.
 * 
 * @param cls Class to add the property to
 * @param name Property name
 * @param options Input options
 * @param createTraditionalInput Fallback function
 */
export function createSignalInputProperty(
  cls: any,
  name: string,
  options: {
    alias?: string;
    required?: boolean;
    transform?: Function;
  },
  createTraditionalInput: () => void
): boolean {
  const signalInputFn = getSignalInputFn();
  
  if (!signalInputFn) {
    createTraditionalInput();
    return false;
  }
  
  // Create options object with non-undefined properties
  const inputOptions: any = {};
  if (options.alias) {
    inputOptions.alias = options.alias;
  }
  if (options.required) {
    inputOptions.required = options.required;
  }
  if (options.transform) {
    inputOptions.transform = options.transform;
  }
  
  // Apply signal input to prototype
  const defaultValue = undefined;
  if (Object.keys(inputOptions).length > 0) {
    cls.prototype[name] = signalInputFn(defaultValue, inputOptions);
  } else {
    cls.prototype[name] = signalInputFn(defaultValue);
  }
  
  return true;
}