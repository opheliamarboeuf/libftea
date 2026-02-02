FROM node:20-alpine

# set /app as the working directory inside the container
WORKDIR /app

# copy only dependency files first (optimization)
COPY package*.json ./

# install all dependencies
RUN npm install \
    && npm install react react-dom \
    && npm install -D @types/react @types/react-dom
# copy the rest of the source
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]