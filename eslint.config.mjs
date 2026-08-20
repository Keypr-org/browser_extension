import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        ignores: [
            "dist/**",
            "node_modules/**"
        ]
    },

    {
        files: ["**/*.ts"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended
        ],

        languageOptions: {
            globals: {
                chrome: "readonly"
            }
        },

        rules: {
            "no-console": "off"
        }
    }
]);