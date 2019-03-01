FROM node:10-stretch

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN echo -e "*\thard\t64000" >> /etc/security/limits.conf && \
    echo -e "*\tsoft\tnproc  64000" >> /etc/security/limits.conf;

RUN apt-get -qq update && \
    apt-get -qq install build-essential software-properties-common dirmngr curl wget libunwind8 gettext apt-transport-https -y;

# Install repos
RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.asc.gpg && \
    mv microsoft.asc.gpg /etc/apt/trusted.gpg.d/ && \
    wget -q https://packages.microsoft.com/config/debian/9/prod.list -O /etc/apt/sources.list.d/microsoft-prod.list && \
    apt-get -qq update;

# Install Java-8 and NetCore
RUN apt-get -qq install dotnet-sdk-2.1 openjdk-8-jdk openjdk-8-jre -y;

# Cleanup APT cache
RUN apt-get clean;

RUN npm install;

# Bundle app source
COPY . .
RUN cd runtime && \
    bash compile_linux.sh;

EXPOSE 3000
CMD [ "npm", "start" ]
