// @ts-check

import eslint from "@eslint/js";
import ts_eslint from 'typescript-eslint';

export default ts_eslint.config(
    eslint.configs.recommended,
    ...ts_eslint.configs.recommended,
);