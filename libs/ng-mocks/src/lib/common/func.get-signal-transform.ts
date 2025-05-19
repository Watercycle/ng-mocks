/**
 * Gets the transform function from a signal input if one exists.
 * 
 * @param meta Decorator metadata
 */
export function getSignalTransform(meta: any): Function | undefined {
  return meta ? (meta.__transform || meta.transform) : undefined;
}