FROM node:16-alpine as builder

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN ls -a
RUN npm run build

EXPOSE 80

CMD [ "node", "/usr/app/build/summarizer-task/index.js" ]