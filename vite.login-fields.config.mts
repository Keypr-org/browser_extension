import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: false,

        rolldownOptions: {
            input: "src/content/login-fields-entry.ts",

            output: {
                format: "iife",
                entryFileNames: "content/login-fields.js"
            }
        }
    }
});