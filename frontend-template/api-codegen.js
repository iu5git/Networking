/* eslint-disable */
const OpenAPI = require('openapi-typescript-codegen');

OpenAPI.generate({
    input: './spec.yml',
    output: './src/api/generated',
});
