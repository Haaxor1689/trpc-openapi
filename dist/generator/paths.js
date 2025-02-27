"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenApiPathsObject = void 0;
const server_1 = require("@trpc/server");
const openapi_types_1 = require("openapi-types");
const method_1 = require("../utils/method");
const path_1 = require("../utils/path");
const procedure_1 = require("../utils/procedure");
const schema_1 = require("./schema");
const getOpenApiPathsObject = (appRouter, pathsObject) => {
    const procedures = appRouter._def.procedures;
    (0, procedure_1.forEachOpenApiProcedure)(procedures, ({ path: procedurePath, type, procedure, openapi }) => {
        var _a;
        const operationId = `${type}.${procedurePath}`;
        try {
            if (type === 'subscription') {
                throw new server_1.TRPCError({
                    message: 'Subscriptions are not supported by OpenAPI v3',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            const { method, protect, summary, description, tags, headers } = openapi;
            const path = (0, path_1.normalizePath)(openapi.path);
            const pathParameters = (0, path_1.getPathParameters)(path);
            const headerParameters = (headers === null || headers === void 0 ? void 0 : headers.map((header) => (Object.assign(Object.assign({}, header), { in: 'header' })))) || [];
            const httpMethod = openapi_types_1.OpenAPIV3.HttpMethods[method];
            if (!httpMethod) {
                throw new server_1.TRPCError({
                    message: 'Method must be GET, POST, PATCH, PUT or DELETE',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            if ((_a = pathsObject[path]) === null || _a === void 0 ? void 0 : _a[httpMethod]) {
                throw new server_1.TRPCError({
                    message: `Duplicate procedure defined for route ${method} ${path}`,
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            const contentTypes = openapi.contentTypes || ['application/json'];
            if (contentTypes.length === 0) {
                throw new server_1.TRPCError({
                    message: 'At least one content type must be specified',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            const { inputParser, outputParser } = (0, procedure_1.getInputOutputParsers)(procedure);
            pathsObject[path] = Object.assign(Object.assign({}, pathsObject[path]), { [httpMethod]: Object.assign(Object.assign({ operationId,
                    summary,
                    description, tags: tags, security: protect ? [{ Authorization: [] }] : undefined }, ((0, method_1.acceptsRequestBody)(method)
                    ? {
                        requestBody: (0, schema_1.getRequestBodyObject)(inputParser, pathParameters, contentTypes),
                        parameters: [
                            ...headerParameters,
                            ...((0, schema_1.getParameterObjects)(inputParser, pathParameters, 'path') || []),
                        ],
                    }
                    : {
                        requestBody: undefined,
                        parameters: [
                            ...headerParameters,
                            ...((0, schema_1.getParameterObjects)(inputParser, pathParameters, 'all') || []),
                        ],
                    })), { responses: (0, schema_1.getResponsesObject)(outputParser) }) });
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            error.message = `[${operationId}] - ${error.message}`;
            throw error;
        }
    });
    return pathsObject;
};
exports.getOpenApiPathsObject = getOpenApiPathsObject;
//# sourceMappingURL=paths.js.map