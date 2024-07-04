# turborepo-remote-cache-323-reproduction

To reproduce:

1. Set a valid token for `TURBO_TOKEN` in `infrastructure/ecs-container.ts`
2. Deploy to AWS.
3. Configure turbo to cache

## Expected

Because the S3 client should assume the role, and the role has permissions on the bucket, we should be all good.

## Actual

Turbo errors like:

```console
[1]  WARNING  failed to contact remote cache: Error making HTTP request: HTTP status client error (412 Precondition Failed) for url (https://[deployed url]/v8/artifacts/deeff4f069bc17cd?teamId=team_test)
[1]  WARNING  failed to contact remote cache: Error making HTTP request: HTTP status client error (412 Precondition Failed) for url (https://[deployed url]/v8/artifacts/95c1c8b190288be1?teamId=team_test)
[1]  WARNING  failed to contact remote cache: Error making HTTP request: HTTP status client error (412 Precondition Failed) for url (https://[deployed url]/v8/artifacts/94f9ad73639c5f56?teamId=team_test)
```

The logs on the container say:

```console
{
    "severity": "WARNING",
    "level": 40,
    "time": 1720081998699,
    "pid": 8,
    "hostname": "ip-10-0-152-238.ap-southeast-2.compute.internal",
    "reqId": "JFPjy-pDRXKYbOHLkmytDw-166",
    "data": {
        "message": "Access Denied",
        "code": "AccessDenied",
        "region": null,
        "time": "2024-07-04T08:33:18.698Z",
        "requestId": "3FPGBFKDTKDMPM1D",
        "extendedRequestId": "Z1zSYboyFILiunF8tmk3jitBztNjqTK2NflKtCm6FdAXwgoLl/LqbJydwkZrgn0+s+/UB+7kezs=",
        "statusCode": 403,
        "retryable": false,
        "retryDelay": 15.987480717082402
    },
    "isBoom": true,
    "isServer": false,
    "output": {
        "statusCode": 412,
        "payload": {
            "statusCode": 412,
            "error": "Precondition Failed",
            "message": "Error during the artifact creation"
        },
        "headers": {}
    },
    "stack": "Error: Error during the artifact creation\n    at Object.handler (/home/app/node/src/plugins/remote-cache/routes/put-artifact.ts:45:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
    "type": "Error",
    "message": "Error during the artifact creation"
}
```

To me it seems like this error is caused by the S3 client being incorrectly configured when an access key and secret key are not passed in, which should be allowed.
