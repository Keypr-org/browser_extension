import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: false,

        rolldownOptions: {
            input: "src/content/fill-credentials.ts",

            output: {
                format: "iife",
                entryFileNames: "content/fill-credentials.js"
            }
        }
    }
});