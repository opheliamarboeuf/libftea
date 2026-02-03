FROM node:20-alpine

RUN apk add --no-cache python3 make g++ bash

# set /app as the working directory inside the container
WORKDIR /app

# copy only dependency files first (optimization)
COPY package*.json ./

# install all dependencies
RUN npm install 

# copy the rest of the source
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]