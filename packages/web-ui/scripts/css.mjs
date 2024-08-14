import fs from "node:fs";
import { minify } from "csso";
import kebabCase from "kebab-case";

const globClasses = {};
let globStyles = "";

/**
 * @typedef {{types: import('@babel/types')}} API
 * @param {API} api
 * @returns {import('@babel/core').PluginItem}
 * */
export default (api) => {
  const { types: t } = api;

  return {
    visitor: {
      ImportDeclaration(path) {
        // Check if the import is from "@css"
        if (path.node.source.value === "@css") {
          // Check if "css" is imported
          const cssImport = path.node.specifiers.find((specifier) => specifier.imported && specifier.imported.name === "css");
          if (cssImport) {
            this.cssImportName = cssImport.local.name;
          }
          path.remove();
        }
      },
      VariableDeclarator(path) {
        // Check if the variable is being assigned the result of the css tagged template
        if (t.isTaggedTemplateExpression(path.node.init) && t.isIdentifier(path.node.init.tag, { name: this.cssImportName })) {
          let className = path.node.id.name;

          // Remove the "Class" suffix if it exists
          if (className.endsWith("Class")) {
            className = className.slice(0, -5);
          }

          // Convert to kebab case
          const kebabClassName = kebabCase(className);

          const cssContent = path.node.init.quasi.quasis.map((quasi) => quasi.value.cooked).join("");

          if (className === "glob") {
            globStyles += minify(cssContent).css;
          } else {
            globClasses[kebabClassName] = cssContent;
          }
          // Replace the original variable with the kebab-case class name
          path.node.init = t.stringLiteral(`frdy ${kebabClassName}`);
        }
      },
    },
  };
};

process.on("exit", () => {
  // Generate the final CSS structure
  let cssOutput = ".frdy {\n";
  cssOutput += globStyles;

  Object.keys(globClasses).forEach((className) => {
    const m = `&.${className} {${globClasses[className]}}`;
    cssOutput += `${m}\n`;
  });
  cssOutput += "}";

  // Write to "styles.css"
  fs.writeFileSync("src/assets/styles.css", cssOutput);
});
