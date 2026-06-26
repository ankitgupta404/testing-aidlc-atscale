import http from "http";
import { handler } from "./index";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

const PORT = 4001;

// Set the table name env var
process.env.TABLE_NAME = "canopy-aws-news-table";

// In-memory store for local development (when DynamoDB isn't available)
let useLocalStore = false;
let localStore: any[] = [];

const seedData = [
  {
    id: crypto.randomUUID(),
    title: "Amazon Bedrock now supports Claude 4 Opus model",
    service: "Bedrock",
    date: "2026-06-20T00:00:00.000Z",
    summary: "Amazon Bedrock now supports Anthropic's Claude 4 Opus, the most capable model in the Claude family, offering advanced reasoning, coding, and multimodal capabilities for enterprise AI applications.",
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "AWS Lambda introduces 10GB ephemeral storage support",
    service: "Lambda",
    date: "2026-06-18T00:00:00.000Z",
    summary: "AWS Lambda now supports configuring up to 10GB of ephemeral storage in the /tmp directory, enabling data-intensive workloads like ETL processing, ML inference, and large file handling.",
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon S3 Express One Zone now available in 8 additional regions",
    service: "S3",
    date: "2026-06-15T00:00:00.000Z",
    summary: "Amazon S3 Express One Zone, the highest-performance storage class, is now available in 8 additional AWS Regions, bringing single-digit millisecond data access to more customers globally.",
    createdAt: "2026-06-15T10:00:00.000Z",
    updatedAt: "2026-06-15T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon DynamoDB introduces vector search for AI applications",
    service: "DynamoDB",
    date: "2026-06-12T00:00:00.000Z",
    summary: "Amazon DynamoDB now supports vector search natively, enabling developers to store and query vector embeddings alongside structured data for AI-powered applications without managing separate infrastructure.",
    createdAt: "2026-06-12T10:00:00.000Z",
    updatedAt: "2026-06-12T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "AWS CDK v3 now generally available",
    service: "CDK",
    date: "2026-06-10T00:00:00.000Z",
    summary: "AWS CDK v3 introduces improved construct libraries, faster synthesis times, and native support for multi-account deployments with simplified cross-stack references and enhanced type safety.",
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-06-10T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon EventBridge introduces enhanced filtering with content-based rules",
    service: "EventBridge",
    date: "2026-06-08T00:00:00.000Z",
    summary: "Amazon EventBridge now supports complex content-based filtering rules, including regex patterns, IP address matching, and nested array filtering for more precise event routing.",
    createdAt: "2026-06-08T10:00:00.000Z",
    updatedAt: "2026-06-08T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "AWS Step Functions adds direct SDK integrations for 40 new services",
    service: "Step Functions",
    date: "2026-06-05T00:00:00.000Z",
    summary: "AWS Step Functions now supports direct SDK integrations for 40 additional AWS services, eliminating the need for intermediate Lambda functions and reducing workflow complexity and cost.",
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon CloudFront supports WebSocket connections",
    service: "CloudFront",
    date: "2026-06-03T00:00:00.000Z",
    summary: "Amazon CloudFront now natively supports WebSocket connections at edge locations, enabling real-time bidirectional communication for applications like live chat, gaming, and financial dashboards.",
    createdAt: "2026-06-03T10:00:00.000Z",
    updatedAt: "2026-06-03T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon ECS adds automatic scaling based on deployment health",
    service: "ECS",
    date: "2026-05-30T00:00:00.000Z",
    summary: "Amazon ECS now supports automatic scaling policies that factor in deployment health metrics, ensuring new task instances are only scaled after passing health checks and stability thresholds.",
    createdAt: "2026-05-30T10:00:00.000Z",
    updatedAt: "2026-05-30T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "API Gateway introduces request validation with JSON Schema draft 2020-12",
    service: "API Gateway",
    date: "2026-05-28T00:00:00.000Z",
    summary: "Amazon API Gateway now supports request validation using JSON Schema draft 2020-12, providing richer validation capabilities including conditional schemas, recursive references, and improved error messages.",
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon SQS introduces message deduplication window of up to 24 hours",
    service: "SQS",
    date: "2026-05-25T00:00:00.000Z",
    summary: "Amazon SQS FIFO queues now support configurable deduplication windows of up to 24 hours, giving applications more flexibility to handle retry scenarios and exactly-once processing guarantees.",
    createdAt: "2026-05-25T10:00:00.000Z",
    updatedAt: "2026-05-25T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon SNS adds support for CloudEvents specification",
    service: "SNS",
    date: "2026-05-22T00:00:00.000Z",
    summary: "Amazon SNS now supports publishing and receiving messages using the CloudEvents v1.0 specification, enabling standardized event interoperability across cloud providers and on-premises systems.",
    createdAt: "2026-05-22T10:00:00.000Z",
    updatedAt: "2026-05-22T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon EC2 introduces M8g instances powered by AWS Graviton5",
    service: "EC2",
    date: "2026-05-20T00:00:00.000Z",
    summary: "Amazon EC2 M8g instances, powered by the new AWS Graviton5 processors, deliver up to 40% better price-performance over M7g instances for general-purpose workloads including web servers, app servers, and microservices.",
    createdAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "AWS IAM introduces fine-grained session policies for federated users",
    service: "IAM",
    date: "2026-05-18T00:00:00.000Z",
    summary: "AWS IAM now supports fine-grained session policies for federated users, enabling organizations to dynamically restrict permissions based on context such as device posture, network location, and time of access.",
    createdAt: "2026-05-18T10:00:00.000Z",
    updatedAt: "2026-05-18T10:00:00.000Z",
  },
  {
    id: crypto.randomUUID(),
    title: "Amazon CloudWatch introduces AI-powered anomaly detection for custom metrics",
    service: "CloudWatch",
    date: "2026-05-15T00:00:00.000Z",
    summary: "Amazon CloudWatch now offers AI-powered anomaly detection for custom metrics, automatically learning expected patterns and alerting on deviations without requiring manual threshold configuration.",
    createdAt: "2026-05-15T10:00:00.000Z",
    updatedAt: "2026-05-15T10:00:00.000Z",
  },
];

