/**
 * Attempts to retrieve Angular's signal input() function from the global namespace.
 * 
 * @returns The signal input function if Angular 19+ is available, undefined otherwise
 */
export function getSignalInputFn(): Function | undefined {
  // Safely access the global namespace in both browser and Node environments
  const global = typeof window !== 'undefined' ? window : globalThis;
  
  // Avoid exceptions by using optional chaining
  return (global as any)?.['ng']?.['input'];
}