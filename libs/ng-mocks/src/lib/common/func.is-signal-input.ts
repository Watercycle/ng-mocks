/**
 * Detects if a property is defined as a signal input.
 * 
 * @param meta Decorator metadata that might contain signal information
 */
export function isSignalInput(meta: any): boolean {
  return !!meta && (meta.__isSignal === true || meta.isSignal === true);
}