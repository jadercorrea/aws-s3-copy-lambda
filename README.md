# AWS S3 Copy Lambda

An event-driven AWS Lambda function created to replicate newly uploaded S3 objects from one source bucket to one or more destination buckets.

The function was originally built in 2016, before several of the native replication and deployment workflows commonly used with AWS today.

## How it worked

The source S3 bucket emitted an `ObjectCreated` event whenever a new object was uploaded.

The Lambda function then:

1. Read the replication targets from tags configured on the source bucket
2. Retrieved the newly created object
3. Copied it to one or more destination buckets
4. Supported destinations located in different AWS regions

Multiple target buckets could be configured without changing the function code.

## Configuration model

Replication targets were defined through a `TargetBucket` tag on the source bucket.

Example:

```text
TargetBucket=bucket-a bucket-b bucket-c@us-west-2
```

A destination followed by an AWS region indicated that the target bucket was located outside the source region.

## Architecture

```text
S3 source bucket
      |
      | ObjectCreated event
      v
AWS Lambda
      |
      +--> Destination bucket A
      +--> Destination bucket B
      +--> Destination bucket C
```

## Historical implementation

The original implementation used:

- AWS Lambda
- Node.js 4.3
- Amazon S3 event notifications
- Source-bucket tags for runtime configuration

The original deployment package and dependencies remain in the repository as part of the historical implementation.

## Security note

The IAM examples in the original documentation used broad permissions for simplicity.

A production implementation should instead use least-privilege policies restricted to:

- the specific source bucket;
- the configured destination buckets;
- the required CloudWatch Logs actions.

Avoid granting unrestricted `s3:*`, `logs:*`, or wildcard resource access.

## Status

This project was created in 2016 and is no longer actively maintained.

It depends on an obsolete Node.js runtime and an older version of the AWS SDK. The repository is preserved as a historical example of an event-driven serverless workflow and should not be deployed to production without modernization.

For new systems, evaluate native S3 Replication or implement the workflow using a currently supported Lambda runtime, infrastructure as code, least-privilege IAM policies and automated tests.

## License

No explicit license was included in the original project.
