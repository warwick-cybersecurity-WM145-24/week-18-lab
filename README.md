# Week 18 labs

Around cloud security

## Getting started

```bash
# ensure AWS creds are exported to current env

# also export this bucket name
# shove in the aws account id to make it globally unique
export PULUMI_STATE_BUCKET_NAME="jujhar-$(aws sts get-caller-identity --query Account --output text)-pulumi-state-store"

# create Pulumi s3 state store bucket to store the state in
aws s3api create-bucket \
  --bucket "${PULUMI_STATE_BUCKET_NAME}" \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1

# tell Pulumi you're using this bucket as your state store
pulumi login s3://"${PULUMI_STATE_BUCKET_NAME}"

```
