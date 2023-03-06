import { Lexer } from "./lexer";
import type { Token, TokenKind } from "../types/token.types";
import * as astBuilders from "./ast.builders";
import * as ast from "../types/ast.types";
import { Precedence, precedenceMap } from "./precedence";

type PrefixParseFn = () => ast.Expression | undefined;
type InfixParseFn = (_: ast.Expression) => ast.Expression | undefined;

export class Parser {
  lexer: Lexer;
  currentToken!: Token;
  peekToken: Token | undefined;

  prefixParseFunctions = new Map<TokenKind, PrefixParseFn>([
    ["integer", this.parseIntegerLiteral.bind(this)],
    ["true", this.parseBooleanLiteral.bind(this)],
    ["false", this.parseBooleanLiteral.bind(this)],
    ["function", this.parseFunctionLiteral.bind(this)],
    ["identifier", this.parseIdentifier.bind(this)],
    ["bang", this.parseUnaryExpression.bind(this)],
    ["minus", this.parseUnaryExpression.bind(this)],
    ["leftParen", this.parseGroupedExpression.bind(this)],
    ["if", this.parseIfExpression.bind(this)],
  ]);

  infixParseFunctions = new Map<TokenKind, InfixParseFn>([
    ["plus", this.parseBinaryExpression.bind(this)],
    ["minus", this.parseBinaryExpression.bind(this)],
    ["divide", this.parseBinaryExpression.bind(this)],
    ["multiply", this.parseBinaryExpression.bind(this)],
    ["equal", this.parseBinaryExpression.bind(this)],
    ["notEqual", this.parseBinaryExpression.bind(this)],
    ["lessThan", this.parseBinaryExpression.bind(this)],
    ["greaterThan", this.parseBinaryExpression.bind(this)],
    ["leftParen", this.parseCallExpression.bind(this)],
  ]);

  errors: string[];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.errors = [];

    const firstToken = lexer.createToken();

    if (!firstToken) throw new Error("No token found");

