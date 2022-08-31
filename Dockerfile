FROM node:18
WORKDIR /usr/src/app

# *only* add package files before npm install so that this layer can be cached
COPY package*.json ./
RUN npm install

# now its safe to add application code
COPY votesRequired.txt ./
COPY src ./src/

# debugging
# RUN ls -la src

EXPOSE 8124
CMD [ "node", "src/app.js" ]