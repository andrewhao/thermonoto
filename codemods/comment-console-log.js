export default function transformer(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  const callExpressions = root.find(j.CallExpression, {
    callee: {
      type: "MemberExpression",
      object: { type: "Identifier", name: "console" }
    }
  });

  callExpressions.remove();

  return root.toSource();
}
