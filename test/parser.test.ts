import { Lexer } from "../src/lib/lexer";
import { Parser } from "../src/lib/parser";
import * as astBuilders from "../src/lib/ast.builders";
import type {
  ExpressionStatement,
  FunctionLiteral,
} from "../src/types/ast.types";

const checkParserErrors = (parser: Parser) => {
  if (parser.errors.length !== 0) {
    let message = "The parser produced the following errors:\n\n";
    for (const error of parser.errors) {
      message += "ERROR: " + error + "\n";
    }
    throw new Error(message);
  }
};

test("testLetStatement", () => {
  const expected = astBuilders.program([
    astBuilders.letStatement(
      astBuilders.identifier("x"),
      astBuilders.integerLiteral(5)
    ),
    astBuilders.letStatement(
      astBuilders.identifier("y"),
      astBuilders.integerLiteral(10)
    ),
    astBuilders.letStatement(
      astBuilders.identifier("foobar"),
      astBuilders.integerLiteral(838383)
    ),
  ]);

  const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);
  expect(program).toStrictEqual(expected);
});

test("test return statement", () => {
  const expected = astBuilders.program([
    astBuilders.returnStatement(astBuilders.integerLiteral(5)),
    astBuilders.returnStatement(astBuilders.integerLiteral(10)),
    astBuilders.returnStatement(astBuilders.integerLiteral(993322)),
  ]);

  const input = `
    return 5;
    return 10;
    return 993322;
  `;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);
  expect(program).toStrictEqual(expected);
});

test("test identifier expression", () => {
  const expected = astBuilders.program([
    astBuilders.expressionStatement(astBuilders.identifier("foobar")),
  ]);

  const input = "foobar;";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);
  expect(program).toStrictEqual(expected);
});

test("test integer literal expression", () => {
  const expected = astBuilders.program([
    astBuilders.expressionStatement(astBuilders.integerLiteral(5)),
  ]);

  const input = "5;";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);
  expect(program).toStrictEqual(expected);
});

test("test parsing prefix expressions", () => {
  const expected = [
    astBuilders.program([
      astBuilders.expressionStatement(
        astBuilders.unaryExpression("!", astBuilders.integerLiteral(5))
      ),
    ]),
    astBuilders.program([
      astBuilders.expressionStatement(
        astBuilders.unaryExpression("-", astBuilders.integerLiteral(15))
      ),
    ]),
    astBuilders.program([
      astBuilders.expressionStatement(
        astBuilders.unaryExpression("!", astBuilders.booleanLiteral(true))
      ),
    ]),
    astBuilders.program([
      astBuilders.expressionStatement(
        astBuilders.unaryExpression("!", astBuilders.booleanLiteral(false))
      ),
    ]),
  ];

  const actual = ["!5;", "-15;", "!true", "!false"].map((input) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parse();
    checkParserErrors(parser);
    return program;
  });

  expect(actual).toStrictEqual(expected);
});

test("test parsing infix expression", () => {
  const operators = ["+", "-", "*", "/", ">", "<", "==", "!="];

  const expected = operators.map((operator) => {
    return astBuilders.program([
      astBuilders.expressionStatement(
        astBuilders.binaryExpression(
          operator,
          astBuilders.integerLiteral(5),
          astBuilders.integerLiteral(5)
        )
      ),
    ]);
  });

  const actual = operators.map((operator) => {
    const lexer = new Lexer(`5 ${operator} 5;`);
    const parser = new Parser(lexer);
    const program = parser.parse();
    checkParserErrors(parser);
    return program;
  });

  expect(actual).toStrictEqual(expected);
});

