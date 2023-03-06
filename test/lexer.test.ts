import { Lexer } from "../src/lib/lexer";
import type { Token } from "../src/types/token.types";

export const lex = (input: string): Token[] => {
  const tokens: Token[] = [];

  const lexer = new Lexer(input);

  let token = lexer.createToken();

  while (token) {
    tokens.push(token);
    token = lexer.createToken();
  }

  return tokens;
};

test("test lexing multiple statements", () => {
  const input = `
    let two = 2;
    let ten = 10;
  
    let add = fn(x, y) {
      x + y;
    };

    let result = add(two, ten);
    !-/*5;
    5 < 10 > 5;

    if (5 < 10) {
      return true;
    } else {
      return false;
    }

    10 == 10;
    10 != 99;
  `;

  const expected: Token[] = [
    { kind: "let", text: "let" },
    { kind: "identifier", text: "two" },
    { kind: "assigner", text: "=" },
    { kind: "integer", text: "2" },
    { kind: "semicolon", text: ";" },
    { kind: "let", text: "let" },
    { kind: "identifier", text: "ten" },
    { kind: "assigner", text: "=" },
    { kind: "integer", text: "10" },
    { kind: "semicolon", text: ";" },
    { kind: "let", text: "let" },
    { kind: "identifier", text: "add" },
    { kind: "assigner", text: "=" },
    { kind: "function", text: "fn" },
    { kind: "leftParen", text: "(" },
    { kind: "identifier", text: "x" },
    { kind: "comma", text: "," },
    { kind: "identifier", text: "y" },
    { kind: "rightParen", text: ")" },
    { kind: "leftBrace", text: "{" },
    { kind: "identifier", text: "x" },
    { kind: "plus", text: "+" },
    { kind: "identifier", text: "y" },
    { kind: "semicolon", text: ";" },
    { kind: "rightBrace", text: "}" },
    { kind: "semicolon", text: ";" },
    { kind: "let", text: "let" },
    { kind: "identifier", text: "result" },
    { kind: "assigner", text: "=" },
    { kind: "identifier", text: "add" },
    { kind: "leftParen", text: "(" },
    { kind: "identifier", text: "two" },
    { kind: "comma", text: "," },
    { kind: "identifier", text: "ten" },
    { kind: "rightParen", text: ")" },
    { kind: "semicolon", text: ";" },
    { kind: "bang", text: "!" },
    { kind: "minus", text: "-" },
    { kind: "divide", text: "/" },
    { kind: "multiply", text: "*" },
    { kind: "integer", text: "5" },
    { kind: "semicolon", text: ";" },
    { kind: "integer", text: "5" },
    { kind: "lessThan", text: "<" },
    { kind: "integer", text: "10" },
    { kind: "greaterThan", text: ">" },
    { kind: "integer", text: "5" },
    { kind: "semicolon", text: ";" },
    { kind: "if", text: "if" },
    { kind: "leftParen", text: "(" },
    { kind: "integer", text: "5" },
    { kind: "lessThan", text: "<" },
    { kind: "integer", text: "10" },
    { kind: "rightParen", text: ")" },
    { kind: "leftBrace", text: "{" },
    { kind: "return", text: "return" },
    { kind: "true", text: "true" },
    { kind: "semicolon", text: ";" },
    { kind: "rightBrace", text: "}" },
    { kind: "else", text: "else" },
    { kind: "leftBrace", text: "{" },
    { kind: "return", text: "return" },
    { kind: "false", text: "false" },
    { kind: "semicolon", text: ";" },
    { kind: "rightBrace", text: "}" },
    { kind: "integer", text: "10" },
    { kind: "equal", text: "==" },
    { kind: "integer", text: "10" },
    { kind: "semicolon", text: ";" },
    { kind: "integer", text: "10" },
    { kind: "notEqual", text: "!=" },
    { kind: "integer", text: "99" },
    { kind: "semicolon", text: ";" },
    { kind: "eof", text: "\0" },
  ];

  expect(lex(input)).toStrictEqual(expected);
});
