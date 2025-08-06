import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jest-dom/recommended",
    "plugin:testing-library/react"
  ),
  {
    // Añade reglas personalizadas aquí
    rules: {
      "@typescript-eslint/no-unused-vars": "off",       // Desactiva el error de variables no usadas
      "@typescript-eslint/no-explicit-any": "off",      // Permite el uso de 'any'
    },
  },
];

export default eslintConfig;