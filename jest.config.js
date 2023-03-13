/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["./_tests","./_visuals"],
  transform: { "\\.ts$": ["ts-jest"] },
  testRegex: "(/___tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};