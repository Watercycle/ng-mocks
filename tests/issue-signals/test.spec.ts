import { Component, Directive, Input, NgModule, VERSION } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

/**
 * These tests verify support for Angular 19+ signal inputs.
 * They will be skipped if running on Angular versions before 19.
 */

// Check if we're running on Angular 19 or later
const HAS_SIGNAL_SUPPORT = Number.parseInt(VERSION.major, 10) >= 19;

// Conditionally import the input function from @angular/core
let input: any;
if (HAS_SIGNAL_SUPPORT) {
  // This is safe in Angular 19+
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const angularCore = require('@angular/core');
  input = angularCore.input;
} else {
  // Create a mock input function for testing environments that don't have Angular 19
  input = (initialValue: any, options?: any) => {
    const signal = () => initialValue;
    signal.set = (newValue: any) => { initialValue = newValue; };
    
    if (options?.alias) {
      (signal as any).alias = options.alias;
    }
    
    return signal;
  };
  
  // Add required variant
  input.required = <T>(initialValue?: T, options?: any) => {
    const signal = input(initialValue, { ...(options || {}), required: true });
    return signal;
  };
}

// This component uses Angular 19 signal inputs
@Component({
  selector: 'signal-test',
  template: `
    <div class="signal-input">{{ signalValue() }}</div>
    <div class="signal-alias">{{ aliasedValue() }}</div>
    <div class="signal-required">{{ requiredValue() }}</div>
  `,
})
class SignalTestComponent {
  // Simple signal input
  signalValue = input<string>('default value');
  
  // Signal input with alias
  aliasedValue = input<string>('default alias', { alias: 'differentName' });
  
  // Required signal input
  requiredValue = input.required<string>();
}

// Module with the signal component
@NgModule({
  declarations: [SignalTestComponent],
  exports: [SignalTestComponent],
})
class SignalTestModule {}

describe('issue-signals:MockComponent', () => {
  if (!HAS_SIGNAL_SUPPORT) {
    it('needs Angular 19+', () => {
      // Skip this test on older Angular versions
      expect(true).toBeTruthy();
    });
    
    return;
  }
  // Setup for each test
  beforeEach(() => MockBuilder(SignalTestComponent, SignalTestModule));

  it('should properly mock signal inputs', () => {
    // Render with inputs
    const fixture = MockRender(SignalTestComponent, {
      signalValue: 'test value',
      differentName: 'alias value',
      requiredValue: 'required value',
    });

    // Assert that inputs are correctly displayed in the template
    expect(ngMocks.find('.signal-input').nativeElement.textContent.trim())
      .toBe('test value');
    expect(ngMocks.find('.signal-alias').nativeElement.textContent.trim())
      .toBe('alias value');
    expect(ngMocks.find('.signal-required').nativeElement.textContent.trim())
      .toBe('required value');
  });
});

// Using MockBuilder with a different approach
describe('issue-signals:MockBuilder', () => {
  if (!HAS_SIGNAL_SUPPORT) {
    it('needs Angular 19+', () => {
      expect(true).toBeTruthy();
    });
    
    return;
  }
  let fixture: ComponentFixture<any>;

  beforeEach(() => {
    return MockBuilder()
      .keep(SignalTestComponent)
      .mock(SignalTestModule);
  });

  it('should handle signal inputs in kept component', () => {
    fixture = MockRender(SignalTestComponent, {
      signalValue: 'builder value',
      differentName: 'builder alias',
      requiredValue: 'builder required',
    });

    // Assert that inputs are correctly displayed
    expect(ngMocks.find('.signal-input').nativeElement.textContent.trim())
      .toBe('builder value');
    expect(ngMocks.find('.signal-alias').nativeElement.textContent.trim())
      .toBe('builder alias');
    expect(ngMocks.find('.signal-required').nativeElement.textContent.trim())
      .toBe('builder required');
    
    // Update the inputs
    fixture.componentInstance.signalValue = 'updated value';
    fixture.detectChanges();
    
    expect(ngMocks.find('.signal-input').nativeElement.textContent.trim())
      .toBe('updated value');
  });
});

// Using the mocked version of the component
describe('issue-signals:MockedComponent', () => {
  if (!HAS_SIGNAL_SUPPORT) {
    it('needs Angular 19+', () => {
      expect(true).toBeTruthy();
    });
    
    return;
  }
  beforeEach(() => {
    return MockBuilder()
      .mock(SignalTestComponent)
      .mock(SignalTestModule);
  });

  it('should correctly mock a component with signal inputs', () => {
    const fixture = MockRender(SignalTestComponent, {
      signalValue: 'mocked value',
      differentName: 'mocked alias',
      requiredValue: 'mocked required',
    });
    
    // In a mocked component, the inputs should still be properly bound
    const component = fixture.point.componentInstance;
    
    // This should work for signal inputs
    expect(component.signalValue()).toBe('mocked value');
    expect(component.aliasedValue()).toBe('mocked alias');
    expect(component.requiredValue()).toBe('mocked required');
  });
});

