import { getSignalTransform } from './func.get-signal-transform';

describe('getSignalTransform', () => {
  it('should get transform function from __transform property', () => {
    const transformFn = () => 'transformed';
    const meta = { __transform: transformFn };
    expect(getSignalTransform(meta)).toBe(transformFn);
  });

  it('should get transform function from transform property', () => {
    const transformFn = () => 'transformed';
    const meta = { transform: transformFn };
    expect(getSignalTransform(meta)).toBe(transformFn);
  });

  it('should return undefined for non-transform metadata', () => {
    const meta = { something: true };
    expect(getSignalTransform(meta)).toBeUndefined();
  });

  it('should handle undefined/null inputs', () => {
    expect(getSignalTransform(undefined)).toBeUndefined();
    expect(getSignalTransform(null)).toBeUndefined();
  });
});