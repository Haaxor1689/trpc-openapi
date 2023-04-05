"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponsesObject = exports.errorResponseObject = exports.getRequestBodyObject = exports.getParameterObjects = void 0;
const zod_openapi_1 = require("@anatine/zod-openapi");
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const zodSchemaToOpenApiSchemaObject = (zodSchema) => {
    return (0, zod_openapi_1.generateSchema)(zodSchema);
};
const getParameterObjects = (schema, pathParameters, inType) => {
    if (!(0, zod_2.instanceofZodType)(schema)) {
        throw new server_1.TRPCError({
            message: 'Input parser expects a Zod validator',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }
    const isRequired = !schema.isOptional();
    const unwrappedSchema = (0, zod_2.unwrapZodType)(schema, true);
    if (pathParameters.length === 0 && (0, zod_2.instanceofZodTypeLikeVoid)(unwrappedSchema)) {
        return undefined;
    }
    if (!(0, zod_2.instanceofZodTypeObject)(unwrappedSchema)) {
        throw new server_1.TRPCError({
            message: 'Input parser must be a ZodObject',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }
    const shape = unwrappedSchema.shape;
    const shapeKeys = Object.keys(shape);
    for (const pathParameter of pathParameters) {
        if (!shapeKeys.includes(pathParameter)) {
            throw new server_1.TRPCError({
                message: `Input parser expects key from path: "${pathParameter}"`,
                code: 'INTERNAL_SERVER_ERROR',
            });
        }
    }
    return shapeKeys
        .filter((shapeKey) => {
        const isPathParameter = pathParameters.includes(shapeKey);
        if (inType === 'path') {
            return isPathParameter;
        }
        else if (inType === 'query') {
            return !isPathParameter;
        }
        return true;
    })
        .map((shapeKey) => {
        let shapeSchema = shape[shapeKey];
        const isShapeRequired = !shapeSchema.isOptional();
        const isPathParameter = pathParameters.includes(shapeKey);
        if (!(0, zod_2.instanceofZodTypeLikeString)(shapeSchema)) {
            if (zod_2.zodSupportsCoerce) {
                if (!(0, zod_2.instanceofZodTypeCoercible)(shapeSchema)) {
                    throw new server_1.TRPCError({
                        message: `Input parser key: "${shapeKey}" must be ZodString, ZodNumber, ZodBoolean, ZodBigInt or ZodDate`,
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }
            }
            else {
                throw new server_1.TRPCError({
                    message: `Input parser key: "${shapeKey}" must be ZodString`,
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }
        if ((0, zod_2.instanceofZodTypeOptional)(shapeSchema)) {
            if (isPathParameter) {
                throw new server_1.TRPCError({
                    message: `Path parameter: "${shapeKey}" must not be optional`,
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            shapeSchema = shapeSchema.unwrap();
        }
        const _a = zodSchemaToOpenApiSchemaObject((0, zod_openapi_1.extendApi)(shapeSchema, shape[shapeKey].metaOpenApi)), { description } = _a, openApiSchemaObject = __rest(_a, ["description"]);
        return {
            name: shapeKey,
            in: isPathParameter ? 'path' : 'query',
            required: isPathParameter || (isRequired && isShapeRequired),
            schema: openApiSchemaObject,
            description: description,
        };
    });
};
exports.getParameterObjects = getParameterObjects;
const getRequestBodyObject = (schema, pathParameters, contentTypes) => {
    if (!(0, zod_2.instanceofZodType)(schema)) {
        throw new server_1.TRPCError({
            message: 'Input parser expects a Zod validator',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }
    const isRequired = !schema.isOptional();
    const unwrappedSchema = (0, zod_2.unwrapZodType)(schema, true);
    if (pathParameters.length === 0 && (0, zod_2.instanceofZodTypeLikeVoid)(unwrappedSchema)) {
        return undefined;
    }
    if (!(0, zod_2.instanceofZodTypeObject)(unwrappedSchema)) {
        throw new server_1.TRPCError({
            message: 'Input parser must be a ZodObject',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }
    // remove path parameters
    const mask = {};
    pathParameters.forEach((pathParameter) => {
        mask[pathParameter] = true;
    });
    const dedupedSchema = unwrappedSchema.omit(mask);
    const openApiSchemaObject = zodSchemaToOpenApiSchemaObject((0, zod_openapi_1.extendApi)(dedupedSchema, schema.metaOpenApi));
    const content = {};
    for (const contentType of contentTypes) {
        content[contentType] = {
            schema: openApiSchemaObject,
        };
    }
    return {
        required: isRequired,
        content,
    };
};
exports.getRequestBodyObject = getRequestBodyObject;
exports.errorResponseObject = {
    description: 'Error response',
    content: {
        'application/json': {
            schema: zodSchemaToOpenApiSchemaObject((0, zod_openapi_1.extendApi)(zod_1.z.object({
                message: zod_1.z.string(),
                code: zod_1.z.string(),
                issues: zod_1.z.array(zod_1.z.object({ message: zod_1.z.string() })).optional(),
            }), {
                title: 'TRPCError',
                description: 'For more info see [https://trpc.io/docs/server/error-handling](https://trpc.io/docs/server/error-handling)',
            })),
        },
    },
};
const getResponsesObject = (schema) => {
    if (!(0, zod_2.instanceofZodType)(schema)) {
        throw new server_1.TRPCError({
            message: 'Output parser expects a Zod validator',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }
    const successResponseObject = {
        description: 'Successful response',
        content: {
            'application/json': {
                schema: zodSchemaToOpenApiSchemaObject(schema),
            },
        },
    };
    return {
        200: successResponseObject,
        default: {
            $ref: '#/components/responses/error',
        },
    };
};
exports.getResponsesObject = getResponsesObject;
//# sourceMappingURL=schema.js.map