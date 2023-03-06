export type Node = Program | Statement | Expression;

export type Program = {
  kind: "program";
  body: Statement[];
};

export type Statement =
  | LetStatement
  | ReturnStatement
  | ExpressionStatement
  | BlockStatement;

export type Expression =
  | Identifier
  | IntegerLiteral
  | BooleanLiteral
  | FunctionLiteral
  | UnaryExpression
  | BinaryExpression
  | IfExpression
  | CallExpression;

/**
 * Statements
 */

export type LetStatement = {
  kind: "letStatement";
  name: Identifier;
  value: Expression;
};

export type ReturnStatement = {
  kind: "returnStatement";
  returnValue: Expression;
};

export type ExpressionStatement = {
  kind: "expressionStatement";
  expression: Expression;
};

export type BlockStatement = {
  kind: "blockStatement";
  statements: Statement[];
};

/**
 * Expressions
 */

export type Identifier = {
  kind: "identifier";
  value: string;
};

export type IntegerLiteral = {
  kind: "integerLiteral";
  value: number;
};

export type BooleanLiteral = {
  kind: "booleanLiteral";
  value: boolean;
};

export type UnaryExpression = {
  kind: "unaryExpression";
  operator: string;
  right: Expression;
};

export type BinaryExpression = {
  kind: "binaryExpression";
  operator: string;
  left: Expression;
  right: Expression;
};

export type IfExpression = {
  kind: "ifExpression";
  condition: Expression;
  consequence: BlockStatement;
  alternative?: BlockStatement;
};

export type CallExpression = {
  kind: "callExpression";
  func: Identifier | FunctionLiteral;
  args: Expression[];
};

export type FunctionLiteral = {
  kind: "functionLiteral";
  parameters: Identifier[];
  body: BlockStatement;
};