    this.currentToken = firstToken;
    this.peekToken = lexer.createToken();
  }

  nextToken(): void {
    if (!this.peekToken) {
      throw new Error("No more tokens");
    }

    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.createToken();
  }

  currentTokenIs(kind: Token["kind"]) {
    return this.currentToken.kind === kind;
  }

  peekTokenIs(kind: Token["kind"]) {
    return this.peekToken?.kind === kind;
  }

  expectPeek(kind: Token["kind"]) {
    if (this.peekTokenIs(kind)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(kind);
      return false;
    }
  }

  peekError(type: TokenKind) {
    this.errors.push(
      `expected next token to be ${type}, got ${this.peekToken?.kind} instead`
    );
  }

  currentPrecedence() {
    const precedence = precedenceMap.get(this.currentToken.kind);

    return precedence ?? Precedence.Lowest;
  }

  peekPrecedence() {
    const precedence = this.peekToken && precedenceMap.get(this.peekToken.kind);

    return precedence ?? Precedence.Lowest;
  }

  parse() {
    const statements: ast.Statement[] = [];

    while (this.currentToken.kind !== "eof") {
      const statement = this.parseStatement();

      if (statement) statements.push(statement);

      this.nextToken();
    }

    return astBuilders.program(statements);
  }

  parseStatement() {
    switch (this.currentToken.kind) {
      case "let":
        return this.parseLetStatement();
      case "return":
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseLetStatement() {
    if (!this.expectPeek("identifier")) return;

    const name = astBuilders.identifier(this.currentToken.text);

    if (!this.expectPeek("assigner")) return;

    this.nextToken();

    const expression = this.parseExpression(Precedence.Lowest);

    if (!expression) throw new Error("Expected new expression");

    while (!this.currentTokenIs("semicolon")) this.nextToken();

    return astBuilders.letStatement(name, expression);
  }

  parseReturnStatement() {
    this.nextToken();

    const expression = this.parseExpression(Precedence.Lowest);

    if (!expression) throw new Error("Expected expression");

    while (!this.currentTokenIs("semicolon")) this.nextToken();

    return astBuilders.returnStatement(expression);
  }

  parseExpressionStatement() {
    const expression = this.parseExpression(Precedence.Lowest);

    if (!expression) return undefined;

    while (this.peekTokenIs("semicolon")) this.nextToken();

    return astBuilders.expressionStatement(expression);
  }

  parseIdentifier() {
    return astBuilders.identifier(this.currentToken.text);
  }

  parseIntegerLiteral() {
    const value = Number(this.currentToken.text);

    if (Number.isNaN(value)) {
      this.errors.push(`could not parse ${this.currentToken.text} as integer`);
      return undefined;
    }

    return astBuilders.integerLiteral(value);
  }

  parseBooleanLiteral() {
    return astBuilders.booleanLiteral(this.currentToken.kind === "true");
  }

  parseFunctionLiteral() {
    if (!this.expectPeek("leftParen")) return;

    const parameters = this.parseFunctionParameters();

    if (!parameters) return;

    if (!this.expectPeek("leftBrace")) return;

    const body = this.parseBlockStatement();

    return astBuilders.functionLiteral(parameters, body);
  }

  parseFunctionParameters() {
    const identifiers: ast.Identifier[] = [];

    if (this.peekTokenIs("rightParen")) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    identifiers.push(astBuilders.identifier(this.currentToken.text));

    while (this.peekTokenIs("comma")) {
      this.nextToken();
      this.nextToken();
      identifiers.push(astBuilders.identifier(this.currentToken.text));
    }

    if (!this.expectPeek("rightParen")) {
      return;
    }

    return identifiers;
  }

  parseExpression(precedence: Precedence) {
    const prefixParseFn = this.prefixParseFunctions.get(this.currentToken.kind);

    if (!prefixParseFn) {
      this.errors.push(`No unary parse function for ${this.currentToken.kind}`);
      return;
    }

    let leftExpression = prefixParseFn();

    while (
      !this.peekTokenIs("semicolon") &&
      precedence < this.peekPrecedence()
    ) {
      const peekKind = this.peekToken?.kind;

      if (!peekKind) throw new Error("peekKind cannot be null.");

      const infixParseFn = this.infixParseFunctions.get(peekKind);

      if (!infixParseFn) return leftExpression;

      this.nextToken();

      if (!leftExpression) throw new Error("Expected to find left expression");

      leftExpression = infixParseFn(leftExpression);
    }

    return leftExpression;
  }

  parseUnaryExpression(): ast.UnaryExpression | undefined {
    const operator = this.currentToken.text;

    this.nextToken();

    const right = this.parseExpression(Precedence.Unary);

    if (!right) return;

    return astBuilders.unaryExpression(operator, right);
  }

  parseBinaryExpression(left: ast.Expression) {
    const operator = this.currentToken.text;

    const precedence = this.currentPrecedence();

    this.nextToken();

    const right = this.parseExpression(precedence);

    if (!right) return;

    return astBuilders.binaryExpression(operator, left, right);
  }

  parseCallExpression(left: ast.Expression) {
    const args = this.parseCallArugments();

    if (left.kind === "identifier" || left.kind == "functionLiteral") {
      if (!args) return;
      return astBuilders.callExpression(left, args);
    }
  }

  parseCallArugments(): ast.Expression[] | undefined {
    const args: ast.Expression[] = [];
    if (this.peekTokenIs("rightParen")) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    const arg = this.parseExpression(Precedence.Lowest);
    if (!arg) return;
    args.push(arg);

    while (this.peekTokenIs("comma")) {
      this.nextToken();
      this.nextToken();
      const arg = this.parseExpression(Precedence.Lowest);
      if (arg) args.push(arg);
    }

    if (!this.expectPeek("rightParen")) return;
    return args;
  }

  parseGroupedExpression(): ast.Expression | undefined {
    this.nextToken();
    const expression = this.parseExpression(Precedence.Lowest);
    if (!this.expectPeek("rightParen")) {
      return;
    }
    return expression;
  }

  parseIfExpression(): ast.IfExpression | undefined {
    if (!this.expectPeek("leftParen")) return;

    this.nextToken();

    const condition = this.parseExpression(Precedence.Lowest);

    if (
      !condition ||
      !this.expectPeek("rightParen") ||
      !this.expectPeek("leftBrace")
    ) {
      return;
    }

    const consequence = this.parseBlockStatement();

    if (!this.peekTokenIs("else")) {
      return astBuilders.ifExpression(condition, consequence);
    }

    this.nextToken();

    if (!this.expectPeek("leftBrace")) return;

    const alternative = this.parseBlockStatement();

    return astBuilders.ifExpression(condition, consequence, alternative);
  }

  parseBlockStatement() {
    const statements: ast.Statement[] = [];

    this.nextToken();

    while (!this.currentTokenIs("rightBrace") && !this.currentTokenIs("eof")) {
      const statement = this.parseStatement();

      if (statement) statements.push(statement);

      this.nextToken();
    }

    return astBuilders.blockStatement(statements);
  }
}
