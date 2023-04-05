import { OpenAPIV3 } from 'openapi-types';
import { OpenApiContentType } from '../types';
export declare const getParameterObjects: (schema: unknown, pathParameters: string[], inType: 'all' | 'path' | 'query') => OpenAPIV3.ParameterObject[] | undefined;
export declare const getRequestBodyObject: (schema: unknown, pathParameters: string[], contentTypes: OpenApiContentType[]) => OpenAPIV3.RequestBodyObject | undefined;
export declare const errorResponseObject: {
    description: string;
    content: {
        'application/json': {
            schema: OpenAPIV3.SchemaObject;
        };
    };
};
export declare const getResponsesObject: (schema: unknown) => OpenAPIV3.ResponsesObject;
//# sourceMappingURL=schema.d.ts.map