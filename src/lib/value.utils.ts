import * as astBuilders from "./ast.builders";
import type { Error, Value } from "../types/value.types";

export const isError = (value: { kind: string }): value is Error => {
  return value.kind === "error";
};

export function toString(object: Value): string {
  switch (object.kind) {
    case "boolean":
      return `${object.value} : boolean`;
    case "integer":
      return `${object.value} : integer`;
    case "null":
      return "null";
    case "error":
      return `ERROR: ${object.value}`;
    case "returnValue":
      return toString(object);
    case "fn": {
      const params = object.parameters.map(astBuilders.toString).join(", ");
      const body = astBuilders.toString(object.body);

      return `fn(${params}){\n${body}\n}`;
    }
  }
}

export function equals(a: Value, b: Value) {
  if (a.kind === "null" && b.kind === "null") return true;

  if (a.kind === "null") return false;

  if (b.kind === "null") return false;

  if (a.kind === "fn" || b.kind === "fn") return false;

  return a.value === b.value;
}

export function isTruthy(a: Value) {
  switch (a.kind) {
    case "null":
      return false;
    case "boolean":
      return a.value;
    case "integer":
      return true;
  }

  return true;
}
