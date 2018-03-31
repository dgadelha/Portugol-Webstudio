FROM node:6-stretch

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apt-get -qq update && \
    apt-get -qq install build-essential software-properties-common dirmngr curl libunwind8 gettext apt-transport-https -y;

# Install repos
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg && \
    mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg && \
    sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-debian-stretch-prod stretch main" > /etc/apt/sources.list.d/dotnetdev.list' && \
    add-apt-repository "deb http://ppa.launchpad.net/webupd8team/java/ubuntu yakkety main" -y && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys C2518248EEA14886 && \
    apt-get -qq update && \
    echo "oracle-java8-installer shared/accepted-oracle-license-v1-1 select true" | debconf-set-selections;


# Install Java-8 and NetCore
RUN apt-get -qq install dotnet-sdk-2.1.101 oracle-java8-installer ant ca-certificates-java  -y;

# Fix certificate issues
RUN apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .
RUN cd libs/portugol-runtime && \
    dotnet restore && \
    dotnet publish -r debian.8-x64 && \
    rm -rf ./bin/Debug/netcoreapp2.0/debian.8-x64/publish && \
    rm -rf ./dist/ && \
    mkdir dist && \
    mv ./bin/Debug/netcoreapp2.0/debian.8-x64/ ./dist/debian.8-x64/;
EXPOSE 3000
CMD [ "npm", "start" ]