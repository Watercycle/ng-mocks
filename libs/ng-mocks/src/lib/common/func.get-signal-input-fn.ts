/**
 * Attempts to retrieve Angular's signal input() function from the global namespace.
 * 
 * @returns The signal input function if Angular 19+ is available, undefined otherwise
 */
export function getSignalInputFn(): Function | undefined {
  // Avoid exceptions by using optional chaining
  return (globalThis as any)?.['ng']?.['input'];
}