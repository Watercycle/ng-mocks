import { DirectiveIoParsed } from './core.types';
import funcDirectiveIoParse from './func.directive-io-parse';
import { isSignalInput } from './func.is-signal-input';
import { getSignalTransform } from './func.get-signal-transform';

/**
 * Extracts signal input metadata from decorator metadata.
 * 
 * @param input Input decorator metadata
 * @param name Property name
 */
export function extractSignalInputMetadata(
  input: {
    alias?: string;
    required?: boolean;
    bindingPropertyName?: string;
    __isSignal?: boolean;
    __transform?: Function;
  },
  name: string
): DirectiveIoParsed {
  const base = funcDirectiveIoParse({
    name,
    alias: input.alias ?? input.bindingPropertyName,
    required: input.required,
  });
  
  return {
    ...base,
    isSignal: isSignalInput(input),
    transform: getSignalTransform(input),
  };
}