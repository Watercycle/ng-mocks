import { isSignalInput } from './func.is-signal-input';

describe('isSignalInput', () => {
  it('should detect signal inputs with __isSignal property', () => {
    const meta = { __isSignal: true };
    expect(isSignalInput(meta)).toBe(true);
  });

  it('should detect signal inputs with isSignal property', () => {
    const meta = { isSignal: true };
    expect(isSignalInput(meta)).toBe(true);
  });

  it('should return false for non-signal inputs', () => {
    const meta = { something: true };
    expect(isSignalInput(meta)).toBe(false);
  });

  it('should handle undefined/null inputs', () => {
    expect(isSignalInput(undefined)).toBe(false);
    expect(isSignalInput(null)).toBe(false);
  });
});