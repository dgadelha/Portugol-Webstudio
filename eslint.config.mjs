import eslint from "@eslint/js";
import angular from "angular-eslint";
import prettier from "eslint-plugin-prettier/recommended";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...angular.configs.tsRecommended,
  // @ts-ignore
  unicorn.configs["flat/all"],
  prettier,
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.strictTypeChecked],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
        },
      ],
      "@typescript-eslint/array-type": ["error", { "default": "array-simple" }],
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigDirName: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      "node_modules/",
      ".angular/",
      "packages/**/lib/",
      "packages/**/dist/",
      "packages/**/node_modules/",
      // Arquivos gerados:
      "packages/antlr/src/Portugol*.ts",
      "packages/resources/assets/",
      "packages/resources/recursos.temp/",
      "packages/ide/src/index.html",
    ],
  },
  {
    rules: {
      "camelcase": "off",
      "capitalized-comments": "off",
      "func-names": ["error", "always"],
      "lines-between-class-members": "off",
      "new-cap": "off",
      "no-alert": "off",
      "no-await-in-loop": "off",
      "no-bitwise": "off",
      "no-case-declarations": "off",
      "no-empty": "off",
      "no-template-curly-in-string": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-useless-constructor": "off",
      "no-useless-escape": "off",
      "no-warning-comments": "off",
      "prefer-destructuring": "off",
      "prefer-named-capture-group": "off",
      "require-unicode-regexp": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-abusive-eslint-disable": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/no-for-loop": "off",
      "unicorn/no-keyword-prefix": "off",
      "unicorn/no-lonely-if": "off",
      "unicorn/no-null": "off",
      "unicorn/no-object-as-default-parameter": "off",
      "unicorn/prefer-export-from": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/require-post-message-target-origin": "off",
    },
  },
);
