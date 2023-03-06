import * as ast from "../types/ast.types";
import type {
  Integer,
  Boolean,
  Null,
  Error,
  ReturnValue,
  Fn,
  Value,
} from "../types/value.types";
import type { Environment } from "./environment";

export const TRUE: Readonly<Boolean> = { kind: "boolean", value: true };
export const FALSE: Readonly<Boolean> = { kind: "boolean", value: false };
export const NULL: Readonly<Null> = { kind: "null" };

export const integer = (value: number): Integer => ({ kind: "integer", value });

export const boolean = (value: boolean): Boolean => (value ? TRUE : FALSE);

export const returnValue = (value: Value): ReturnValue => ({
  kind: "returnValue",
  value,
});

export const fn = (
  parameters: ast.Identifier[],
  body: ast.BlockStatement,
  env: Environment
): Fn => {
  return {
    kind: "fn",
    parameters,
    body,
    env,
  };
};

export const error = (value: string): Error => ({
  kind: "error",
  value,
});
