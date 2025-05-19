// istanbul ignore file
import { Component, ContentChild, ContentChildren, Directive, Input, NgModule, Output, Pipe, Type } from '@angular/core';

import coreDefineProperty from '../common/core.define-property';
import { AnyDeclaration, DirectiveIo } from '../common/core.types';
import funcDirectiveIoBuild from '../common/func.directive-io-build';
import funcDirectiveIoParse from '../common/func.directive-io-parse';
import { extractSignalInputMetadata } from '../common/func.extract-signal-input-metadata';

interface Declaration {
  host: Record<string, string | undefined>;
  inputs: DirectiveIo[];
  outputs: DirectiveIo[];
  exportAs: string[];
  providers: any[];
  queries: Map<string, any>;
  selector: string | string[] | null;
}

// Shared parse object that is used to reduce memory usage by avoiding using new Object.
const cachedParse = {
  name: '',
  alias: undefined,
  required: undefined,
};

const parseInputOrOutput = (param: string): typeof cachedParse => {
  const [name, alias] = param.split(':').map(v => v.trim());
  cachedParse.name = name;
  cachedParse.alias = name === alias || !alias ? undefined : alias;
  cachedParse.required = undefined;

  return cachedParse;
};

/**
 * Tries to extract selector from meta.
 */
const extractSelector = (def: any): string | string[] | null => {
  if (!def) {
    return null;
  }

  const defKind = def.__proto__.constructor;
  if (defKind === Directive || defKind === Component) {
    return def.selector;
  }

  if (defKind === Pipe) {
    return def.name;
  }

  return null;
};

/**
 * Tries to extract exportAs from meta.
 */
const extractExportAs = (def: any): string[] => {
  if (!def) {
    return [];
  }

  const defKind = def.__proto__.constructor;
  if (defKind === Directive || defKind === Component) {
    return def.exportAs ? def.exportAs.split(',').map((v: string) => v.trim()) : [];
  }

  return [];
};

/**
 * Tries to extract providers form meta.
 */
const extractProviders = (def: any): any[] => {
  if (!def) {
    return [];
  }

  const providers: any[] = [];

  const defKind = def.__proto__.constructor;
  if (defKind === Component && def.viewProviders && Array.isArray(def.viewProviders)) {
    providers.push(...def.viewProviders);
  }
  if ((defKind === Component || defKind === Directive || defKind === NgModule) && def.providers && Array.isArray(def.providers)) {
    providers.push(...def.providers);
  }

  return providers;
};

/**
 * Tries to extract host from meta.
 */
const extractHost = (def: any): Record<string, string | undefined> => {
  if (!def) {
    return {};
  }

  const defKind = def.__proto__.constructor;
  if (defKind === Directive || defKind === Component) {
    return def.host || {};
  }

  return {};
};

/**
 * Tries to extract inputs form meta.
 */
const extractInputs = (def: any): DirectiveIo[] => {
  const directiveIo: DirectiveIo[] = [];

  if (!def) {
    return directiveIo;
  }

  const defKind = def.__proto__.constructor;
  if (defKind === Directive || defKind === Component || defKind === NgModule) {
    if (def.inputs && Array.isArray(def.inputs)) {
      for (const param of def.inputs) {
        if (typeof param === 'string') {
          const value = parseInputOrOutput(param);
          directiveIo.push(funcDirectiveIoBuild({ name: value.name, alias: value.alias }, false));
        }
      }
    }
  }

  return directiveIo;
};

/**
 * Tries to extract outputs form meta.
 */
const extractOutputs = (def: any): DirectiveIo[] => {
  const directiveIo: DirectiveIo[] = [];

  if (!def) {
    return directiveIo;
  }

  const defKind = def.__proto__.constructor;
  if (defKind === Directive || defKind === Component) {
    if (def.outputs && Array.isArray(def.outputs)) {
      for (const param of def.outputs) {
        if (typeof param === 'string') {
          const value = parseInputOrOutput(param);
          directiveIo.push(funcDirectiveIoBuild({ name: value.name, alias: value.alias }, false));
        }
      }
    }
  }

  return directiveIo;
};

// This weird declaration helps to enforce typing.
const parsePropMetadataParserFactoryProp =
  (key: 'inputs' | 'outputs') =>
  (
    _: any,
    name: string,
    decorator: {
      alias?: string;
      required?: boolean;
      bindingPropertyName?: string;
      ngMetadataName?: string;
      __isSignal?: boolean;
      __transform?: Function;
      isSignal?: boolean;
      transform?: Function;
    },
    declaration: Declaration,
  ): void => {
    // Extract signal metadata from decorator
    const metadata = extractSignalInputMetadata(decorator, name);
    const normalizedDef = funcDirectiveIoBuild(metadata);

    // Check if this input/output is already defined
    let isDuplicate = false;
    for (const def of declaration[key]) {
      if (def === normalizedDef) {
        isDuplicate = true;
        break;
      }

      const parsed = funcDirectiveIoParse(def);
      
      if (
        parsed.name === metadata.name && 
        parsed.alias === metadata.alias && 
        parsed.required === metadata.required &&
        parsed.isSignal === metadata.isSignal
      ) {
        isDuplicate = true;
        break;
      }
    }

    // Add to declarations if not a duplicate
    if (!isDuplicate) {
      declaration[key].unshift(normalizedDef);
    }
  };
const parsePropMetadataParserInput = parsePropMetadataParserFactoryProp('inputs');
const parsePropMetadataParserOutput = parsePropMetadataParserFactoryProp('outputs');