test("test operator precedence parsing", () => {
  [
    ["-a * b", "((-a) * b)"],
    ["!-a", "(!(-a))"],
    ["a + b + c", "((a + b) + c)"],
    ["a + b - c", "((a + b) - c)"],
    ["a * b * c", "((a * b) * c)"],
    ["a * b / c", "((a * b) / c)"],
    ["a + b / c", "(a + (b / c))"],
    ["a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f)"],
    ["3 + 4; -5 * 5", "(3 + 4)((-5) * 5)"],
    ["5 > 4 == 3 < 4", "((5 > 4) == (3 < 4))"],
    ["5 < 4 != 3 > 4", "((5 < 4) != (3 > 4))"],
    ["3 + 4 * 5 == 3 * 1 + 4 * 5", "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))"],
    ["true", "true"],
    ["true", "true"],
    ["3 > 5 == false", "((3 > 5) == false)"],
    ["3 < 5 == true", "((3 < 5) == true)"],
    ["1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"],
    ["(5 + 5) * 2", "((5 + 5) * 2)"],
    ["2 / (5 + 5)", "(2 / (5 + 5))"],
    ["-(5 + 5)", "(-(5 + 5))"],
    ["!(true == true)", "(!(true == true))"],
  ].forEach(([input, expected]) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parse();
    if (!program) return;
    checkParserErrors(parser);
    const actual = astBuilders.toString(program);
    expect(actual).toStrictEqual(expected);
  });
});

test("test boolean expression", () => {
  const expected = astBuilders.program([
    astBuilders.expressionStatement(astBuilders.booleanLiteral(true)),
    astBuilders.expressionStatement(astBuilders.booleanLiteral(false)),
    astBuilders.letStatement(
      astBuilders.identifier("foobar"),
      astBuilders.booleanLiteral(true)
    ),
    astBuilders.letStatement(
      astBuilders.identifier("barfoo"),
      astBuilders.booleanLiteral(false)
    ),
  ]);

  const input = `
    true;
    false;
    let foobar = true;
    let barfoo = false;`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);

  expect(program).toStrictEqual(expected);
});

test("test if expression", () => {
  const expected = astBuilders.program([
    astBuilders.expressionStatement(
      astBuilders.ifExpression(
        astBuilders.binaryExpression(
          "<",
          astBuilders.identifier("x"),
          astBuilders.identifier("y")
        ),
        astBuilders.blockStatement([
          astBuilders.expressionStatement(astBuilders.identifier("x")),
        ])
      )
    ),
  ]);

  const input = `if (x < y) { x }`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);

  expect(program).toStrictEqual(expected);
});

test("test if else expression", () => {
  const expected = astBuilders.program([
    astBuilders.expressionStatement(
      astBuilders.ifExpression(
        astBuilders.binaryExpression(
          "<",
          astBuilders.identifier("x"),
          astBuilders.identifier("y")
        ),
        astBuilders.blockStatement([
          astBuilders.expressionStatement(astBuilders.identifier("x")),
        ]),
        astBuilders.blockStatement([
          astBuilders.expressionStatement(astBuilders.identifier("y")),
        ])
      )
    ),
  ]);

  const input = `if (x < y) { x } else { y }`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);

  expect(program).toStrictEqual(expected);
});

test("test function literal", () => {
  const expected = astBuilders.program([
    astBuilders.expressionStatement(
      astBuilders.functionLiteral(
        [astBuilders.identifier("x"), astBuilders.identifier("y")],
        astBuilders.blockStatement([
          astBuilders.expressionStatement(
            astBuilders.binaryExpression(
              "+",
              astBuilders.identifier("x"),
              astBuilders.identifier("y")
            )
          ),
        ])
      )
    ),
  ]);

  const input = `fn(x, y) { x + y; }`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);
  expect(program).toStrictEqual(expected);
});

test("test function parameter parsing", () => {
  const expected = [[], ["x"], ["x", "y", "z"]];

  const input = `
    fn() { };
    fn(x) { };
    fn(x, y, z) { }`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);

  const stmt = program?.body as ExpressionStatement[];
  const lits = stmt.map((e) => e.expression) as FunctionLiteral[];
  const params = lits.map((f) => f.parameters.map((p) => p.value));
  expect(params).toStrictEqual(expected);
});

test("test call expression", () => {
  const expected = astBuilders.program([
    astBuilders.expressionStatement(
      astBuilders.callExpression(astBuilders.identifier("add"), [
        astBuilders.integerLiteral(1),
        astBuilders.binaryExpression(
          "*",
          astBuilders.integerLiteral(2),
          astBuilders.integerLiteral(3)
        ),
        astBuilders.binaryExpression(
          "+",
          astBuilders.integerLiteral(4),
          astBuilders.integerLiteral(5)
        ),
      ])
    ),
  ]);

  const input = `add(1, 2 * 3, 4 + 5);`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  checkParserErrors(parser);
  expect(program).toStrictEqual(expected);
});
