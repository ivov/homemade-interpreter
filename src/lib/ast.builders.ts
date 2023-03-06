import * as ast from "../types/ast.types";

export function letStatement(
  name: ast.Identifier,
  value: ast.Expression
): ast.LetStatement {
  return {
    kind: "letStatement",
    name,
    value,
  };
}

export function returnStatement(
  returnValue: ast.Expression
): ast.ReturnStatement {
  return {
    kind: "returnStatement",
    returnValue,
  };
}

export function expressionStatement(
  expression: ast.Expression
): ast.ExpressionStatement {
  return {
    kind: "expressionStatement",
    expression,
  };
}

export function blockStatement(
  statements: ast.Statement[]
): ast.BlockStatement {
  return {
    kind: "blockStatement",
    statements,
  };
}

export function identifier(value: string): ast.Identifier {
  return {
    kind: "identifier",
    value,
  };
}

export function integerLiteral(value: number): ast.IntegerLiteral {
  return {
    kind: "integerLiteral",
    value,
  };
}

export function booleanLiteral(value: boolean): ast.BooleanLiteral {
  return {
    kind: "booleanLiteral",
    value,
  };
}

export function functionLiteral(
  parameters: ast.Identifier[],
  body: ast.BlockStatement
): ast.FunctionLiteral {
  return {
    kind: "functionLiteral",
    parameters,
    body,
  };
}

export function unaryExpression(
  operator: string,
  right: ast.Expression
): ast.UnaryExpression {
  return {
    kind: "unaryExpression",
    operator,
    right,
  };
}

export function binaryExpression(
  operator: string,
  left: ast.Expression,
  right: ast.Expression
): ast.BinaryExpression {
  return {
    kind: "binaryExpression",
    operator,
    left,
    right,
  };
}

export function ifExpression(
  condition: ast.Expression,
  consequence: ast.BlockStatement,
  alternative?: ast.BlockStatement
): ast.IfExpression {
  return {
    kind: "ifExpression",
    condition,
    consequence,
    alternative,
  };
}

export function callExpression(
  func: ast.Identifier | ast.FunctionLiteral,
  args: ast.Expression[]
): ast.CallExpression {
  return {
    kind: "callExpression",
    func,
    args,
  };
}

export function program(statements: ast.Statement[]): ast.Program {
  return { kind: "program", body: statements };
}

export function toString(node: ast.Node): string {
  switch (node.kind) {
    case "letStatement": {
      const name = toString(node.name);
      const value = toString(node.value);
      return `let ${name} = ${value};`;
    }
    case "returnStatement": {
      const value = toString(node.returnValue);
      return `return ${value};`;
    }
    case "expressionStatement":
      return `${toString(node.expression)}`;
    case "identifier":
      return node.value;
    case "integerLiteral":
      return `${node.value.toString()}`;
    case "booleanLiteral":
      return `${node.value.toString()}`;
    case "unaryExpression":
      return `(${node.operator}${toString(node.right)})`;
    case "binaryExpression": {
      const left = toString(node.left);
      const op = node.operator;
      const right = toString(node.right);
      return `(${left} ${op} ${right})`;
    }
    case "callExpression": {
      const func = toString(node.func);
      const args = node.args.map(toString).join(", ");
      return `${func}(${args})`;
    }
    case "program":
      return node.body.map(toString).join("");
    case "ifExpression": {
      const cond = toString(node.condition);
      const cons = toString(node.consequence);
      const alt = node.alternative && toString(node.alternative);

      return !alt
        ? `if (${cond}) {${cons}}`
        : `if (${cond}) {${cons}} else {${alt}}`;
    }
    case "functionLiteral": {
      const parameters = node.parameters.map(toString).join(", ");
      const body = toString(node.body);
      return `fn(${parameters}) ${body}`;
    }
    case "blockStatement": {
      return node.statements.map(toString).join("");
    }
  }
}
