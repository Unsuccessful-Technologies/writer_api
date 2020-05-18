FROM node:erbium
ARG NPM_TOKEN
WORKDIR /app
COPY ./src ./src
COPY ./.npmrc ./
COPY ./gulpfile.js ./
COPY ./tsconfig.json ./
COPY ./package.json ./
RUN npm install
RUN rm -f ./.npmrc
CMD npm start