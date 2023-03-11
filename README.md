# Week 18 labs

Around cloud security

## Getting started

```bash
# ensure AWS creds are exported to current env

# also export this bucket name
export STATE_BUCKET_NAME="WM145-24-jujhar-pulumi-state-store"
# create s3 state store bucket
aws s3api create-bucket \
  --bucket "${STATE_BUCKET_NAME}"

```
