import { DirectiveIo, DirectiveIoParsed } from './core.types';

/**
 * Builds a normalized DirectiveIo representation from parsed metadata.
 */
export default function ({ name, alias, required, isSignal, transform }: DirectiveIoParsed, skipName = false): DirectiveIo {
  // Signal inputs need to preserve their metadata for proper mocking
  if (isSignal || transform) {
    return { 
      name, 
      ...(alias !== undefined ? { alias } : {}),
      ...(required ? { required } : {}),
      ...(isSignal ? { isSignal } : {}),
      ...(transform ? { transform } : {})
    };
  }
  
  if (required) {
    return { name, alias, required };
  }
  
  if (!alias || name === alias) {
    return skipName ? '' : name;
  }

  return skipName ? alias : `${name}:${alias}`;
}
