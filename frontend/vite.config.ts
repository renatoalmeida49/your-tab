/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // SÓ VARIÁVEIS E MIXINS: NÃO GERA CSS EM CADA COMPONENTE
        additionalData: '@use "@/assets/scss" as *;\n',
      },
    },
  },

  server: {
    // A API (backend/) RODA À PARTE. PELO PROXY, FRONT E API FICAM NA MESMA
    // ORIGEM, COMO EM PRODUÇÃO (NGINX), E O COOKIE DE SESSÃO FUNCIONA
    proxy: {
      "/api": "http://localhost:3000",
    },
  },

  build: {
    // O ÚNICO CHUNK ACIMA DE 500 kB É O html2pdf.js, CARREGADO SÓ AO GERAR O PDF
    chunkSizeWarningLimit: 1000,
  },

  test: {
    // OS E2E (tests/e2e) RODAM NO PLAYWRIGHT
    include: ["src/**/*.spec.{js,ts}"],
  },

  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
});
