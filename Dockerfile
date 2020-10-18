FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS dotnet-build
WORKDIR /app
COPY src/runtime .
RUN sh compile_linux.sh

FROM node:14-alpine AS node-build
RUN apk add --no-cache python2 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --also=dev
COPY . .
RUN npm run build

FROM node:14-alpine
RUN apk add --no-cache openjdk11 python2 make g++ icu libintl
WORKDIR /app
COPY package*.json ./
RUN npm ci --prod
COPY src/public/ public
COPY src/runtime/ runtime
COPY src/views views
COPY --from=node-build /app/dist/ .
COPY --from=dotnet-build /app/dist/ runtime/dist/
ENV PATH="/usr/lib/jvm/java-11-openjdk/bin:$PATH"
EXPOSE 3000
CMD [ "npm", "start" ]
