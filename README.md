### How to use this repo

## Setup deployment bucket

Create s3 bucket with name 'news-extractor-deployment-assets'. If the bucket name is different make sure the package.json script is updated with the bucket name

## Building lambda packages

npm run build

## Deploying the template

npm run deploy:dev for dev
npm run deploy:prod for prod

## Configuring the schedule

The schedule is set as a cron expression in the template, this can be changed

## ECS Task

# Build Docker Image

- docker build -t rss-processor .

# Push Image to ECR

- aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin <AWS_ACCOUNTID>.dkr.ecr.ap-southeast-2.amazonaws.com
- docker tag rss-processor:latest <AWS_ACCOUNTID>.dkr.ecr.ap-southeast-2.amazonaws.com/rss-processor:latest
- docker push <AWS_ACCOUNTID>.dkr.ecr.ap-southeast-2.amazonaws.com/rss-processor:latest

## Sample RSS Feed Table

- https://news.un.org/feed/subscribe/en/news/region/europe/feed/rss.xml

```
{
 "feed": "http://rss.cnn.com/rss/cnn_topstories.rss",
 "region": "us",
 "lastFetchedAt": "2023-06-08T04:29:56.213Z",
 "scrapeLinks": true,
 "scrapingSelector": ".article__content"
}
```
