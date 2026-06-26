import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from "@aws-news-hub/shared";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.TABLE_NAME || "canopy-aws-news-table";

function buildKeys(id: string, service: string, date: string) {
  return {
    PK: `ANNOUNCEMENT#${id}`,
    SK: `ANNOUNCEMENT#${id}`,
    GSI1PK: `SERVICE#${service}`,
    GSI1SK: `DATE#${date}#${id}`,
    GSI2PK: "ALL_ANNOUNCEMENTS",
    GSI2SK: `DATE#${date}#${id}`,
  };
}

function itemToAnnouncement(item: Record<string, unknown>): Announcement {
  return {
    id: item.id as string,
    title: item.title as string,
    summary: item.summary as string,
    service: item.service as Announcement["service"],
    date: item.date as string,
    url: item.url as string | undefined,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  };
}

export async function putAnnouncement(announcement: Announcement): Promise<void> {
  const keys = buildKeys(announcement.id, announcement.service, announcement.date);
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...keys,
        ...announcement,
        titleLower: announcement.title.toLowerCase(),
        summaryLower: announcement.summary.toLowerCase(),
      },
    })
  );
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ANNOUNCEMENT#${id}`,
        SK: `ANNOUNCEMENT#${id}`,
      },
    })
  );
  if (!result.Item) return null;
  return itemToAnnouncement(result.Item);
}

export async function queryAnnouncementsByDate(
  limit: number,
  nextToken?: string
): Promise<{ items: Announcement[]; nextToken: string | null }> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      ExpressionAttributeValues: { ":pk": "ALL_ANNOUNCEMENTS" },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, "base64").toString()) : undefined,
    })
  );
  const items = (result.Items || []).map(itemToAnnouncement);
  const lastKey = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
    : null;
  return { items, nextToken: lastKey };
}

export async function queryAnnouncementsByService(
  service: string,
  limit: number,
  nextToken?: string
): Promise<{ items: Announcement[]; nextToken: string | null }> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": `SERVICE#${service}` },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, "base64").toString()) : undefined,
    })
  );
  const items = (result.Items || []).map(itemToAnnouncement);
  const lastKey = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
    : null;
  return { items, nextToken: lastKey };
}

export async function searchAnnouncements(
  searchTerm: string,
  limit: number,
  nextToken?: string
): Promise<{ items: Announcement[]; nextToken: string | null }> {
  const lowerSearch = searchTerm.toLowerCase();
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      FilterExpression: "contains(#titleLower, :search) OR contains(#summaryLower, :search)",
      ExpressionAttributeNames: {
        "#titleLower": "titleLower",
        "#summaryLower": "summaryLower",
      },
      ExpressionAttributeValues: {
        ":pk": "ALL_ANNOUNCEMENTS",
        ":search": lowerSearch,
      },
      ScanIndexForward: false,
      Limit: limit * 3, // Fetch more due to filter
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, "base64").toString()) : undefined,
    })
  );
  const items = (result.Items || []).map(itemToAnnouncement).slice(0, limit);
  const lastKey = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
    : null;
  return { items, nextToken: lastKey };
}

export async function deleteAnnouncementById(id: string): Promise<boolean> {
  // First get the item to know its keys
  const existing = await getAnnouncementById(id);
  if (!existing) return false;

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ANNOUNCEMENT#${id}`,
        SK: `ANNOUNCEMENT#${id}`,
      },
    })
  );
  return true;
}

export async function updateAnnouncementById(
  id: string,
  updates: UpdateAnnouncementInput
): Promise<Announcement | null> {
  const existing = await getAnnouncementById(id);
  if (!existing) return null;

  const updatedAnnouncement: Announcement = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // If service or date changed, we need to delete and re-put (GSI keys change)
  if (updates.service || updates.date) {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `ANNOUNCEMENT#${id}`,
          SK: `ANNOUNCEMENT#${id}`,
        },
      })
    );
    await putAnnouncement(updatedAnnouncement);
  } else {
    // Simple update
    const keys = buildKeys(id, updatedAnnouncement.service, updatedAnnouncement.date);
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...keys,
          ...updatedAnnouncement,
          titleLower: updatedAnnouncement.title.toLowerCase(),
          summaryLower: updatedAnnouncement.summary.toLowerCase(),
        },
      })
    );
  }

  return updatedAnnouncement;
}

export async function getAllServices(): Promise<string[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      ProjectionExpression: "service",
    })
  );
  const services = new Set<string>();
  (result.Items || []).forEach((item) => {
    if (item.service) services.add(item.service as string);
  });
  return Array.from(services).sort();
}
