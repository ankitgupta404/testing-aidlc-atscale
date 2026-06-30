import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AwsNewsStack } from '../lib/aws-news-stack';

describe('AwsNewsStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new AwsNewsStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });
    template = Template.fromStack(stack);
  });

  describe('DynamoDB Table', () => {
    test('creates table with correct key schema', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'canopy-aws-news-table',
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    test('has GSI1 for service-based queries', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
          }),
        ]),
      });
    });

    test('has GSI2 for date-based sorting', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'GSI2',
            KeySchema: [
              { AttributeName: 'GSI2PK', KeyType: 'HASH' },
              { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
            ],
          }),
        ]),
      });
    });
  });

  describe('Lambda Function', () => {
    test('creates Lambda with Node.js 20 runtime', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'canopy-aws-news-api',
        Runtime: 'nodejs20.x',
        MemorySize: 256,
        Timeout: 30,
      });
    });

    test('Lambda has TABLE_NAME environment variable', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'canopy-aws-news-api',
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });
  });

  describe('API Gateway', () => {
    test('creates HTTP API with CORS configured', () => {
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        Name: 'canopy-aws-news-http-api',
        ProtocolType: 'HTTP',
        CorsConfiguration: Match.objectLike({
          AllowOrigins: ['*'],
          AllowMethods: Match.arrayWith(['GET', 'POST', 'PUT', 'DELETE']),
        }),
      });
    });

    test('creates routes for all CRUD operations', () => {
      template.resourceCountIs('AWS::ApiGatewayV2::Route', 5);
    });
  });

  describe('S3 and CloudFront', () => {
    test('creates S3 bucket with public access blocked', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    test('creates CloudFront distribution', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
        }),
      });
    });
  });

  describe('Stack Outputs', () => {
    test('outputs API URL', () => {
      template.hasOutput('ApiUrl', {});
    });

    test('outputs frontend bucket name', () => {
      template.hasOutput('FrontendBucketName', {});
    });

    test('outputs CloudFront URL', () => {
      template.hasOutput('CloudFrontUrl', {});
    });

    test('outputs table name', () => {
      template.hasOutput('TableName', {});
    });

    test('outputs distribution ID', () => {
      template.hasOutput('DistributionId', {});
    });
  });
});
