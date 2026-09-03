import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: false,

        rolldownOptions: {
            input: "src/content/entry.ts",

            output: {
                format: "iife",
                entryFileNames: "content/entry.js"
            }
        }
    }
});