// This weird declaration helps to enforce typing.
const parsePropMetadataParserFactoryQuery =
  (types: any[]) =>
  (
    _: any,
    name: string,
    decorator: {
      selector?: any;
      first?: boolean;
      descendants?: boolean;
      read?: any;
      isViewQuery?: boolean;
    },
    declaration: Declaration,
  ): void => {
    // We need to check that decorator suits our types.
    if (!decorator) {
      return;
    }
    const index = types.findIndex(check => decorator.constructor === check);
    if (index === -1) {
      return;
    }

    // Let's try to detect when it is needed.
    declaration.queries.set(name, {
      descendants: !!decorator.descendants,
      emitDistinctChangesOnly: decorator.emitDistinctChangesOnly,
      first: !!decorator.first,
      isViewQuery: !!decorator.isViewQuery,
      read: decorator.read,
      selector: decorator.selector,
      static: !!decorator.static,
    });
  };
const parsePropMetadataParserContentChild = parsePropMetadataParserFactoryQuery([ContentChild]);
const parsePropMetadataParserContentChildren = parsePropMetadataParserFactoryQuery([ContentChildren]);

/**
 * Function that helps with extracting all possible metadata from Component and Directive properties.
 */
const parsePropMetadata = (def: any, declaration?: Declaration): Declaration => {
  declaration = declaration || {
    host: {},
    inputs: [],
    outputs: [],
    exportAs: [],
    providers: [],
    queries: new Map(),
    selector: null,
  };

  if (!def || !def.propMetadata) {
    return declaration;
  }

  for (const decoratorKey of Object.keys(def.propMetadata)) {
    const metadata = def.propMetadata[decoratorKey];
    if (!metadata) {
      continue;
    }
    for (let metadataIndex = 0; metadataIndex < metadata.length; metadataIndex += 1) {
      const decorator = metadata[metadataIndex];
      const ngMetadataName = decorator?.ngMetadataName || decorator?.type?.prototype?.ngMetadataName;
      if (ngMetadataName === 'Input') {
        parsePropMetadataParserInput(decorator, decoratorKey, decorator, declaration);
      } else if (ngMetadataName === 'Output') {
        parsePropMetadataParserOutput(decorator, decoratorKey, decorator, declaration);
      } else if (ngMetadataName === 'ContentChild') {
        parsePropMetadataParserContentChild(decorator, decoratorKey, decorator, declaration);
      } else if (ngMetadataName === 'ContentChildren') {
        parsePropMetadataParserContentChildren(decorator, decoratorKey, decorator, declaration);
      }
    }
  }

  return declaration;
};

// This weird declaration helps to enforce typing.
const parsePropDecoratorsParserFactoryProp = (key: 'inputs' | 'outputs') => {
  return (
    _: any,
    name: string,
    decorator: {
      args?: [DirectiveIo];
      __isSignal?: boolean;
      __transform?: Function;
    },
    declaration: Declaration,
  ): void => {
    // Extract basic properties from args
    const { alias = undefined, required = undefined } =
      typeof decorator.args?.[0] === 'undefined'
        ? {}
        : typeof decorator.args[0] === 'string'
          ? { alias: decorator.args[0] }
          : decorator.args[0];
    
    const metadata = extractSignalInputMetadata({
      alias,
      required,
      bindingPropertyName: alias,
      __isSignal: decorator.__isSignal,
      __transform: decorator.__transform
    }, name);
    
    callback(_, name, metadata, declaration);
  };
};
const parsePropDecoratorsParserInput = parsePropDecoratorsParserFactoryProp('inputs');
const callback = parsePropMetadataParserInput;

/**
 * A function that tries to extract all possible information about an Angular declaration such as
 * its selector, inputs, outputs, host bindings, providers etc.
 */
export default (dec: AnyDeclaration<any>): Declaration => {
  const declaration: Declaration = {
    host: {},
    inputs: [],
    outputs: [],
    exportAs: [],
    providers: [],
    queries: new Map(),
    selector: null,
  };

  // istanbul ignore if
  if (!dec || (typeof dec !== 'string' && typeof dec !== 'function' && typeof dec !== 'object')) {
    return declaration;
  }

  try {
    // istanbul ignore if
    if (typeof dec === 'string') {
      let name = dec;
      const index = name.indexOf('#');
      if (index !== -1) {
        name = name.substring(0, index);
      }
      if (name) {
        declaration.selector = name;
      }

      return declaration;
    }

    // istanbul ignore if
    if (dec.decorators && dec.decorators.length > 0) {
      const metaDecorator = (dec.decorators || []).find((decorator: any): boolean => {
        const metaArgs = decorator?.args?.[0];
        const type = decorator?.type;

        return (
          (metaArgs && (metaArgs.declarations || metaArgs.imports || metaArgs.exports)) ||
          (type && type?.prototype?.ngMetadataName === Directive?.prototype?.ngMetadataName) ||
          (type && type?.prototype?.ngMetadataName === Pipe?.prototype?.ngMetadataName) ||
          (type && type?.prototype?.ngMetadataName === Component?.prototype?.ngMetadataName) ||
          (type && type?.prototype?.ngMetadataName === NgModule?.prototype?.ngMetadataName)
        );
      });
      const metaArgs: any = metaDecorator?.args?.[0];

      if (metaArgs) {
        declaration.selector = extractSelector(metaArgs);
        declaration.exportAs.push(...extractExportAs(metaArgs));
        declaration.inputs.push(...extractInputs(metaArgs));
        declaration.outputs.push(...extractOutputs(metaArgs));
        declaration.providers.push(...extractProviders(metaArgs));
        coreDefineProperty(declaration, 'host', extractHost(metaArgs));
      }
    }

    // istanbul ignore if
    if (dec.propDecorators) {
      parsePropMetadata(dec, declaration);
    }
  } catch (e) {
    // istanbul ignore next
    console.log('ng-mocks CollectDeclarations:error', dec, e);
  }

  return declaration;
};