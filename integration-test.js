// Simple integration test for our signal functions
console.log('Testing imports and integration');

try {
  // Import the key modules we modified
  const isSignalInput = require('./libs/ng-mocks/src/lib/common/func.is-signal-input').isSignalInput;
  const getSignalTransform = require('./libs/ng-mocks/src/lib/common/func.get-signal-transform').getSignalTransform;
  const getSignalInputFn = require('./libs/ng-mocks/src/lib/common/func.get-signal-input-fn').getSignalInputFn;
  const extractSignalInputMetadata = require('./libs/ng-mocks/src/lib/common/func.extract-signal-input-metadata').extractSignalInputMetadata;
  const createSignalInputProperty = require('./libs/ng-mocks/src/lib/common/func.create-signal-input-property').createSignalInputProperty;
  
  console.log('All imports successful!');
  
  // Test the integration by simulating the process flow
  const metadata = {
    name: 'testProp',
    __isSignal: true,
    __transform: value => `transformed:${value}`
  };
  
  // Extract metadata
  const extractedMetadata = extractSignalInputMetadata(metadata, 'testProp');
  console.log('Extracted metadata:', extractedMetadata);
  
  // Create a class with the signal property
  const mockClass = { prototype: {} };
  const fallbackCalled = { value: false };
  
  // Mock the signal input function
  global.globalThis = { 
    ng: { 
      input: (value, options) => {
        console.log('Signal input called with:', { value, options });
        const signal = () => value;
        signal.set = newValue => console.log('Signal value set to:', newValue);
        return signal;
      } 
    } 
  };
  
  // Create the signal property
  const result = createSignalInputProperty(
    mockClass,
    'testProp',
    extractedMetadata,
    () => { fallbackCalled.value = true; }
  );
  
  console.log('Signal property created:', result);
  console.log('Fallback called:', fallbackCalled.value);
  console.log('Class prototype:', !!mockClass.prototype.testProp);
  
  console.log('\nIntegration test completed successfully!');
} catch (error) {
  console.error('Integration test failed:', error);
}