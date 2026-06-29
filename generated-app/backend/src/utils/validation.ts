import { z } from 'zod';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { validationErrorResponse } from './response';

export function parseBody<T>(event: APIGatewayProxyEventV2, schema: z.ZodSchema<T>):
  { success: true; data: T } | { success: false; error: ReturnType<typeof validationErrorResponse> } {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return { success: false, error: validationErrorResponse(details) };
    }
    return {
      success: false,
      error: validationErrorResponse('Invalid JSON body'),
    };
  }
}

export function getQueryParams(event: APIGatewayProxyEventV2): Record<string, string | undefined> {
  return event.queryStringParameters || {};
}
