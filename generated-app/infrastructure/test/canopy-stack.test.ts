import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CanopyStack } from '../lib/canopy-stack';

describe('CanopyStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new CanopyStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });
    template = Template.fromStack(stack);
  });

  describe('DynamoDB', () => {
    test('creates a DynamoDB table with correct key schema', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    test('DynamoDB table has GSI1', () => {
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

    test('DynamoDB table has GSI2', () => {
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

  describe('Lambda', () => {
    test('creates a Lambda function with Node.js 20 runtime', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
        MemorySize: 512,
        Timeout: 30,
      });
    });

    test('Lambda has TABLE_NAME environment variable', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });
  });

  describe('API Gateway', () => {
    test('creates an HTTP API', () => {
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        ProtocolType: 'HTTP',
        Name: 'canopy-ankit-aidlc-testing-canopy-http-api',
      });
    });

    test('API Gateway has CORS configured', () => {
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        CorsConfiguration: Match.objectLike({
          AllowMethods: Match.arrayWith(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
          AllowOrigins: ['*'],
        }),
      });
    });
  });

  describe('S3 and CloudFront', () => {
    test('creates an S3 bucket for frontend', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    test('creates a CloudFront distribution', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
        }),
      });
    });
  });

  describe('Outputs', () => {
    test('exports ApiUrl', () => {
      template.hasOutput('ApiUrl', {});
    });

    test('exports FrontendBucketName', () => {
      template.hasOutput('FrontendBucketName', {});
    });

    test('exports CloudFrontDistributionId', () => {
      template.hasOutput('CloudFrontDistributionId', {});
    });

    test('exports CloudFrontUrl', () => {
      template.hasOutput('CloudFrontUrl', {});
    });

    test('exports TableName', () => {
      template.hasOutput('TableName', {});
    });
  });
});
