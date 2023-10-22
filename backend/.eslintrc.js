module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
  ],
  overrides: [
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      files: ["**/*.{ts,tsx}"],
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 7,
    sourceType: "module",
		tsconfigRootDir: __dirname,
		project: './tsconfig.json'
  },
  plugins: ["@typescript-eslint", "simple-import-sort", "import"],
  ignorePatterns: [
    ".eslintrc.js",
    "node_modules",
		".vscode",
		"webpack.config.js"
  ],
  root: true,
  rules: {
    indent: "off",
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single", { avoidEscape: true }],
    "max-len": ["error", { code: 120 }],
    "object-curly-spacing": [2, "always"],
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "no-unused-vars": ["error", { vars: "all", args: "after-used", ignoreRestSiblings: false }],
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
  },
};
