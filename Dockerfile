# Image source
FROM node:10-alpine

WORKDIR /users-app

COPY ./package.json ./package-lock.json /users-app/

RUN npm install

COPY . /users-app/

EXPOSE 3000
CMD ["npm", "run", "start:dev"]