# An AWS Lambda Function to Copy S3 Objects

Lambda function to copy objects from a source S3 bucket to one or more target S3 buckets as they are added to the source bucket.

## Configuration

### IAM Role

Create an IAM role with the a policy that give access to this resources:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketTagging",
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:*"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

If you want you can give acess to all S3 resources like this:

```json
...
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": "*"
        },
...
```

### S3 Buckets

1. Ensure you have a source and a target bucket. They don't need to reside in the same region.
2. Configure your S3 buckets (see below)

### Lambda Function

1. Create a new Lambda function.
2. Sending lambda to AWS:
 * ZIP the index.js file and node_modules (Not the folder they're in)
 * Upload the ZIP package to your lambda function.
3. Add an event source to your Lambda function:
 * Event Source Type: S3
 * Bucket: your source bucket
 * Event Type: Object Created
4. Set your Lambda function to execute using the IAM role you created above.

### Configuration

Configuration is performed by setting tags on the source bucket. Access the bucket's properties, click on Tags and add:
Key: TargetBucket
Value: YOUR_BUCKET_NAME

For **more than one** bucket at the same time, just separate the target names with a space.
For a **bucket at a diferent region** you can use bucket-name@us-west-2.

After that when you upload a file to your source bucket, the file should be copied to the target bucket(s).
