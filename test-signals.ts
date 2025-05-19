// This is a simple test to verify our signal functions
import { isSignalInput } from './libs/ng-mocks/src/lib/common/func.is-signal-input';
import { getSignalTransform } from './libs/ng-mocks/src/lib/common/func.get-signal-transform';
import { getSignalInputFn } from './libs/ng-mocks/src/lib/common/func.get-signal-input-fn';

// Manual test for isSignalInput
function testIsSignalInput() {
  const tests = [
    { name: 'With __isSignal: true', input: { __isSignal: true }, expected: true },
    { name: 'With isSignal: true', input: { isSignal: true }, expected: true },
    { name: 'With no signal prop', input: { other: true }, expected: false },
    { name: 'With undefined', input: undefined, expected: false }
  ];
  
  console.log('--- Testing isSignalInput ---');
  let allPass = true;
  
  for (const test of tests) {
    const result = isSignalInput(test.input);
    const pass = result === test.expected;
    console.log(`${test.name}: ${pass ? 'PASS' : 'FAIL'} (${result})`);
    if (!pass) allPass = false;
  }
  
  return allPass;
}

// Manual test for getSignalTransform
function testGetSignalTransform() {
  const transformFn = () => 'transformed';
  const tests = [
    { name: 'With __transform', input: { __transform: transformFn }, expected: transformFn },
    { name: 'With transform', input: { transform: transformFn }, expected: transformFn },
    { name: 'With no transform', input: { other: true }, expected: undefined },
    { name: 'With undefined', input: undefined, expected: undefined }
  ];
  
  console.log('\n--- Testing getSignalTransform ---');
  let allPass = true;
  
  for (const test of tests) {
    const result = getSignalTransform(test.input);
    const pass = result === test.expected;
    console.log(`${test.name}: ${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) allPass = false;
  }
  
  return allPass;
}

// Manual test for getSignalInputFn
function testGetSignalInputFn() {
  const mockInputFn = () => {};
  const originalGlobal = global.globalThis;
  const tests = [
    { 
      name: 'With ng.input available', 
      setup: () => { (global as any).globalThis = { ng: { input: mockInputFn } }; },
      expected: true 
    },
    { 
      name: 'With ng but no input', 
      setup: () => { (global as any).globalThis = { ng: {} }; },
      expected: false 
    },
    { 
      name: 'With no ng object', 
      setup: () => { (global as any).globalThis = {}; },
      expected: false 
    }
  ];
  
  console.log('\n--- Testing getSignalInputFn ---');
  let allPass = true;
  
  for (const test of tests) {
    test.setup();
    const result = getSignalInputFn();
    const pass = (typeof result === 'function') === test.expected;
    console.log(`${test.name}: ${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) allPass = false;
  }
  
  // Restore global
  (global as any).globalThis = originalGlobal;
  
  return allPass;
}

// Run all tests
const isSignalInputPass = testIsSignalInput();
const getSignalTransformPass = testGetSignalTransform();
const getSignalInputFnPass = testGetSignalInputFn();

console.log('\n--- Summary ---');
console.log(`isSignalInput: ${isSignalInputPass ? 'PASS' : 'FAIL'}`);
console.log(`getSignalTransform: ${getSignalTransformPass ? 'PASS' : 'FAIL'}`);
console.log(`getSignalInputFn: ${getSignalInputFnPass ? 'PASS' : 'FAIL'}`);
console.log(`Overall: ${isSignalInputPass && getSignalTransformPass && getSignalInputFnPass ? 'PASS' : 'FAIL'}`);