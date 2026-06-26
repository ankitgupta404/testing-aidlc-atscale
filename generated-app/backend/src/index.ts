import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { listAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "./routes/announcements";
import { listServices } from "./routes/services";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

function response(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // Handle OPTIONS preflight
  if (method === "OPTIONS") {
    return response(200, {});
  }

  try {
    // Route matching
    // GET /announcements
    if (method === "GET" && path === "/announcements") {
      return await listAnnouncements(event);
    }

    // GET /announcements/:id
    const getMatch = path.match(/^\/announcements\/([^/]+)$/);
    if (method === "GET" && getMatch) {
      return await getAnnouncement(getMatch[1]);
    }

    // POST /announcements
    if (method === "POST" && path === "/announcements") {
      return await createAnnouncement(event);
    }

    // PUT /announcements/:id
    const putMatch = path.match(/^\/announcements\/([^/]+)$/);
    if (method === "PUT" && putMatch) {
      return await updateAnnouncement(putMatch[1], event);
    }

    // DELETE /announcements/:id
    const deleteMatch = path.match(/^\/announcements\/([^/]+)$/);
    if (method === "DELETE" && deleteMatch) {
      return await deleteAnnouncement(deleteMatch[1]);
    }

    // GET /services
    if (method === "GET" && path === "/services") {
      return await listServices();
    }

    // 404 - Route not found
    return response(404, { error: "Route not found" });
  } catch (error) {
    console.error("Unhandled error:", error);
    return response(500, { error: "Internal server error" });
  }
}
