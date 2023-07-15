FROM node:18.13.0-alpine3.17 As dev-eventstore
WORKDIR /usr/src/app
COPY ./package.json .
COPY ./.npmrc .
RUN npm install
COPY ./nest-cli.json .
COPY ./tsconfig*.json ./
COPY ./src .
RUN npm run build

FROM node:18.13.0-alpine3.17 AS prod-eventstore
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY ./.npmrc .
COPY --from=dev-contacts /usr/src/app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=dev-contacts /usr/src/app/dist ./dist/
CMD ["node", "dist/main"]
