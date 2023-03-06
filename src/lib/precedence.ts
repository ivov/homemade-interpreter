import type { TokenKind } from "../types/token.types";

export enum Precedence {
  Lowest = 0,
  Equal = 1,
  LessGreater = 2,
  SumSub = 3,
  MultiplyDivide = 4,
  Unary = 5,
  Call = 6,
}

export const precedenceMap = new Map<TokenKind, number>([
  ["equal", Precedence.Equal],
  ["notEqual", Precedence.Equal],
  ["lessThan", Precedence.LessGreater],
  ["greaterThan", Precedence.LessGreater],
  ["plus", Precedence.SumSub],
  ["minus", Precedence.SumSub],
  ["divide", Precedence.MultiplyDivide],
  ["multiply", Precedence.MultiplyDivide],
  ["leftParen", Precedence.Call],
]);
