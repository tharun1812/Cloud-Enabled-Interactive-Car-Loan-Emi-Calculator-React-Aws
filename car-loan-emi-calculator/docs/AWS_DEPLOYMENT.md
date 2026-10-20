# Deploying to AWS (EC2 + VPC + IAM)

The CloudFormation template in `deploy/aws/cloudformation.yaml` creates:

| Piece | What it does |
| --- | --- |
| **VPC** (`10.20.0.0/16`) + public subnet + internet gateway + route table | A network of its own, separate from the default VPC |
| **Security group** | Allows inbound **port 80 only**. SSH (port 22) is closed |
| **IAM role + instance profile** | Lets the instance read `s3://<bucket>/dist/*` and nothing else, plus SSM Session Manager for shell access |
| **EC2 instance** (Amazon Linux 2023, IMDSv2 required) | Installs nginx and copies the built site from S3 at boot |

## Steps

1. **Build the site**
   ```bash
   npm ci
   npm run build
   ```
2. **Create a bucket and upload the build** (bucket names are global, pick your own)
   ```bash
   aws s3 mb s3://YOUR-BUCKET-NAME
   aws s3 sync dist/ s3://YOUR-BUCKET-NAME/dist/ --delete
   ```
3. **Create the stack**
   ```bash
   aws cloudformation deploy \
     --template-file deploy/aws/cloudformation.yaml \
     --stack-name emi-calculator \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides ArtifactBucketName=YOUR-BUCKET-NAME
   ```
4. **Get the URL**
   ```bash
   aws cloudformation describe-stacks --stack-name emi-calculator \
     --query "Stacks[0].Outputs[?OutputKey=='SiteUrl'].OutputValue" --output text
   ```
5. **Update the site later**: re-run the `s3 sync` from step 2, then run the same sync on the instance through
   Session Manager (`aws s3 sync s3://YOUR-BUCKET-NAME/dist/ /usr/share/nginx/html/ --delete`).
6. **Clean up** to avoid charges: `aws cloudformation delete-stack --stack-name emi-calculator`.

> HTTP only. For real use, put CloudFront or an Application Load Balancer with an ACM certificate in front.
> A t3.micro may fall outside the free tier depending on your account age, so check the AWS pricing page.
