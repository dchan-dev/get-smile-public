# Get-Smile CloudFormation Stack

This project deploys a CloudFormation stack with:
1. An S3 bucket named `get-smile-vinyl`
2. A Lambda function named `get-smile-vinyl` with a function URL

## Deployment

To deploy the stack, run:

```bash
./deploy.sh
```

## Resources Created

- **S3 Bucket**: `get-smile-vinyl`
- **Lambda Function**: `get-smile-vinyl` (Node.js runtime)
- **Lambda Function URL**: Accessible without API Gateway
- **IAM Role**: For Lambda execution permissions

## Lambda Function

The Lambda function returns a simple JSON response with the message "ok".
# get-smile

----

# Add purchase queue

1. SQS Queue Configuration:
   • Created an SQS queue named "purchase-smile-vinyl"
   • Set visibility timeout to 300 seconds (5 minutes)
   • Set message retention period to 14 days

2. Lambda Function Updates:
   • Updated the Lambda function code to handle SQS messages
   • Added logging for received SQS messages
   • Included logic to process messages from the queue

3. IAM Permissions:
   • Added necessary permissions to the Lambda role to:
     • Receive messages from the SQS queue
     • Delete messages from the queue
     • Get queue attributes

4. Event Source Mapping:
   • Created an event source mapping to connect the SQS queue to the Lambda function
   • Set batch size to 10 messages per invocation

5. CloudFormation Outputs:
   • Added outputs for the Lambda function URL
   • Added outputs for the SQS queue URL and ARN for easy reference

This setup allows you to:
1. Send messages to the "purchase-smile-vinyl" queue
2. The Lambda function "get-smile-vinyl" will automatically be triggered when messages arrive
3. The Lambda function will process these messages in batches of up to 10

----

# Add valkey

1. ElastiCache Valkey Cluster:
   • Named get-smile-vinyl as requested
   • Using Redis engine version 7.1
   • Instance type: cache.t3.micro (cost-effective for development)
   • Single node configuration for simplicity

2. Networking Resources:
   • VPC with CIDR block 10.0.0.0/16
   • Two subnets in different availability zones for high availability
   • Security groups to control access between Lambda and ElastiCache

3. Lambda Function Updates:
   • Added VPC configuration to allow Lambda to access ElastiCache
   • Added environment variables for Redis endpoint and port
   • Updated Lambda code to:
     • Connect to Redis using the redis client
     • Store incoming SQS messages in Redis
     • Retrieve and return cached messages

4. IAM Role Updates:
   • Added VPC access permissions for Lambda with the AWSLambdaVPCAccessExecutionRole policy

5. Outputs:
   • Added ElastiCache endpoint and port to outputs for easy reference

The template is now ready for deployment. Note that your Lambda function will need the redis npm package installed in its deployment package. You can install it using:

bash
npm install redis

----

# add VPC endpoint

1. Created an S3 VPC Endpoint resource:

yaml
   S3VPCEndpoint:
     Type: AWS::EC2::VPCEndpoint
     Properties:
       ServiceName: !Sub 'com.amazonaws.${AWS::Region}.s3'
       VpcId: !Ref VPC
       VpcEndpointType: Gateway
       RouteTableIds:
         - !Ref PublicRouteTable
       PolicyDocument:
         Version: '2012-10-17'
         Statement:
           - Effect: Allow
             Principal: '*'
             Action:
               - 's3:GetObject'
               - 's3:PutObject'
               - 's3:ListBucket'
             Resource:
               - !Sub 'arn:aws:s3:::${GetSmileVinylBucket}'
               - !Sub 'arn:aws:s3:::${GetSmileVinylBucket}/*'
       Tags:
         - Key: Name
           Value: GetSmileVinylVPC



2. Added a route table for the VPC:
  yaml
   PublicRouteTable:
     Type: AWS::EC2::RouteTable
     Properties:
       VpcId: !Ref VPC
       Tags:
         - Key: Name
           Value: GetSmileVinylPublicRouteTable


3. Associated the route table with the subnets:

yaml
   PublicSubnet1RouteTableAssociation:
     Type: AWS::EC2::SubnetRouteTableAssociation
     Properties:
       SubnetId: !Ref PublicSubnet1
       RouteTableId: !Ref PublicRouteTable

   PublicSubnet2RouteTableAssociation:
     Type: AWS::EC2::SubnetRouteTableAssociation
     Properties:
       SubnetId: !Ref PublicSubnet2
       RouteTableId: !Ref PublicRouteTable



4. Added an output to expose the S3 VPC Endpoint ID:
  yaml
   S3VPCEndpointId:
     Description: ID of the S3 VPC Endpoint
     Value: !Ref S3VPCEndpoint