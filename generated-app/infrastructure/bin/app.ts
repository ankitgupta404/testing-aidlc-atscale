#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CanopyStack } from '../lib/canopy-stack';

const app = new cdk.App();
new CanopyStack(app, 'AnkitAidlcTestingCanopyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
