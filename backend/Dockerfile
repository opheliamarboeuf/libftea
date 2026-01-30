# use an official Node.js image
FROM node:20-alpine

# create and set the working directory inside the container
WORKDIR /app

# copy package.json and package-lock.json first
# this allows Docker to cache dependencies
COPY package*.json ./

# install dependencies
RUN npm install

COPY prisma ./prisma

# generate Prisma client
RUN npx prisma generate

# copy the rest of the application source code
COPY . .

# build TypeScript → JavaScript
RUN npm run build

# expose the port NestJS listens on
EXPOSE 3000

# start the application
CMD ["npm", "run", "start:dev"]
