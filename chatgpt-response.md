There are several ways to deploy backend APIs on AWS, and the best option depends on your application architecture, traffic patterns, scaling requirements, operational complexity, and cost.

Since you're working with backend technologies such as Node.js, Next.js, microservices, and AWS services like Lambda and API Gateway, I'll compare the main deployment approaches using practical examples.

# 1. The main ways to deploy backend APIs on AWS

[File:Amazon Lambda architecture logo.svg - Wikimedia Commons](https://images.openai.com/static-rsc-4/BVOKTuzq-WE23sUpbEYalv9OTNIt2HQXfPQ8L1sXZjnUuDWtKPluZQI3BkSmEgRPi8aSelgujA_oD_KLtmOAqPNc7ACR1HWwYDl9RjAmgG_tzIb3WTa63v82AoORkHpkPFdAQosynUb76ILUymiy2X-6gtS_Pxs0XupFcvL21GE?purpose=inline)

1\. AWS Lambda + API Gateway

Serverless

Deploy individual API handlers as Lambda functions and expose them through API Gateway. AWS manages the underlying servers and scales function execution automatically.

Best for: REST APIs, event-driven backends, lightweight microservices, and APIs with variable traffic.

Example: `API Gateway → Lambda → DynamoDB / RDS`

[Cloud Icons | Amazon Elastic Container Service](https://images.openai.com/static-rsc-4/w1qdMQfvOlNZyVcZMy4NlCLj8-i3GcHhK9gtcukzN95vBe0ITrNeshxJW9VhWVjfMwan7KpEb08EsiF_v7NBtZ8YdzKmRkeK5YiOofdUAofo-dQmgXiGpaaumIcSM3-qrvxKoF-3kKF8j5WKwOapuuaaLYxRV0o69tBrWFJ6Q9M?purpose=inline)

2\. Amazon ECS + AWS Fargate

Containers without server management

Package your entire backend application in a Docker container. ECS orchestrates the containers, while Fargate manages the underlying compute infrastructure.

Best for: Express, NestJS, ASP.NET Core APIs, and long-running services.

Example: `ALB → ECS Service → Fargate Tasks`

[Free High-Quality Amazon EKS Logo for Creative Design](https://images.openai.com/static-rsc-4/Or04aWW_S6Y8QP12Tpysowjs5H9xNIfIoUsmXmvXwhfdlDyIWS0alY3VTsThAXaJg4qtUdzLyz94i6YfXPubs3qOLgJhm-TK30A0cOWV6iHv3QfWUkel7f0UY90cm-3f1HjL8goBOgC4_6of--688sUXF4gstLAhGxNnzVWd7Tk?purpose=inline)

3\. Amazon EKS (Kubernetes)

Deploy containerized APIs as Kubernetes workloads. EKS provides a managed Kubernetes control plane.

Best for: Complex microservice platforms, Kubernetes-based infrastructure, and organizations needing Kubernetes ecosystem tooling.

Example: `ALB / Ingress → EKS → Kubernetes Services → Pods`

[Elastic Beanstalk SVG and PNG Icons | AWS Icons](https://images.openai.com/static-rsc-4/LArJYrX0Cx9REJywlKjwYC2ssGvA9-KP4Dv31dJiTC4WSWPdgessWyGIwWpJYcPxA5pmpBp_1JGja3xTBSLwKwwZrG50wttjI8xcoXVOHsykYmRGhW9pJ0EOPNtD01TUi9NxcnAyrDA3WCzgl2URf7eOyvx4t_01QmfbEiqVBHI?purpose=inline)

4\. AWS Elastic Beanstalk

Upload your application code or deployment package, and Beanstalk provisions and manages resources such as EC2 instances, load balancers, and Auto Scaling.

Best for: Traditional web APIs when you want a simpler deployment experience without designing the infrastructure from scratch.

[Amazon EC2 | Integrations | Opal Security](https://images.openai.com/static-rsc-4/HSk8YHPa6JA14sHlG7c1BIR-AlCKhBxVeJuwjDBuKFv0wCszN1hDGDjwq-Txab19tCqxYoocuiFOhFq8Yhd9R6oP21ruzP6QYOSMHqySIYkoYsG7EC9Pr3DNr6lmz8_MQY4secqbsHxSJ4GQEmd1TqjS70vkl5h_qgmZI58BL4I?purpose=inline)

5\. Amazon EC2

Run your API directly on a virtual machine, using a service manager, reverse proxy, or container runtime as appropriate.

Best for: Full operating-system control, legacy applications, custom configurations, or specialized workloads.

[Cloud Icons | AWS App Runner](https://images.openai.com/static-rsc-4/yrD7A_rJuPDTKKMdKQyop92joRUb1naYpiOqiVBCzLPeQwUppRve5jTXonXmPI2LAnPyXZ6nxQqGucpqNRcR_zFzNdI_46MmyCyopBXCN6qj1YoAM3oVst6-XmGPfKKxDdFqmpZSahpZ1QbhTsDZTMZlPW8B5Fkx5F78UBJ3Fbo?purpose=inline)

6\. AWS App Runner

Deploy a supported web application from source code or a container image with a simplified managed runtime experience.

Best for: Developers who want to deploy a web API without managing ECS task definitions, load balancers, and much of the underlying networking setup.

These are the principal approaches. They are not all mutually exclusive: for example, you can run containerized APIs on ECS while using Lambda for asynchronous jobs.

## 2. Comparison: which approach should you choose?

| Feature                  | Lambda              | ECS + Fargate                        | EKS                                                                | EC2                             |
| ------------------------ | ------------------- | ------------------------------------ | ------------------------------------------------------------------ | ------------------------------- |
| Deployment unit          | Function            | Container                            | Container / Pod                                                    | Process or container            |
| Server management        | None                | No host management                   | Kubernetes control plane managed; worker capacity depends on setup | You manage OS and runtime       |
| Scaling                  | Per function        | Per service/task                     | Kubernetes-based                                                   | Auto Scaling configuration      |
| Long-running HTTP server | Not the usual model | Yes                                  | Yes                                                                | Yes                             |
| Operational complexity   | Low–medium          | Medium                               | High                                                               | Medium–high                     |
| Best fit                 | Event-driven APIs   | Containerized APIs and microservices | Kubernetes platforms                                               | Specialized or legacy workloads |

Elastic Beanstalk is another option when you want a managed application deployment workflow. It provisions and manages supporting infrastructure, while you remain responsible for application configuration and costs.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.aws.amazon.com\&sz=32)

AWS Elastic Beanstalk

+2



One current caveat: AWS App Runner stopped accepting new customers on April 30, 2026. Existing customers can continue using it, but for a new containerized API deployment, consider ECS Express Mode or ECS with Fargate instead.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://aws.amazon.com\&sz=32)

Amazon Web Services

+1



## 3. Understand the difference between compute and API exposure

A common source of confusion is that API Gateway is not a compute service. It receives and routes API requests; another service executes your backend code.

Client

Browser, mobile app, or another service

API entry point

API Gateway, Application Load Balancer, or a service endpoint

Lambda

Function execution

ECS / EKS / EC2

Application server

Data and other services

RDS, DynamoDB, SQS, S3, and other APIs

There are several valid combinations:

- API Gateway + Lambda: API Gateway invokes functions to process requests.
- ALB + ECS/Fargate: The load balancer distributes requests to your containerized application.
- API Gateway + ECS: API Gateway can act as the public API entry point while ECS runs your application.
- ALB + EC2: The load balancer forwards requests to an API hosted on virtual machines.
- Lambda Function URL: A Lambda function can expose an HTTP endpoint without API Gateway.

The entry point and compute service are separate architectural choices.

## 4. My recommendation for different scenarios

Scenario A: Small or medium REST API

Choose Lambda + API Gateway if you want automatic scaling and low infrastructure management. It is especially useful for APIs that spend much of their time waiting on databases or other services.

Scenario B: Node.js, NestJS, or ASP.NET Core microservices

Choose ECS + Fargate + Application Load Balancer for a conventional containerized backend. You retain a normal web-server programming model without managing EC2 hosts.

Scenario C: Large microservice platform

Choose EKS if Kubernetes capabilities, ecosystem integrations, and workload orchestration justify the additional complexity.

Scenario D: Existing application or maximum infrastructure control

Choose EC2, or consider Elastic Beanstalk if you want AWS to manage more of the deployment workflow.

## 5. What about API Gateway, ALB, and CloudFront?

These services solve different problems and can be combined.

| Service                         | Main purpose                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------- |
| API Gateway                     | API routing, authorization integration, throttling, and API-specific controls |
| Application Load Balancer (ALB) | Distributes HTTP/HTTPS requests across application targets                    |
| CloudFront                      | Content delivery and edge caching; can also front APIs                        |
| AWS WAF                         | Filters unwanted or malicious web requests                                    |
| Route 53                        | DNS routing for your domain                                                   |

For example, a production architecture might look like:

`Route 53 → CloudFront + WAF → API Gateway → Lambda`

Or, for containerized microservices:

`Route 53 → ALB → ECS/Fargate → Node.js API → RDS`

You don't necessarily need all these services. Add them when their capabilities solve a real requirement.

## 6. Choose your architecture

Select your requirements to get a starting recommendation.

Backend technology

Node.js / NestJS / Express

C# / ASP.NET Core

Python / FastAPI / Django

Multiple languages

Application architecture

Monolithic API

Microservices

Independent serverless functions

Traffic pattern

Variable or unpredictable

Steady, continuous traffic

High-volume production traffic

Main priority

Minimize cost

Simplest deployment and maintenance

Infrastructure control and flexibility

Balance of scalability and maintainability

Recommend my AWS architecture

My default starting point for a new containerized microservices backend would be ECS + Fargate, while Lambda + API Gateway is my starting point for an API that fits the serverless execution model. Neither is universally cheaper or better; traffic, workload duration, networking, database costs, and operational requirements all matter.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.aws.amazon.com\&sz=32)

AWS Decision Guides

+1
