FROM mcr.microsoft.com/dotnet/core/sdk:2.2-alpine AS dotnet-build
WORKDIR /app
COPY runtime .
RUN sh compile_linux.sh

FROM mcr.microsoft.com/dotnet/core/runtime:2.2-alpine
RUN apk add --no-cache nodejs npm openjdk8 python2 make g++

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --prod

COPY . .
COPY --from=dotnet-build /app/dist/ runtime/dist/

ENV PATH="/usr/lib/jvm/java-1.8-openjdk/bin:$PATH"

EXPOSE 3000
CMD [ "npm", "start" ]
