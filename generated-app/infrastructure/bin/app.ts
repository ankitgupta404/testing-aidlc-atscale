#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CanopyStack } from '../lib/canopy-stack';

const app = new cdk.App();
new CanopyStack(app, 'AnkitAidlcTestingCanopyStack', {
  env: {
    account: '239055859299',
    region: 'us-east-1',
  },
});
