import type { Token, TokenKind } from "../types/token.types";

export class Lexer {
  input = "";
  position = 0;
  peekPosition = 0;
  char = "";
  finished = false;

  constructor(input: string) {
    this.input = input;

    this.readChar();
  }

  readChar(): void {
    if (this.peekPosition >= this.input.length) {
      this.char = "\0";
    } else {
      this.char = this.input[this.peekPosition];
    }

    this.position = this.peekPosition;
    this.peekPosition += 1;
  }

  peekChar(): string {
    if (this.peekPosition >= this.input.length) return "\0";

    return this.input[this.peekPosition];
  }

  createToken(): Token | undefined {
    if (this.finished) return;

    let token: Token;

    this.skipWhitespace();

    switch (this.char) {
      case "=":
        if (this.peekChar() === "=") {
          this.readChar();
          token = { kind: "equal", text: "==" };
        } else {
          token = { kind: "assigner", text: "=" };
        }
        break;
      case "!":
        if (this.peekChar() === "=") {
          this.readChar();
          token = { kind: "notEqual", text: "!=" };
        } else {
          token = { kind: "bang", text: "!" };
        }
        break;
      case "+":
        token = { kind: "plus", text: "+" };
        break;
      case "-":
        token = { kind: "minus", text: "-" };
        break;
      case "/":
        token = { kind: "divide", text: "/" };
        break;
      case "*":
        token = { kind: "multiply", text: "*" };
        break;
      case "<":
        token = { kind: "lessThan", text: "<" };
        break;
      case ">":
        token = { kind: "greaterThan", text: ">" };
        break;
      case ";":
        token = { kind: "semicolon", text: ";" };
        break;
      case ",":
        token = { kind: "comma", text: "," };
        break;
      case "(":
        token = { kind: "leftParen", text: "(" };
        break;
      case ")":
        token = { kind: "rightParen", text: ")" };
        break;
      case "{":
        token = { kind: "leftBrace", text: "{" };
        break;
      case "}":
        token = { kind: "rightBrace", text: "}" };
        break;
      case "\0":
        token = { kind: "eof", text: "\0" };
        this.finished = true;
        break;
      default: {
        if (isLetter(this.char)) {
          token = this.readText();
          return token;
        } else if (isNumber(this.char)) {
          token = this.readNumber();
          return token;
        } else {
          token = { kind: "illegal", text: this.char };
          break;
        }
      }
    }

    this.readChar();

    return token;
  }

  skipWhitespace(): void {
    while (isWhitespace(this.char)) this.readChar();
  }

  readText(): Token {
    const start = this.position;

    while (isLetter(this.char)) this.readChar();

    const text = this.input.substring(start, this.position);

    const keywords: {
      [key: string]: TokenKind;
    } = {
      fn: "function",
      let: "let",
      true: "true",
      false: "false",
      if: "if",
      else: "else",
      return: "return",
    };

    const kind = keywords[text];

    if (kind) return { kind, text };

    return { kind: "identifier", text };
  }

  readNumber(): Token {
    const start = this.position;

    while (isNumber(this.char)) this.readChar();

    const text = this.input.substring(start, this.position);

    return { kind: "integer", text };
  }
}

const isNumber = (char: string) => /^[0-9]$/.test(char);
const isLetter = (char: string) => /^[a-zA-Z]$/.test(char);
const isWhitespace = (char: string) => /^\s$/.test(char);
