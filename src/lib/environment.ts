import { Value, Fn } from "../types/value.types";

export class Environment {
  store: Map<string, Value>;
  outer?: Environment;

  constructor(outer?: Environment) {
    this.store = new Map();
    this.outer = outer;
  }

  get(name: string): Value | undefined {
    let obj = this.store.get(name);

    if (!obj) obj = this.outer?.get(name);

    return obj;
  }

  set(name: string, value: Value): void {
    this.store.set(name, value);
  }

  static createFunctionEnv(func: Fn, args: Value[]): Environment {
    const environment = new Environment(func.env);

    for (let p = 0; p < func.parameters.length; p++) {
      const { value } = func.parameters[p];
      const arg = args[p];
      environment.set(value, arg);
    }

    return environment;
  }
}
