import * as ast from "../types/ast.types";
import * as valueBuilders from "./value.builders";
import * as valueUtils from "./value.utils";
import * as env from "./environment";
import type { Value, Integer } from "../types/value.types";

export function evaluate(node: ast.Node, env: env.Environment): Value {
  switch (node.kind) {
    case "program": {
      let result: Value | undefined;

      for (const statement of node.body) {
        result = evaluate(statement, env);

        if (result.kind === "returnValue") {
          return result.value;
        } else if (result.kind === "error") {
          return result;
        }
      }

      if (!result) throw new Error("Expected result to be defined");

      return result;
    }

    case "returnStatement": {
      const value = evaluate(node.returnValue, env);

      if (valueUtils.isError(value)) return value;

      return valueBuilders.returnValue(value);
    }

    case "letStatement": {
      const value = evaluate(node.value, env);

      if (valueUtils.isError(value)) return value;

      env.set(node.name.value, value);

      return value;
    }

    case "expressionStatement": {
      return evaluate(node.expression, env);
    }

    case "blockStatement": {
      let result: Value | undefined;

      for (const statement of node.statements) {
        result = evaluate(statement, env);

        if (result.kind === "returnValue" || result.kind === "error") {
          return result;
        }
      }

      if (!result) throw new Error("Expected result to be defined");

      return result;
    }

    case "integerLiteral": {
      return valueBuilders.integer(node.value);
    }

    case "booleanLiteral": {
      return valueBuilders.boolean(node.value);
    }

    case "functionLiteral": {
      return valueBuilders.fn(node.parameters, node.body, env);
    }

    case "identifier": {
      const value = env.get(node.value);

      if (!value)
        return valueBuilders.error(`identifier not found: ${node.value}`);

      return value;
    }

    case "unaryExpression": {
      const right = evaluate(node.right, env);

      if (valueUtils.isError(right)) return right;

      return evaluateUnaryExpression(node.operator, right);
    }

    case "binaryExpression": {
      const left = evaluate(node.left, env);

      if (valueUtils.isError(left)) return left;

      const right = evaluate(node.right, env);

      if (valueUtils.isError(right)) return left;

      return evaluateBinaryExpression(node.operator, left, right);
    }

    case "ifExpression": {
      return evaluateIfExpression(node, env);
    }

    case "callExpression": {
      const func = evaluate(node.func, env);

      if (valueUtils.isError(func)) return func;

      const args = evaluateExpressions(node.args, env);

      if (args.length == 1 && valueUtils.isError(args[0])) return args[0];

      return evaluateCallExpression(func, args);
    }

    default:
      throw new Error(`Unknown node: '${node}'`);
  }
}

function evaluateCallExpression(func: Value, args: Value[]): Value {
  if (func.kind !== "fn") {
    return valueBuilders.error("not a function: " + func.kind);
  }

  const fnEnv = env.Environment.createFunctionEnv(func, args);
  const evaluated = evaluate(func.body, fnEnv);

  if (evaluated.kind === "returnValue") return evaluated.value;

  return evaluated;
}

function evaluateExpressions(
  expressions: ast.Expression[],
  environment: env.Environment
): Value[] {
  const results: Value[] = [];

  for (const expression of expressions) {
    const evaluated = evaluate(expression, environment);

    if (valueUtils.isError(evaluated)) return [evaluated];

    results.push(evaluated);
  }

  return results;
}

function evaluateUnaryExpression(operator: string, right: Value): Value {
  switch (operator) {
    case "!":
      return evaluateBangOperatorExpression(right);
    case "-":
      return evaluateMinusOperatorExpression(right);
    default:
      return valueBuilders.error(`unknown operator: ${operator}${right.kind}`);
  }
}

function evaluateBangOperatorExpression(right: Value): Value {
  switch (right.kind) {
    case "boolean":
      return right.value ? valueBuilders.FALSE : valueBuilders.TRUE;
    case "null":
      return valueBuilders.TRUE;
    default:
      return valueBuilders.FALSE;
  }
}

function evaluateMinusOperatorExpression(right: Value): Value {
  if (right.kind !== "integer") {
    return valueBuilders.error(`unknown operator: -${right.kind}`);
  }

  return valueBuilders.integer(-right.value);
}

function evaluateBinaryExpression(
  operator: string,
  left: Value,
  right: Value
): Value {
  if (left.kind !== right.kind) {
    return valueBuilders.error(
      `type mismatch: ${left.kind} ${operator} ${right.kind}`
    );
  }

  switch (operator) {
    case "==":
      return valueBuilders.boolean(valueUtils.equals(left, right));
    case "!=":
      return valueBuilders.boolean(!valueUtils.equals(left, right));
  }

  if (left.kind === "integer" && right.kind === "integer") {
    return evaluateIntegerBinaryExpression(operator, left, right);
  }

  return valueBuilders.error(
    `unknown operator: ${left.kind} ${operator} ${right.kind}`
  );
}

function evaluateIntegerBinaryExpression(
  operator: string,
  left: Integer,
  right: Integer
): Value {
  switch (operator) {
    case "+":
      return valueBuilders.integer(left.value + right.value);
    case "-":
      return valueBuilders.integer(left.value - right.value);
    case "*":
      return valueBuilders.integer(left.value * right.value);
    case "/":
      return valueBuilders.integer(left.value / right.value);
    case ">":
      return valueBuilders.boolean(left.value > right.value);
    case "<":
      return valueBuilders.boolean(left.value < right.value);
    default:
      return valueBuilders.error(
        `unknown operator: ${left.kind} ${operator} ${right.kind}`
      );
  }
}

function evaluateIfExpression(
  node: ast.IfExpression,
  environment: env.Environment
): Value {
  const condition = evaluate(node.condition, environment);

  if (valueUtils.isError(condition)) return condition;

  if (valueUtils.isTruthy(condition)) {
    return evaluate(node.consequence, environment);
  } else if (node.alternative) {
    return evaluate(node.alternative, environment);
  }

  return valueBuilders.NULL;
}
