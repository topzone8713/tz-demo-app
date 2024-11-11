FROM node:16

WORKDIR /app
COPY . /app

RUN npm install
CMD node src/app.js

EXPOSE 3000
