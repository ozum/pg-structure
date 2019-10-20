module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  extends: [
    "eslint:recommended", // TURN ON ESLint recommended rules.
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended", // TURN ON TypeScript rules by using `typescript-eslint/typescript-eslint`.
    "plugin:jest/recommended", // TURN ON Jest rules by using "jest-community/eslint-plugin-jest".
    "airbnb-base", // TURN ON airbnb-base rules.
    "plugin:prettier/recommended", // RUN Prettier as ESLint rule by using `prettier/eslint-plugin-prettier` and TURN OFF ESLint rules which conflict with Prettier by using `prettier/eslint-config-prettier`.
    "prettier/@typescript-eslint", // TURN OFF ESLint TypesSript rules which conflict with Prettier by using `prettier/eslint-config-prettier`.
  ],
  plugins: ["@typescript-eslint"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".mjs", ".ts", ".tsx"], // Allow import and resolve for *.ts modules.
      },
    },
  },
  rules: {
    "lines-between-class-members": ["warn", "always", { exceptAfterSingleLine: true }],
    "no-dupe-class-members": "off", // Prevents method overload in TypeScript, and TypeScript already checks duplicates.
    "no-unused-vars": "off", // @typescript-eslint/recommended has same rule
    "no-underscore-dangle": "off",
    "@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: true, allowTypedFunctionExpressions: true }],
    "@typescript-eslint/no-explicit-any": "off",
  },
  overrides: [
    {
      files: ["*.spec.ts", "*.test.ts"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
  ],
};
