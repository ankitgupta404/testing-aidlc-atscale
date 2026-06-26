#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsNewsHubStack } from "../lib/aws-news-hub-stack";

const app = new cdk.App();

new AwsNewsHubStack(app, "canopy-aws-news-hub-stack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  description: "AWS News Hub - Serverless announcement platform",
});

app.synth();
