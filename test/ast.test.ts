import * as ast from "../src/lib/ast.builders";

test("test nodeToString", () => {
  const program = ast.program([
    ast.letStatement(ast.identifier("myVar"), ast.identifier("anotherVar")),
  ]);

  const repr = ast.toString(program);
  expect(repr).toBe("let myVar = anotherVar;");
});
