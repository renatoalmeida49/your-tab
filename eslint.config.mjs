import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import globals from "globals";

const production = process.env.NODE_ENV === "production";

export default [
  { ignores: ["dist/", "test-results/", "playwright-report/"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  prettierRecommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-console": production ? "warn" : "off",
      "no-debugger": production ? "warn" : "off",
      // CONVENÇÃO DO PROJETO: COMPONENTES COM UMA PALAVRA (Tab, Verse, Modal...)
      "vue/multi-word-component-names": "off",
    },
  },

  // <script lang="ts"> NOS .vue
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },

  {
    files: ["*.config.{js,mjs,ts}", "tests/**/*.{js,ts}"],
    languageOptions: { globals: { ...globals.node } },
  },
];
