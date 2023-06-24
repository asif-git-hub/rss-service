### How to use this repo

## Setup deployment bucket

Create s3 bucket with name 'news-extractor-deployment-assets'. If the bucket name is different make sure the package.json script is updated with the bucket name

## Create a ChatGPT account and get the acces token for the chatgpt api

Go to AWS Console > SSM Parameters
Create an SSM Parameter with name "/openai/apikey" and put the access token for the api there

## Building lambda packages

npm run build

## Configuring the schedule

The schedule is set as a cron expression in the template, this can be changed

## ECS Task

# Build Docker Image

- docker build -t rss-processor .

# Create an ECR Repository to hold docker image

Go to AWS Console > ECR
Create a repository with name 'rss-processor' make it public and choose all the default settings.
If you give it another name, make sure to change the image name and the subsequent commands.

# Push Image to ECR

If you are using a different region, use the desired region name instead.

- aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNTID>.dkr.ecr.ap-southeast-2.amazonaws.com
- docker tag rss-processor:latest <AWS_ACCOUNTID>.dkr.ecr.ap-southeast-2.amazonaws.com/rss-processor:latest
- docker push <AWS_ACCOUNTID>.dkr.ecr.ap-southeast-2.amazonaws.com/rss-processor:latest

# Gathering deploy paramters

env - your target environment
dockerImage - the image you pushed to ecr, please see default and override with your own image
vpcId - this can be the default vpcid or your custom vpc
subnet1 - the subnet associated with the vpc
subnet2 - the subnet associated with the vpc
subnet3 - the subnet associated with the vpc

You can find the VPC Id using AWS Console > VPC
The associated subnets are in VPC > Subnets

## Deploying the template

Before deploying the template, you can set the default according to your aws account
If you are deploying into another region, change the region in the --region field
Or, you can change the deploy command in the package.json:

For example,

sam deploy --template template.yaml --stack-name dev-news-extractor-stack --s3-bucket news-extractor-deployment-assets --s3-prefix dev --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-2 --parameter-overrides env=prod dockerImage=<AWS_ACCOUNTID>.dkr.ecr.ap-southeast-2.amazonaws.com/rss-processor:latest vpcId=vpc-123123 subnet1=subnet123 subnet2=subnet321 subnet3=subnet987

npm run deploy:dev for dev
npm run deploy:prod for prod

## Sample RSS Feed Table

```json
{
  "feed": "http://rss.cnn.com/rss/cnn_topstories.rss",
  "regionCode": "us",
  "lastFetchedAt": "2023-06-08T04:29:56.213Z",
  "scrapeLinks": true,
  "scrapingSelector": ".article__content"
}

{
 "feed": "https://www.constructiondive.com/feeds/news/",
 "regionCode": "us",
 "lastFetchedAt": "2023-06-24T09:47:38.338Z",
 "scrapeLinks": true,
 "scrapingSelector": ".main-content p"
}
```

## Choosing a selector

Reference: https://cheerio.js.org/docs/basics/selecting

Choose a selector which covers the article main body class. Then you can even target the paragraphs using <p> or <h1> tags.

## Configuring default prompt

Add a default prompt to prompt table by using 'unspecified' value for role and region. If you want a leave a hash key or sort key blank, simply put 'unspecified'


## Configuring openai parameters

Reference: https://platform.openai.com/docs/api-reference/completions/create
in chatgpt.client.ts, you can modify the max_tokens and temperature parameters. 
Tweak the temperature parameter according to your need depending on how creative you want chatgpt to be.
Tweak max_tokens to adjust to larger article.

## Testing

Once everything has been set up, you can run the ECS Task using the AWS Console.

Go to ECS > Clusters > Go to Task Tab and create a New Task with default settings. Choose the Family with latest revision version. 