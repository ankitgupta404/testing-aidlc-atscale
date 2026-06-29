import { APIGatewayProxyResultV2 } from 'aws-lambda';

export function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): APIGatewayProxyResultV2 {
  return jsonResponse(statusCode, {
    error: { code, message, ...(details ? { details } : {}) },
  });
}

export function successResponse(data: unknown): APIGatewayProxyResultV2 {
  return jsonResponse(200, data);
}

export function createdResponse(data: unknown): APIGatewayProxyResultV2 {
  return jsonResponse(201, data);
}

export function notFoundResponse(entity: string): APIGatewayProxyResultV2 {
  return errorResponse(404, 'NOT_FOUND', `${entity} not found`);
}

export function validationErrorResponse(details: unknown): APIGatewayProxyResultV2 {
  return errorResponse(400, 'VALIDATION_ERROR', 'Invalid request data', details);
}
