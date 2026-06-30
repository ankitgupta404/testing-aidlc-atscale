import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.TABLE_NAME || 'ankit-aidlc-testing-aws-news-table';

interface SeedAnnouncement {
  title: string;
  service: string;
  date: string;
  summary: string;
  link?: string;
}

const announcements: SeedAnnouncement[] = [
  {
    title: 'Amazon Bedrock now supports Claude 3.5 Sonnet model',
    service: 'Bedrock',
    date: '2025-06-20T00:00:00.000Z',
    summary: 'Amazon Bedrock now provides access to Anthropic\'s Claude 3.5 Sonnet model, offering improved performance on coding, analysis, and creative tasks. The model is available in US East (N. Virginia), US West (Oregon), and Europe (Frankfurt) regions.',
  },
  {
    title: 'AWS Lambda adds support for Python 3.13 runtime',
    service: 'Lambda',
    date: '2025-06-15T00:00:00.000Z',
    summary: 'AWS Lambda now supports Python 3.13 as a managed runtime. Customers can now build and deploy Lambda functions using the latest Python version, benefiting from improved performance, new syntax features, and enhanced standard library capabilities.',
  },
  {
    title: 'Amazon S3 introduces Express One Zone storage class',
    service: 'S3',
    date: '2025-06-10T00:00:00.000Z',
    summary: 'Amazon S3 Express One Zone is a high-performance, single-Availability Zone storage class purpose-built to deliver consistent single-digit millisecond data access for frequently accessed data and latency-sensitive applications.',
  },
  {
    title: 'Amazon DynamoDB zero-ETL integration with Amazon Redshift',
    service: 'DynamoDB',
    date: '2025-06-05T00:00:00.000Z',
    summary: 'Amazon DynamoDB now supports zero-ETL integration with Amazon Redshift, enabling you to run analytics and machine learning on your DynamoDB data without building or maintaining complex data pipelines.',
  },
  {
    title: 'AWS Step Functions adds JSONATA support for data transformation',
    service: 'Step Functions',
    date: '2025-05-28T00:00:00.000Z',
    summary: 'AWS Step Functions now supports JSONATA expressions for data transformation within state machines. This enables more powerful inline data manipulation without requiring additional Lambda functions for simple transformations.',
  },
  {
    title: 'Amazon EC2 introduces M7i-flex instances',
    service: 'EC2',
    date: '2025-05-20T00:00:00.000Z',
    summary: 'Amazon EC2 M7i-flex instances are powered by custom 4th Generation Intel Xeon Scalable processors and offer a balance of compute, memory, and networking resources for a broad set of general-purpose workloads.',
  },
  {
    title: 'Amazon ECS now supports managed instance draining',
    service: 'ECS',
    date: '2025-05-15T00:00:00.000Z',
    summary: 'Amazon ECS now supports managed instance draining for EC2 capacity providers, automatically handling the graceful shutdown of tasks when container instances are terminated or scaled in.',
  },
  {
    title: 'Amazon CloudFront announces embedded Points of Presence',
    service: 'CloudFront',
    date: '2025-05-10T00:00:00.000Z',
    summary: 'Amazon CloudFront now has embedded Points of Presence (PoPs) located within internet service provider (ISP) networks, bringing content closer to viewers and reducing latency for popular content delivery.',
  },
  {
    title: 'Amazon API Gateway adds support for WebSocket API access logging',
    service: 'API Gateway',
    date: '2025-05-05T00:00:00.000Z',
    summary: 'Amazon API Gateway now supports detailed access logging for WebSocket APIs, providing visibility into connection attempts, message routing, and disconnection events for better debugging and monitoring.',
  },
  {
    title: 'Amazon EventBridge Pipes adds enrichment with Step Functions',
    service: 'EventBridge',
    date: '2025-04-28T00:00:00.000Z',
    summary: 'Amazon EventBridge Pipes now supports AWS Step Functions as an enrichment target, enabling complex event processing workflows between source and target without custom code.',
  },
  {
    title: 'AWS Lambda introduces recursive loop detection',
    service: 'Lambda',
    date: '2025-04-20T00:00:00.000Z',
    summary: 'AWS Lambda now automatically detects and stops recursive invocation loops between Lambda, SQS, and SNS. When a recursive loop is detected, Lambda stops processing the event and notifies you via CloudWatch.',
  },
  {
    title: 'Amazon S3 adds conditional writes support',
    service: 'S3',
    date: '2025-04-15T00:00:00.000Z',
    summary: 'Amazon S3 now supports conditional writes that check if an object exists before writing, helping prevent unintentional overwrites. This eliminates the need for client-side checks before uploading objects.',
  },
  {
    title: 'Amazon DynamoDB adds support for multi-Region strong consistency',
    service: 'DynamoDB',
    date: '2025-04-10T00:00:00.000Z',
    summary: 'Amazon DynamoDB global tables now support multi-Region strong consistency, allowing applications to read the most recent write regardless of the Region in which it was made.',
  },
  {
    title: 'Amazon Bedrock Knowledge Bases adds GraphRAG support',
    service: 'Bedrock',
    date: '2025-04-05T00:00:00.000Z',
    summary: 'Amazon Bedrock Knowledge Bases now supports GraphRAG, enabling retrieval-augmented generation that leverages knowledge graphs for more contextual and relationship-aware responses from foundation models.',
  },
  {
    title: 'Amazon SQS introduces message throughput metrics',
    service: 'SQS',
    date: '2025-03-28T00:00:00.000Z',
    summary: 'Amazon SQS now publishes message throughput metrics to CloudWatch, providing real-time visibility into send, receive, and delete operations per queue for better capacity planning and monitoring.',
  },
];

async function seed() {
  console.log(`Seeding table: ${TABLE_NAME}`);
  const now = new Date().toISOString();

  const items = announcements.map(a => {
    const id = crypto.randomUUID();
    return {
      PutRequest: {
        Item: {
          PK: `ANNOUNCEMENT#${id}`,
          SK: `ANNOUNCEMENT#${id}`,
          GSI1PK: `SERVICE#${a.service}`,
          GSI1SK: `DATE#${a.date}#${id}`,
          GSI2PK: 'ALL_ANNOUNCEMENTS',
          GSI2SK: `DATE#${a.date}#${id}`,
          id,
          title: a.title,
          summary: a.summary,
          service: a.service,
          date: a.date,
          link: a.link,
          createdAt: now,
          updatedAt: now,
        },
      },
    };
  });

  // DynamoDB BatchWrite supports max 25 items per batch
  const batches = [];
  for (let i = 0; i < items.length; i += 25) {
    batches.push(items.slice(i, i + 25));
  }

  for (const batch of batches) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [TABLE_NAME]: batch,
      },
    }));
    console.log(`Wrote batch of ${batch.length} items`);
  }

  console.log(`Successfully seeded ${items.length} announcements`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
