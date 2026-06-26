import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import {
  CreateAnnouncementInputSchema,
  UpdateAnnouncementInputSchema,
  ListAnnouncementsQuerySchema,
} from "@aws-news-hub/shared";
import type { Announcement } from "@aws-news-hub/shared";
import {
  putAnnouncement,
  getAnnouncementById,
  queryAnnouncementsByDate,
  queryAnnouncementsByService,
  searchAnnouncements,
  deleteAnnouncementById,
  updateAnnouncementById,
} from "../db/dynamodb";
import crypto from "crypto";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

function response(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return { statusCode, headers, body: JSON.stringify(body) };
}

export async function listAnnouncements(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const queryParams = event.queryStringParameters || {};
    const parsed = ListAnnouncementsQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return response(400, { error: "Invalid query parameters", details: parsed.error.issues.map((i) => i.message) });
    }

    const { service, search, limit, nextToken } = parsed.data;

    let result;
    if (search) {
      result = await searchAnnouncements(search, limit, nextToken);
    } else if (service) {
      result = await queryAnnouncementsByService(service, limit, nextToken);
    } else {
      result = await queryAnnouncementsByDate(limit, nextToken);
    }

    return response(200, {
      announcements: result.items,
      nextToken: result.nextToken,
    });
  } catch (error) {
    console.error("listAnnouncements error:", error);
    return response(500, { error: "Failed to list announcements" });
  }
}

export async function getAnnouncement(id: string): Promise<APIGatewayProxyResultV2> {
  try {
    const announcement = await getAnnouncementById(id);
    if (!announcement) {
      return response(404, { error: "Announcement not found" });
    }
    return response(200, announcement);
  } catch (error) {
    console.error("getAnnouncement error:", error);
    return response(500, { error: "Failed to get announcement" });
  }
}

export async function createAnnouncement(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body = JSON.parse(event.body || "{}");
    const parsed = CreateAnnouncementInputSchema.safeParse(body);
    if (!parsed.success) {
      return response(400, { error: "Invalid input", details: parsed.error.issues.map((i) => i.message) });
    }

    const now = new Date().toISOString();
    const announcement: Announcement = {
      id: crypto.randomUUID(),
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    };

    await putAnnouncement(announcement);
    return response(201, announcement);
  } catch (error) {
    console.error("createAnnouncement error:", error);
    return response(500, { error: "Failed to create announcement" });
  }
}

export async function updateAnnouncement(id: string, event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body = JSON.parse(event.body || "{}");
    const parsed = UpdateAnnouncementInputSchema.safeParse(body);
    if (!parsed.success) {
      return response(400, { error: "Invalid input", details: parsed.error.issues.map((i) => i.message) });
    }

    const updated = await updateAnnouncementById(id, parsed.data);
    if (!updated) {
      return response(404, { error: "Announcement not found" });
    }
    return response(200, updated);
  } catch (error) {
    console.error("updateAnnouncement error:", error);
    return response(500, { error: "Failed to update announcement" });
  }
}

export async function deleteAnnouncement(id: string): Promise<APIGatewayProxyResultV2> {
  try {
    const deleted = await deleteAnnouncementById(id);
    if (!deleted) {
      return response(404, { error: "Announcement not found" });
    }
    return response(200, { deleted: true });
  } catch (error) {
    console.error("deleteAnnouncement error:", error);
    return response(500, { error: "Failed to delete announcement" });
  }
}