// Direct usage of MockComponent with signal inputs
describe('issue-signals:MockComponent-direct', () => {
  if (!HAS_SIGNAL_SUPPORT) {
    it('needs Angular 19+', () => {
      expect(true).toBeTruthy();
    });
    
    return;
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ngMocks.MockComponent(SignalTestComponent)
      ],
    });
    TestBed.compileComponents();
  });

  it('should correctly handle signal inputs with direct MockComponent usage', () => {
    const fixture = TestBed.createComponent(SignalTestComponent);
    const component = fixture.componentInstance;
    
    // Set values through the signal inputs
    component.signalValue.set('direct mock value');
    component.aliasedValue.set('direct mock alias');
    component.requiredValue.set('direct mock required');
    fixture.detectChanges();
    
    // Verify the signals have the correct values
    expect(component.signalValue()).toBe('direct mock value');
    expect(component.aliasedValue()).toBe('direct mock alias');
    expect(component.requiredValue()).toBe('direct mock required');
  });
});

// Parent component that uses the signal component as a child
@Component({
  selector: 'parent-component',
  template: `
    <signal-test 
      [signalValue]="parentValue" 
      [differentName]="parentAlias"
      [requiredValue]="parentRequired">
    </signal-test>
  `
})
class ParentComponent {
  parentValue = 'from parent';
  parentAlias = 'alias from parent';
  parentRequired = 'required from parent';
}

@NgModule({
  declarations: [ParentComponent, SignalTestComponent],
  exports: [ParentComponent]
})
class ParentModule {}

// Test for mocking a child component with signal inputs
describe('issue-signals:MockChildComponent', () => {
  if (!HAS_SIGNAL_SUPPORT) {
    it('needs Angular 19+', () => {
      expect(true).toBeTruthy();
    });
    
    return;
  }
  beforeEach(() => {
    return MockBuilder(ParentComponent, ParentModule)
      .mock(SignalTestComponent); // Mock the child component with signal inputs
  });

  it('should correctly pass values to mocked child component with signal inputs', () => {
    const fixture = MockRender(ParentComponent);
    const parent = fixture.componentInstance;
    fixture.detectChanges();
    
    // Find the child component instance
    const childInstance = ngMocks.findInstance(SignalTestComponent);
    
    // Verify the signal values were passed from parent to child
    expect(childInstance.signalValue()).toBe('from parent');
    expect(childInstance.aliasedValue()).toBe('alias from parent');
    expect(childInstance.requiredValue()).toBe('required from parent');
    
    // Update parent values and verify changes propagate
    parent.parentValue = 'updated parent';
    fixture.detectChanges();
    
    expect(childInstance.signalValue()).toBe('updated parent');
  });
});

// Directive with signal inputs

@Directive({
  selector: '[signalDirective]',
})
class SignalDirective {
  // Signal inputs in directive
  directiveValue = input<string>('default directive');
  requiredDirectiveValue = input.required<string>();
}

@Component({
  selector: 'directive-host',
  template: `
    <div signalDirective 
         [directiveValue]="hostValue"
         [requiredDirectiveValue]="hostRequired">
      Target element
    </div>
  `
})
class DirectiveHostComponent {
  hostValue = 'from host';
  hostRequired = 'required from host';
}

@NgModule({
  declarations: [DirectiveHostComponent, SignalDirective],
  exports: [DirectiveHostComponent]
})
class DirectiveModule {}

// Test for signal inputs in directives
describe('issue-signals:MockDirective', () => {
  if (!HAS_SIGNAL_SUPPORT) {
    it('needs Angular 19+', () => {
      expect(true).toBeTruthy();
    });
    
    return;
  }
  beforeEach(() => {
    return MockBuilder(DirectiveHostComponent, DirectiveModule)
      .mock(SignalDirective);
  });

  it('should handle signal inputs in mocked directives', () => {
    const fixture = MockRender(DirectiveHostComponent);
    fixture.detectChanges();
    
    // Find the directive instance
    const directiveInstance = ngMocks.findInstance(SignalDirective);
    
    // Verify the signal values
    expect(directiveInstance.directiveValue()).toBe('from host');
    expect(directiveInstance.requiredDirectiveValue()).toBe('required from host');
    
    // Update host values and verify changes
    fixture.componentInstance.hostValue = 'updated host';
    fixture.detectChanges();
    
    expect(directiveInstance.directiveValue()).toBe('updated host');
  });
});

// This test suite always runs, regardless of signal support
describe('issue-signals:Compatibility', () => {
  // Simple component with regular inputs
  @Component({
    selector: 'regular-component',
    template: '<div>{{input1}}</div>'
  })
  class RegularComponent {
    @Input() input1: string;
  }
  
  beforeEach(() => {
    return MockBuilder(RegularComponent);
  });

  it('should not break regular @Input handling', () => {
    const fixture = MockRender(RegularComponent, {
      input1: 'regular value'
    });
    
    expect(fixture.point.componentInstance.input1).toBe('regular value');
  });
});

// Add metadata imports needed for the compatibility test
import { Input } from '@angular/core';