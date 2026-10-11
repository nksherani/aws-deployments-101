# AWS Deployment Guide: Node.js API & Lambda

This project demonstrates a mock Products API built in Node.js that runs both as a local server and as an AWS Lambda function, along with hands-on instructions for multiple deployment methods.

---

## 📁 Project Structure

```text
aws-101/
├── src/
│   ├── mockController.js   # Core business logic (products CRUD & health check)
│   ├── server.js           # Local HTTP server (http://localhost:3000)
│   └── lambda.js           # AWS Lambda handler (API Gateway & Function URLs)
├── test/
│   └── api.test.js         # Unit tests (native Node test runner)
├── terraform/
│   └── main.tf             # Infrastructure as Code (Terraform)
├── .github/workflows/
│   └── deploy.yml          # CI/CD pipeline (GitHub Actions)
├── sam-template.yaml       # Infrastructure as Code (AWS SAM)
└── package.json            # Node configuration & scripts
```

---

## 🏃 Local Run & Testing

### 1. Run as a local HTTP API server
```bash
npm start
# or watch mode:
npm run dev
```
Endpoints:
- `GET  http://localhost:3000/health`
- `GET  http://localhost:3000/products`
- `POST http://localhost:3000/products` (Body: `{"name":"T-Shirt","price":25}`)
- `GET  http://localhost:3000/openapi.json` (OpenAPI 3.0 specification)

### 2. Run unit tests
```bash
npm test
```

---

## 🚀 Deployment Methods Overview

| Method | Best For | Prerequisites | Pros |
| :--- | :--- | :--- | :--- |
| **1. AWS CLI** | Quick scripts, learning, ad-hoc deploys | AWS CLI v2, IAM credentials | Zero framework overhead, direct AWS API |
| **2. IaC (Terraform)** | Multi-cloud, strict infra governance | Terraform CLI (>= 1.5) | Reproducible, state tracking, modular |
| **3. IaC (AWS SAM / CDK)** | Serverless-first AWS architectures | AWS SAM CLI or AWS CDK | Native AWS serverless abstractions, local mocking |
| **4. VS Code Toolkit** | Developer inner-loop, debugging | AWS Toolkit extension | UI-driven, easy invocation, view CloudWatch in editor |
| **5. CI/CD (GitHub Actions)**| Production automation | GitHub repository, AWS IAM OIDC | Automatic testing, safe staging/prod rollout |
| **6. AWS Native CI/CD (CodePipeline & CodeBuild)** | Fully native AWS automated pipeline | AWS CodePipeline, CodeBuild, CodeStar/S3 | 100% inside AWS IAM perimeter, no external secrets needed |

---

## 📘 Method 1: AWS CLI (Step-by-Step)

### Step 1.1: Configure AWS CLI
Ensure your AWS credentials are configured:
```bash
aws configure
# Enter AWS Access Key ID, Secret Access Key, and Default region (e.g., us-east-1)
```

