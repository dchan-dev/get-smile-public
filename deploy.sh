#!/bin/bash

# Deploy the CloudFormation stack
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name get-smile \
  --capabilities CAPABILITY_IAM

# Get the Lambda function URL
echo "Lambda Function URL:"
aws cloudformation describe-stacks \
  --stack-name get-smile
