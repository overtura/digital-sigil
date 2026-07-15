import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const typescriptRules = [js.configs.recommended, ...tseslint.configs.strict];

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "playwright-report",
      "test-results",
      "work",
      "outputs",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: typescriptRules,
    languageOptions: { globals: globals.browser },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["tests/**/*.ts"],
    extends: typescriptRules,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["*.config.ts"],
    extends: typescriptRules,
    languageOptions: { globals: globals.node },
  },
);
