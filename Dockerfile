FROM node:18.16.1-alpine

WORKDIR /src
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 3010
CMD yarn start