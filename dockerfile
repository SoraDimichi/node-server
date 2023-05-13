FROM node:18
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
# Copy the rest of the application code to the container
COPY . .
EXPOSE 8000 8001
CMD [ "npm", "run", "dev"]