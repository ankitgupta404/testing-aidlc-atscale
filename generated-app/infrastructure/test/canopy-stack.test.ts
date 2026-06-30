import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CanopyStack } from '../lib/canopy-stack';

describe('CanopyStack', () => {
  let app: cdk.App;
  let stack: CanopyStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new CanopyStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  describe('Snapshot', () => {
    test('matches snapshot', () => {
      expect(template.toJSON()).toMatchSnapshot();
    });
  });

  describe('DynamoDB Table', () => {
    test('has correct key schema with PK and SK', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
      });
    });

    test('has 3 Global Secondary Indexes', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
          }),
          Match.objectLike({
            IndexName: 'GSI2',
            KeySchema: [
              { AttributeName: 'GSI2PK', KeyType: 'HASH' },
              { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
            ],
          }),
          Match.objectLike({
            IndexName: 'GSI3',
            KeySchema: [
              { AttributeName: 'GSI3PK', KeyType: 'HASH' },
              { AttributeName: 'GSI3SK', KeyType: 'RANGE' },
            ],
          }),
        ]),
      });
    });

    test('uses PAY_PER_REQUEST billing mode', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
      });
    });
  });

  describe('Lambda Function', () => {
    test('has Node.js 20 runtime', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
      });
    });

    test('has 512MB memory', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        MemorySize: 512,
      });
    });

    test('has TABLE_NAME environment variable', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });

    test('has CORS_ORIGIN environment variable', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            CORS_ORIGIN: '*',
          }),
        },
      });
    });
  });

  describe('API Gateway', () => {
    test('HTTP API exists', () => {
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        Name: 'canopy-http-api',
        ProtocolType: 'HTTP',
      });
    });
  });

  describe('S3 Bucket', () => {
    test('exists with public access blocked', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });
  });

  describe('CloudFront Distribution', () => {
    test('exists', () => {
      template.resourceCountIs('AWS::CloudFront::Distribution', 1);
    });
  });
});
