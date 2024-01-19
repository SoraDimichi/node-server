# Base Image
FROM node:18-slim AS base
# Environment Variables
ENV API_PORT=${API_PORT}
ENV STAT_PORT=${STAT_PORT}
ENV PATH="/node_modules/.bin:$PATH"
ENV ENV=${ENV}
# Copying Files
COPY . /app
# Setting Work Directory
WORKDIR /app

# Production Dependencies
RUN yarn build
RUN ls

# Final Stage
EXPOSE 8000 8001
