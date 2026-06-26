import * as cdk from "aws-cdk-lib";
import { Template, Match, Capture } from "aws-cdk-lib/assertions";
import { AwsNewsHubStack } from "../lib/aws-news-hub-stack";

describe("AwsNewsHubStack", () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new AwsNewsHubStack(app, "TestStack", {
      env: { account: "123456789012", region: "us-east-1" },
    });
    template = Template.fromStack(stack);
  });

  // DynamoDB assertions
  describe("DynamoDB Table", () => {
    test("creates a DynamoDB table with correct key schema", () => {
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        TableName: "canopy-aws-news-table",
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      });
    });

    test("DynamoDB table has GSI1 for service queries", () => {
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "GSI1",
            KeySchema: [
              { AttributeName: "GSI1PK", KeyType: "HASH" },
              { AttributeName: "GSI1SK", KeyType: "RANGE" },
            ],
          }),
        ]),
      });
    });

    test("DynamoDB table has GSI2 for date queries", () => {
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "GSI2",
            KeySchema: [
              { AttributeName: "GSI2PK", KeyType: "HASH" },
              { AttributeName: "GSI2SK", KeyType: "RANGE" },
            ],
          }),
        ]),
      });
    });
  });

  // Lambda assertions
  describe("Lambda Function", () => {
    test("creates a Lambda function with Node.js 20 runtime", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        FunctionName: "canopy-aws-news-api",
        Runtime: "nodejs20.x",
        MemorySize: 256,
        Timeout: 30,
      });
    });

    test("Lambda has TABLE_NAME environment variable", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });
  });

  // API Gateway assertions
  describe("API Gateway", () => {
    test("creates an HTTP API with CORS configured", () => {
      template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
        Name: "canopy-aws-news-http-api",
        ProtocolType: "HTTP",
        CorsConfiguration: Match.objectLike({
          AllowOrigins: ["*"],
        }),
      });
    });
  });

  // S3 Bucket assertions
  describe("S3 Bucket", () => {
    test("creates an S3 bucket for frontend with blocked public access", () => {
      template.hasResourceProperties("AWS::S3::Bucket", {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });
  });

  // CloudFront assertions
  describe("CloudFront Distribution", () => {
    test("creates a CloudFront distribution with default root object", () => {
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({
          DefaultRootObject: "index.html",
        }),
      });
    });

    test("CloudFront has SPA error page redirects", () => {
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({
          CustomErrorResponses: Match.arrayWith([
            Match.objectLike({
              ErrorCode: 403,
              ResponseCode: 200,
              ResponsePagePath: "/index.html",
            }),
            Match.objectLike({
              ErrorCode: 404,
              ResponseCode: 200,
              ResponsePagePath: "/index.html",
            }),
          ]),
        }),
      });
    });
  });

  // Output assertions
  describe("Stack Outputs", () => {
    test("exports ApiUrl output", () => {
      template.hasOutput("ApiUrl", {});
    });

    test("exports FrontendBucketName output", () => {
      template.hasOutput("FrontendBucketName", {});
    });

    test("exports CloudFrontUrl output", () => {
      template.hasOutput("CloudFrontUrl", {});
    });

    test("exports TableName output", () => {
      template.hasOutput("TableName", {});
    });

    test("exports DistributionId output", () => {
      template.hasOutput("DistributionId", {});
    });
  });

  // Snapshot test
  test("matches snapshot", () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
