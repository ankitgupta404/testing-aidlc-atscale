import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type RouteHandler = (
  event: APIGatewayProxyEventV2,
  params: Record<string, string>
) => Promise<APIGatewayProxyResultV2>;

interface Route {
  method: HttpMethod;
  pattern: RegExp;
  handler: RouteHandler;
  paramNames: string[];
}

export class Router {
  private routes: Route[] = [];

  add(method: HttpMethod, path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    const pattern = path.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      handler,
      paramNames,
    });
  }

  async resolve(
    method: string,
    path: string,
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return route.handler(event, params);
      }
    }
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: { code: 'NOT_FOUND', message: 'Route not found' },
      }),
    };
  }
}
