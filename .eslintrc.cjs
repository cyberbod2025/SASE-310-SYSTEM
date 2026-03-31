module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["react", "jsx-a11y"],
  extends: ["plugin:react/recommended", "plugin:jsx-a11y/recommended"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "jsx-a11y/control-has-associated-label": "error",
    "require-id-or-name": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
