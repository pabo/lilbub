FROM node:18
WORKDIR /usr/src/app
COPY package*.json votesRequired.txt ./
COPY src ./src/
RUN ls -la
RUN ls -la src
RUN npm install
EXPOSE 8124
CMD [ "node", "src/app.js" ]