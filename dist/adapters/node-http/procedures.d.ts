import { OpenApiMethod, OpenApiProcedure, OpenApiRouter } from '../../types';
export declare const createProcedureCache: (router: OpenApiRouter<{
    [x: string]: unknown;
}>) => (method: OpenApiMethod, path: string) => {
    procedure: {
        type: 'query' | 'mutation';
        path: string;
        procedure: OpenApiProcedure<{
            [x: string]: unknown;
        }>;
    };
    pathInput: {
        [key: string]: string;
    };
} | undefined;
//# sourceMappingURL=procedures.d.ts.map