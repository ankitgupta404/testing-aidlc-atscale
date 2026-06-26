import { APIGatewayProxyResultV2 } from "aws-lambda";
import { getAllServices } from "../db/dynamodb";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function listServices(): Promise<APIGatewayProxyResultV2> {
  try {
    const services = await getAllServices();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ services }),
    };
  } catch (error) {
    console.error("listServices error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to list services" }),
    };
  }
}
