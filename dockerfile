FROM node:22.14.0-alpine3.20

WORKDIR /usr/src/app

COPY package.json ./

COPY package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3004