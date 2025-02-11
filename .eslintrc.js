/* eslint-disable */
module.exports = {
  'env': {
    "es6": true,
    "node": true,
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "array-bracket-spacing": ["error", "never"],
    "array-element-newline": ["error", "consistent"],
    "arrow-spacing": ["error", { "before": true, "after": true }],
    "block-spacing": "error",
    "camelcase": 0,
    "comma-spacing": ["error", { "before": false, "after": true }],
    "computed-property-spacing": ["error", "never"],
    "dot-location": ["error", "property"],
    "eol-last": ["error", "always"],
    "eqeqeq": ["error", "always"],
    "func-call-spacing": ["error", "never"],
    "function-paren-newline": ["error", "never"],
    "implicit-arrow-linebreak": ["error", "beside"],
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "key-spacing": ["error", { "afterColon": true }],
    "keyword-spacing": ["error", { "before": true, "after": true }],
    "linebreak-style": ["error", "unix"],
    "max-len": ["error", { "code": 120, "ignoreComments": true, "ignoreTrailingComments": true }],
    "no-console": "error",
    "no-case-declarations": 0,
    "no-mixed-spaces-and-tabs": "error",
    "no-multi-spaces": "error",
    "no-spaced-func": "error",
    "no-trailing-spaces": ["error", { "ignoreComments": true }],
    "no-whitespace-before-property": "error",
    "nonblock-statement-body-position": ["error", "beside"],
    "object-curly-newline": ["error", { "multiline": true, "minProperties": 5, "consistent": true }],
    "object-curly-spacing": ["error", "always", { "arraysInObjects": true, "objectsInObjects": true }],
    "object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }],
    "one-var": ["error", "never"],
    "operator-linebreak": ["error", "after", { "overrides": { "?": "before", ":": "before" } }],
    "padded-blocks": ["error", "never"],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
    ],
    "quotes": ["error", "single"],
    "rest-spread-spacing": ["error", "never"],
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", { "anonymous": "always", "named": "never", "asyncArrow": "always" }],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": ["error", "always"],
    "semi": ["error", "never"],
    "semi-spacing": ["error", { "before": false, "after": true }],
    "switch-colon-spacing": "error",
    "template-tag-spacing": ["error", "always"],
  }
};
