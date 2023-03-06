import * as ast from "./ast.types";
import * as env from "../lib/environment";

export type Value = Integer | Boolean | Null | Error | ReturnValue | Fn;

export type Integer = { kind: "integer"; value: number };

export type Boolean = { kind: "boolean"; value: boolean };

export type Null = { kind: "null" };

export type ReturnValue = { kind: "returnValue"; value: Value };

export type Error = { kind: "error"; value: string };

export type Fn = {
  kind: "fn";
  parameters: ast.Identifier[];
  body: ast.BlockStatement;
  env: env.Environment;
};
