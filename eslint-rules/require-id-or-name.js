/**
 * Enforces that form controls have al menos un id o name.
 * Evita advertencias de autofill y facilita asociar labels.
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Require id or name on form fields",
    },
    schema: [],
  },
  create(context) {
    const targets = new Set(["input", "textarea", "select", "option"]);

    return {
      JSXOpeningElement(node) {
        const nameNode = node.name;
        const elementName =
          nameNode.type === "JSXIdentifier" ? nameNode.name : null;
        if (!elementName || !targets.has(elementName)) return;

        const hasSpread = node.attributes.some(
          (attr) => attr.type === "JSXSpreadAttribute",
        );
        if (hasSpread) return; // No inferimos cuando hay spread

        let hasId = false;
        let hasName = false;

        for (const attr of node.attributes) {
          if (attr.type !== "JSXAttribute" || !attr.name) continue;
          if (attr.name.name === "id") hasId = true;
          if (attr.name.name === "name") hasName = true;
        }

        if (!hasId && !hasName) {
          context.report({
            node,
            message:
              "El campo debe tener 'id' o 'name' para soportar autofill y asociar labels.",
          });
        }
      },
    };
  },
};