### Step 1.2: Create the IAM Execution Role
Lambda needs permission to assume the role and write logs:
```bash
# 1. Create trust policy
cat << 'EOF' > trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Create IAM Role
aws iam create-role \
  --role-name mock-products-api-role \
  --assume-role-policy-document file://trust-policy.json

# 3. Attach basic logging policy
aws iam attach-role-policy \
  --role-name mock-products-api-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Step 1.3: Package & Create the Function
```bash
# Create zip artifact with source files
zip -j function.zip src/*

# Get the Role ARN
ROLE_ARN=$(aws iam get-role --role-name mock-products-api-role --query 'Role.Arn' --output text)

# Create the Lambda function
aws lambda create-function \
  --function-name mock-products-api \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler lambda.handler \
  --zip-file fileb://function.zip \
  --architectures arm64 \
  --timeout 10 \
  --memory-size 256
```

### Step 1.4: Expose via Lambda Function URL (Public HTTP Endpoint)
```bash
# Enable Function URL without auth requirement
aws lambda create-function-url-config \
  --function-name mock-products-api \
  --auth-type NONE

# Allow public invocations
aws lambda add-permission \
  --function-name mock-products-api \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE
```
Get your public endpoint URL:
```bash
aws lambda get-function-url-config --function-name mock-products-api --query 'FunctionUrl' --output text
```

### Step 1.5: Updating Code with AWS CLI
Whenever code is updated:
```bash
zip -j function.zip src/*
aws lambda update-function-code \
  --function-name mock-products-api \
  --zip-file fileb://function.zip
```

---

## 🏛️ Method 2: Infrastructure as Code (Terraform)

Located in `terraform/main.tf`.

### Step 2.1: Initialize & Plan
```bash
cd terraform
terraform init
terraform plan
```

### Step 2.2: Deploy
```bash
terraform apply -auto-approve
```
Terraform automatically packages the files in `src/`, creates the IAM role, deploys the Lambda, configures the Function URL, and prints the public endpoint URL as an output:
```text
Outputs:
lambda_function_url = "https://xxxxxx.lambda-url.us-east-1.on.aws/"
```

### Step 2.3: Teardown
```bash
terraform destroy -auto-approve
cd ..
```

---

## ⚡ Method 3: Infrastructure as Code (AWS SAM)

Located in `sam-template.yaml`.

### Step 3.1: Build
```bash
sam build -t sam-template.yaml
```

### Step 3.2: Test Locally (No AWS deployment needed)
```bash
# Emulate Lambda Function locally
sam local invoke ProductsApiFunction -e <(echo '{"rawPath":"/products","requestContext":{"http":{"method":"GET"}}}')

# Emulate local HTTP API Gateway on port 3001
sam local start-api -p 3001
```

### Step 3.3: Deploy to AWS
```bash
sam deploy --guided
```
Follow prompts to set Stack Name (e.g., `mock-api-stack`) and AWS Region. SAM provisions both the Lambda function and an API Gateway HTTP API.

---

## 🧩 Method 4: VS Code AWS Toolkit Extension

The **AWS Toolkit for Visual Studio Code** is the primary GUI tool for working with AWS Lambda.

### Step 4.1: Installation
1. Open VS Code `Extensions` (`Ctrl+Shift+X` or `Cmd+Shift+X`).
2. Search for **AWS Toolkit** by Amazon Web Services and click **Install**.

### Step 4.2: Connecting AWS Credentials
1. Click the **AWS icon** in the left activity bar.
2. Under **Resources** / **Explorer**, click **Connect to AWS**.
3. Choose your profile from `~/.aws/credentials` or authenticate via AWS Builder ID / IAM Identity Center.

### Step 4.3: Deploying Lambda from VS Code
1. Open the file [src/lambda.js](file:///Volumes/Lexar/GitHub/aws-101/src/lambda.js).
2. Right-click anywhere in the file or look at the CodeLens above `exports.handler`.
3. Select **AWS: Upload Lambda Function...**.
4. Choose:
   - **Upload Directory / Zip**: Choose existing function `mock-products-api` or create a new one.
   - **Handler**: `lambda.handler`
   - **Runtime**: `Node.js 20.x`
5. Click upload; progress is shown in the VS Code Output panel.

### Step 4.4: Invocation & Live CloudWatch Logs
- In the AWS Explorer panel, expand **Lambda** -> click `mock-products-api`.
- Right-click -> **Invoke on AWS...**. Provide a sample JSON payload:
  ```json
  { "rawPath": "/products", "requestContext": { "http": { "method": "GET" } } }
  ```
- View invocation response and streaming CloudWatch logs directly in VS Code.

---

## 🔄 Method 5: CI/CD via GitHub Actions

Located in `.github/workflows/deploy.yml`.

### Step 5.1: Secrets Setup in GitHub
In your GitHub Repository, navigate to **Settings** -> **Secrets and variables** -> **Actions** and add:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

*(Best Practice Note: In enterprise environments, prefer **AWS IAM OIDC Federation** over long-lived access keys so GitHub Actions assumes a role via temporary STS tokens).*

### Step 5.2: Pipeline Execution
On every push to `main` branch or manual trigger:
1. Installs Node dependencies (`npm ci`).
2. Runs unit tests (`npm test`).
3. Zips source code into `dist/function.zip`.
4. Authenticates to AWS via `aws-actions/configure-aws-credentials`.
5. Updates code via `aws lambda update-function-code`.

---

## 🏗️ Method 6: AWS Native CI/CD (AWS CodePipeline & CodeBuild)

AWS provides a complete suite of native CI/CD developer tools:
- **AWS CodePipeline**: Orchestration service that models stages (Source -> Build -> Deploy).
- **AWS CodeBuild**: Fully managed build server (runs tests, compiles, packages).
- **AWS CodeDeploy** / **CloudFormation**: Automates blue/green and rolling deployments.
- **AWS CodeConnections / CodeStar**: Connects AWS directly to GitHub / GitLab / Bitbucket securely without storing AWS keys in GitHub.

### Step 6.1: The Build Specification (`buildspec.yml`)
AWS CodeBuild is controlled by a declarative file in the root of your repo named [buildspec.yml](file:///Volumes/Lexar/GitHub/aws-101/buildspec.yml):

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - echo "Installing dependencies..."
      - npm ci || npm install
  pre_build:
    commands:
      - echo "Running unit tests..."
      - npm test
  build:
    commands:
      - echo "Packaging Lambda function..."
      - mkdir -p dist
      - zip -j dist/function.zip src/*
  post_build:
    commands:
      - echo "Updating Lambda function code via AWS CLI..."
      - aws lambda update-function-code --function-name mock-products-api --zip-file fileb://dist/function.zip
      - echo "Lambda deployment finished on $(date)"

artifacts:
  files:
    - dist/function.zip
    - sam-template.yaml
```

### Step 6.2: Create the CodeBuild Project via AWS CLI
```bash
# 1. Create a service role for CodeBuild
cat << 'EOF' > codebuild-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "codebuild.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name mock-api-codebuild-role \
  --assume-role-policy-document file://codebuild-trust-policy.json

# 2. Attach permissions for CloudWatch logs, S3, and updating the Lambda function
cat << 'EOF' > codebuild-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "lambda:UpdateFunctionCode",
        "lambda:GetFunction"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name mock-api-codebuild-role \
  --policy-name CodeBuildLambdaDeployPolicy \
  --policy-document file://codebuild-policy.json

# 3. Create the CodeBuild project
CB_ROLE_ARN=$(aws iam get-role --role-name mock-api-codebuild-role --query 'Role.Arn' --output text)

aws codebuild-create-project \
  --name mock-products-api-build \
  --source "type=GITHUB,location=https://github.com/<YOUR_USER>/<YOUR_REPO>.git" \
  --artifacts "type=NO_ARTIFACTS" \
  --environment "type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:5.0,computeType=BUILD_GENERAL1_SMALL" \
  --service-role "$CB_ROLE_ARN"
```

### Step 6.3: Assemble the Pipeline in AWS CodePipeline
In the AWS Management Console or via AWS CLI:
1. Navigate to **AWS CodePipeline** -> **Create pipeline**.
2. **Source stage**: Select **GitHub (Version 2)** via AWS CodeStar Connection. Select repository & `main` branch.
3. **Build stage**: Select **AWS CodeBuild** -> choose `mock-products-api-build`.
4. **Deploy stage**: 
   - Option A: Let CodeBuild execute `aws lambda update-function-code` directly (configured in `buildspec.yml`).
   - Option B: Use **AWS CloudFormation** deploy action to execute `sam-template.yaml` for change sets and automated rollbacks.
5. Click **Create Pipeline**.

Now, whenever you push commits to GitHub, AWS CodePipeline detects the webhook, launches a temporary container in AWS CodeBuild, runs `npm test`, packages the code, and updates the Lambda function without leaving AWS!

---

## 📊 Summary Comparison: When to use which?

- **Prototyping / Quick Learning**: AWS CLI or VS Code Plugin.
- **Serverless Inner Loop**: AWS SAM (`sam local start-api`).
- **Team Infrastructure Standard**: Terraform (declarative state tracking).
- **Automated Delivery (External / Multi-Cloud)**: GitHub Actions (developer familiar).
- **Automated Delivery (AWS Native / Strict Security Compliance)**: AWS CodePipeline + AWS CodeBuild (keeps all secrets and credentials within the AWS IAM security perimeter).

