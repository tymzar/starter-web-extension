import { defineConfig } from "eslint/config";
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default defineConfig([
    eslintPluginUnicorn.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'react-hooks': reactHooksPlugin,
        },
        rules: {
            semi: "error",
            "prefer-const": "error",
            'unicorn/better-regex': 'warn',
            // Keep conventional JSDoc blocks (leading `*` on each line)
            'unicorn/no-asterisk-prefix-in-documentation-comments': 'off',
            // getHTML()/setHTMLUnsafe() need Chrome 125; manifest supports 111+
            'unicorn/prefer-dom-node-html-methods': 'off',
            // TypeScript rules
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            // React rules
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
]);