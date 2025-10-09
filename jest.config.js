import { createDefaultPreset, pathsToModuleNameMapper } from "ts-jest";
import ts from "typescript";
const { config: tsconfig } = ts.readConfigFile(
  "./tsconfig.app.json",
  ts.sys.readFile
);

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
const config = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.jest.json",
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: "<rootDir>/src/",
  }),
};

export default config;
