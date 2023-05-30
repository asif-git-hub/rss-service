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

