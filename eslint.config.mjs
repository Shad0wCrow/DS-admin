import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "react-hooks/rules-of-hooks": "off"
    }
  }
];

export default eslintConfig;