// Initialize local store
localStore = [...seedData];

function parseUrl(url: string): { pathname: string; searchParams: URLSearchParams } {
  const parsed = new URL(url, "http://localhost");
  return { pathname: parsed.pathname, searchParams: parsed.searchParams };
}

const server = http.createServer(async (req, res) => {
  const { pathname, searchParams } = parseUrl(req.url || "/");
  const method = req.method || "GET";

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Read body for POST/PUT
  let body = "";
  if (method === "POST" || method === "PUT") {
    body = await new Promise<string>((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
    });
  }

  // Local handler
  let statusCode = 200;
  let responseBody: any = {};

  try {
    if (method === "GET" && pathname === "/announcements") {
      const service = searchParams.get("service");
      const search = searchParams.get("search");
      const limit = parseInt(searchParams.get("limit") || "20");

      let filtered = [...localStore];
      if (service) {
        filtered = filtered.filter((a) => a.service === service);
      }
      if (search) {
        const lower = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(lower) ||
            a.summary.toLowerCase().includes(lower)
        );
      }
      // Sort by date desc
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      responseBody = { announcements: filtered.slice(0, limit), nextToken: null };
    } else if (method === "GET" && pathname.startsWith("/announcements/")) {
      const id = pathname.split("/")[2];
      const item = localStore.find((a) => a.id === id);
      if (!item) {
        statusCode = 404;
        responseBody = { error: "Announcement not found" };
      } else {
        responseBody = item;
      }
    } else if (method === "POST" && pathname === "/announcements") {
      const input = JSON.parse(body);
      const now = new Date().toISOString();
      const item = {
        id: crypto.randomUUID(),
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      localStore.unshift(item);
      statusCode = 201;
      responseBody = item;
    } else if (method === "PUT" && pathname.startsWith("/announcements/")) {
      const id = pathname.split("/")[2];
      const idx = localStore.findIndex((a) => a.id === id);
      if (idx === -1) {
        statusCode = 404;
        responseBody = { error: "Announcement not found" };
      } else {
        const input = JSON.parse(body);
        localStore[idx] = {
          ...localStore[idx],
          ...input,
          updatedAt: new Date().toISOString(),
        };
        responseBody = localStore[idx];
      }
    } else if (method === "DELETE" && pathname.startsWith("/announcements/")) {
      const id = pathname.split("/")[2];
      const idx = localStore.findIndex((a) => a.id === id);
      if (idx === -1) {
        statusCode = 404;
        responseBody = { error: "Announcement not found" };
      } else {
        localStore.splice(idx, 1);
        responseBody = { deleted: true };
      }
    } else if (method === "GET" && pathname === "/services") {
      const services = [...new Set(localStore.map((a) => a.service))].sort();
      responseBody = { services };
    } else {
      statusCode = 404;
      responseBody = { error: "Route not found" };
    }
  } catch (err: any) {
    statusCode = 500;
    responseBody = { error: err.message || "Internal server error" };
  }

  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(responseBody));
});

server.listen(PORT, () => {
  console.log(`🚀 Local API server running at http://localhost:${PORT}`);
  console.log(`📦 Loaded ${localStore.length} seed announcements`);
});
