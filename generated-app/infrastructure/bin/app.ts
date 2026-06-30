#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsNewsStack } from '../lib/aws-news-stack';

const app = new cdk.App();

new AwsNewsStack(app, 'CanopyAwsNewsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
