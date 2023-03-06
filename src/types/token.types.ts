export type Token = {
  kind: TokenKind;
  text: string;
};

export type TokenKind =
  | "assigner"
  | "multiply"
  | "bang"
  | "comma"
  | "else"
  | "eof"
  | "equal"
  | "false"
  | "function"
  | "greaterThan"
  | "identifier"
  | "if"
  | "illegal"
  | "integer"
  | "leftBrace"
  | "leftParen"
  | "lessThan"
  | "let"
  | "minus"
  | "notEqual"
  | "plus"
  | "return"
  | "rightBrace"
  | "rightParen"
  | "semicolon"
  | "divide"
  | "true";
