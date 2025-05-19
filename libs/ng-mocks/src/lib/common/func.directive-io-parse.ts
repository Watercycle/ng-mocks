import { DirectiveIo, DirectiveIoParsed } from './core.types';

export default function (param: DirectiveIo): DirectiveIoParsed {
  if (typeof param === 'string') {
    const [name, alias] = param.split(':').map(v => v.trim());

    if (name === alias || !alias) {
      return { name };
    }

    return { name, alias };
  }

  // Normalize object parameters to DirectiveIoParsed
  const result: DirectiveIoParsed = { 
    name: param.name,
    ...(param.alias !== undefined ? { alias: param.alias } : {}),
    ...(param.required !== undefined ? { required: param.required } : {}),
    ...(param.isSignal !== undefined ? { isSignal: param.isSignal } : {}),
    ...(param.transform !== undefined ? { transform: param.transform } : {})
  };

  return result;
}
