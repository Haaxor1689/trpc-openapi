import { OpenAPIV3 } from 'openapi-types';
import { OpenApiRouter } from '../types';
export declare const openApiVersion = "3.0.3";
export type GenerateOpenApiDocumentOptions = {
    title: string;
    description?: string;
    version: string;
    baseUrl: string;
    docsUrl?: string;
    tags?: string[];
};
export declare const generateOpenApiDocument: (appRouter: OpenApiRouter<{
    [x: string]: unknown;
}>, opts: GenerateOpenApiDocumentOptions) => OpenAPIV3.Document;
//# sourceMappingURL=index.d.ts.map