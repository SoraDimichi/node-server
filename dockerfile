FROM node:18
WORKDIR /app
COPY package*.json ./
RUN yarn install
# Copy the rest of the application code to the container
COPY . .
EXPOSE 8000 8001
CMD [ "npx", "ts-node", "main.ts"]