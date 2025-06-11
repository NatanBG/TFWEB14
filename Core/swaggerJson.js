import fs from 'fs/promises';
import path from 'path';

export default async function (dir, server) {


    const files = await fs.readdir(dir);
    const pathObjects = [];

    for (const file of files) {
        if (file.endsWith('.js')) {
            const fullPath = path.join(dir, file);
            const module = await import(fullPath);
            pathObjects.push(module.default);
        }
    }

    const resources = Object.assign({}, ...pathObjects);

    return {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'API - Documentação dinâmica',
                version: '1.0.0'
            },
            servers: [
                {
                    url: server,
                    description: 'Servidor local'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT' // ou 'OAuth2' se for com fluxo real
                    }
                }
            },
            security: [
                {
                    bearerAuth: [] // aplica para todas as rotas
                }
            ],
            paths: resources
        },
        apis: []
    };
};
