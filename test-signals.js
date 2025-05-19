// This is a simple test script to verify that our signal functions work correctly
const { isSignalInput } = require('./libs/ng-mocks/src/lib/common/func.is-signal-input');
const { getSignalTransform } = require('./libs/ng-mocks/src/lib/common/func.get-signal-transform');
const { getSignalInputFn } = require('./libs/ng-mocks/src/lib/common/func.get-signal-input-fn');

// Test isSignalInput
console.log('--- Testing isSignalInput ---');
console.log('With __isSignal: true', isSignalInput({ __isSignal: true }));
console.log('With isSignal: true', isSignalInput({ isSignal: true }));
console.log('With no signal prop', isSignalInput({ other: true }));
console.log('With undefined', isSignalInput(undefined));

// Test getSignalTransform
console.log('\n--- Testing getSignalTransform ---');
const transformFn = () => 'transformed';
console.log('With __transform', getSignalTransform({ __transform: transformFn }) === transformFn);
console.log('With transform', getSignalTransform({ transform: transformFn }) === transformFn);
console.log('With no transform', getSignalTransform({ other: true }));
console.log('With undefined', getSignalTransform(undefined));

// Test getSignalInputFn
console.log('\n--- Testing getSignalInputFn ---');
const originalGlobal = global.globalThis;
global.globalThis = { ng: { input: () => {} } };
console.log('With ng.input available', typeof getSignalInputFn() === 'function');
global.globalThis = { ng: {} };
console.log('With ng but no input', getSignalInputFn() === undefined);
global.globalThis = {};
console.log('With no ng object', getSignalInputFn() === undefined);
global.globalThis = originalGlobal;

// Test end
console.log('\nAll tests completed.');