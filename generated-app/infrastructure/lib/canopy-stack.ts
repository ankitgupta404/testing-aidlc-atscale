import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class CanopyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table - Single Table Design
    const table = new dynamodb.Table(this, 'CanopyTable', {
      tableName: 'canopy-ankit-aidlc-testing-canopy-table',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GSI1 - for querying by project, sprint, etc.
    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2 - for querying by assignee, status, etc.
    table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Lambda Function
    const backendEntry = path.join(__dirname, '../../backend/src/index.ts');
    const projectRoot = path.resolve(__dirname, '../..');

    const apiHandler = new NodejsFunction(this, 'CanopyApiHandler', {
      functionName: 'canopy-ankit-aidlc-testing-canopy-api',
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      entry: backendEntry,
      handler: 'handler',
      projectRoot,
      depsLockFilePath: path.join(__dirname, '../package-lock.json'),
      environment: {
        TABLE_NAME: table.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        externalModules: ['@aws-sdk/*'],
        minify: true,
        sourceMap: true,
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            // inputDir is the projectRoot (generated-app/).
            // In CI, only infrastructure/node_modules exists (from npm ci).
            // CDK runs `npx --no-install esbuild` from projectRoot, so we need
            // esbuild, @canopy/shared, and zod in projectRoot/node_modules.
            return [
              // Create node_modules structure at project root
              `cd "${inputDir}" && mkdir -p node_modules/.bin node_modules/@esbuild`,
              // Copy esbuild from infrastructure if not present at root
              `cd "${inputDir}" && [ -f node_modules/.bin/esbuild ] || (cp -rL infrastructure/node_modules/esbuild node_modules/esbuild 2>/dev/null && cp -rL infrastructure/node_modules/@esbuild/* node_modules/@esbuild/ 2>/dev/null && ln -sf ../esbuild/bin/esbuild node_modules/.bin/esbuild) || true`,
              // Copy @canopy/shared from source
              `cd "${inputDir}" && rm -rf node_modules/@canopy/shared && mkdir -p node_modules/@canopy/shared && cp -r shared/src/* node_modules/@canopy/shared/ && echo '{"name":"@canopy/shared","version":"1.0.0","main":"index.ts","types":"index.ts"}' > node_modules/@canopy/shared/package.json`,
              // Copy zod from infrastructure if not present at root
              `cd "${inputDir}" && [ -d node_modules/zod ] || cp -rL infrastructure/node_modules/zod node_modules/zod 2>/dev/null || true`,
            ];
          },
          afterBundling(): string[] {
            return [];
          },
          beforeInstall(): string[] {
            return [];
          },
        },
      },
    });

    // Grant Lambda access to DynamoDB
    table.grantReadWriteData(apiHandler);

    // API Gateway HTTP API
    const httpApi = new apigateway.HttpApi(this, 'CanopyHttpApi', {
      apiName: 'canopy-ankit-aidlc-testing-canopy-http-api',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.PUT,
          apigateway.CorsHttpMethod.PATCH,
          apigateway.CorsHttpMethod.DELETE,
          apigateway.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: cdk.Duration.hours(24),
      },
    });

    // Add catch-all route to Lambda
    const lambdaIntegration = new apigatewayIntegrations.HttpLambdaIntegration(
      'CanopyLambdaIntegration',
      apiHandler
    );

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigateway.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // S3 Bucket for Frontend
    const frontendBucket = new s3.Bucket(this, 'CanopyFrontendBucket', {
      bucketName: `canopy-ankit-aidlc-testing-canopy-frontend-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'CanopyDistribution', {
      comment: 'canopy-ankit-aidlc-testing-canopy-cdn',
      defaultBehavior: {
        origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // Stack Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'HTTP API endpoint URL',
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
      description: 'S3 bucket name for frontend assets',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID for cache invalidation',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL for the application',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'DynamoDB table name',
    });
  }
}
