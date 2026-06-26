#!/bin/bash
# Seed the deployed API with announcement data
API_URL="https://mbx2zdwhd5.execute-api.us-west-2.amazonaws.com"

echo "Seeding API at $API_URL..."

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon Bedrock now supports Claude 4 Opus model","service":"Bedrock","date":"2026-06-20T00:00:00.000Z","summary":"Amazon Bedrock now supports Anthropics Claude 4 Opus, the most capable model in the Claude family, offering enhanced reasoning, coding, and multimodal capabilities to enterprise AI applications.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/bedrock-claude-4-opus"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"AWS Lambda introduces 10GB ephemeral storage support","service":"Lambda","date":"2026-06-18T00:00:00.000Z","summary":"AWS Lambda now supports configuring up to 10GB of ephemeral storage in the /tmp directory, enabling data-intensive workloads like ETL processing, ML inference, and large file handling.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/lambda-10gb-storage"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon S3 Express One Zone now available in 8 additional regions","service":"S3","date":"2026-06-15T00:00:00.000Z","summary":"Amazon S3 Express One Zone, the highest-performance storage class, is now available in 8 additional AWS Regions, bringing single-digit millisecond data access to more customers globally.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/s3-express-one-zone-expansion"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon DynamoDB introduces vector search for AI applications","service":"DynamoDB","date":"2026-06-12T00:00:00.000Z","summary":"Amazon DynamoDB now supports native vector search natively, enabling developers to store and query vector embeddings alongside structured data for AI-powered applications without managing separate infrastructure.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/dynamodb-vector-search"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"AWS CDK v3 now generally available","service":"CDK","date":"2026-06-10T00:00:00.000Z","summary":"AWS CDK v3 introduces improved construct libraries, faster synthesis times, and native support for multi-account deployments with simplified cross-stack references and enhanced type safety.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/cdk-v3-ga"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon EventBridge introduces enhanced filtering with content-based rules","service":"EventBridge","date":"2026-06-08T00:00:00.000Z","summary":"Amazon EventBridge now supports complex content-based filtering rules, including regex patterns, IP address matching, and nested array filtering for more precise event routing.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/eventbridge-content-filtering"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"AWS Step Functions adds direct SDK integrations for 40 new services","service":"Step Functions","date":"2026-06-05T00:00:00.000Z","summary":"AWS Step Functions now supports direct SDK integrations for 40 additional AWS services, eliminating the need for intermediate Lambda functions and reducing workflow complexity and cost.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/step-functions-sdk-integrations"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon CloudFront supports WebSocket connections","service":"CloudFront","date":"2026-06-03T00:00:00.000Z","summary":"Amazon CloudFront now natively supports WebSocket connections at edge locations, enabling real-time bidirectional communication for applications like live chat, gaming, and financial dashboards.","link":"https://aws.amazon.com/about-aws/whats-new/2026/06/cloudfront-websocket"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon ECS adds automatic scaling based on deployment health","service":"ECS","date":"2026-05-30T00:00:00.000Z","summary":"Amazon ECS now supports automatic scaling policies that factor in deployment health metrics, ensuring new task instances are only scaled after passing health checks and stability thresholds.","link":"https://aws.amazon.com/about-aws/whats-new/2026/05/ecs-deployment-health-scaling"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"API Gateway introduces request validation with JSON Schema draft 2020-12","service":"API Gateway","date":"2026-05-28T00:00:00.000Z","summary":"Amazon API Gateway now supports request validation using JSON Schema draft 2020-12, providing richer validation capabilities including conditional schemas, recursive references, and improved error messages.","link":"https://aws.amazon.com/about-aws/whats-new/2026/05/api-gateway-json-schema-2020"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon SQS introduces message deduplication window of up to 24 hours","service":"SQS","date":"2026-05-25T00:00:00.000Z","summary":"Amazon SQS FIFO queues now support configurable deduplication windows of up to 24 hours, giving applications more flexibility to handle retry scenarios and exactly-once processing guarantees.","link":"https://aws.amazon.com/about-aws/whats-new/2026/05/sqs-deduplication-24h"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon SNS adds support for CloudEvents specification","service":"SNS","date":"2026-05-22T00:00:00.000Z","summary":"Amazon SNS now supports publishing and receiving messages using the CloudEvents v1.0 specification, enabling standardized event interoperability across cloud providers and on-premises systems.","link":"https://aws.amazon.com/about-aws/whats-new/2026/05/sns-cloudevents"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon EC2 introduces M8g instances powered by AWS Graviton5","service":"EC2","date":"2026-05-20T00:00:00.000Z","summary":"Amazon EC2 M8g instances, powered by the new AWS Graviton5 processors, deliver up to 40% better price-performance over M7g instances for general-purpose workloads including web servers, app servers, and microservices.","link":"https://aws.amazon.com/about-aws/whats-new/2026/05/ec2-m8g-graviton5"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"AWS IAM introduces fine-grained session policies for federated users","service":"IAM","date":"2026-05-18T00:00:00.000Z","summary":"AWS IAM now supports fine-grained session policies for federated users, enabling organizations to dynamically restrict permissions based on context such as device posture, network location, and time of access.","link":"https://aws.amazon.com/about-aws/whats-new/2026/05/iam-session-policies"}'
echo ""

curl -s -X POST "$API_URL/announcements" -H "Content-Type: application/json" -d '{"title":"Amazon CloudWatch introduces AI-powered anomaly detection for custom metrics","service":"CloudWatch","date":"2026-05-15T00:00:00.000Z","summary":"Amazon CloudWatch now offers AI-powered anomaly detection for custom metrics, automatically learning expected patterns and alerting on deviations without requiring manual threshold configuration.","link":"https://aws.amazon.com/about-aws/whats-new/2026/05/cloudwatch-ai-anomaly-detection"}'
echo ""

echo "Done! Seeded 15 announcements."
