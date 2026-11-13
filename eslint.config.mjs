import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Les images viennent directement du CDN de Scryfall : pas besoin de les faire passer
      // par l'optimiseur d'images de Next (qui consommerait du quota d'hébergement).
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "legacy/**"]),
]);

export default eslintConfig;
