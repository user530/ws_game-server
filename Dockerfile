# BUILD STAGE
FROM node:current-alpine3.19 AS build

WORKDIR /app/build

COPY --chown=node:node package*.json .

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

# After the buil we re-install, optimising for development
RUN npm ci --only=production && npm cache clean --force

USER node

# PRODUCTION STAGE
FROM node:current-alpine3.19 as prod

WORKDIR /ws_game_server

COPY --from=build --chown=node:node /app/build/dist ./dist
COPY --from=build --chown=node:node /app/build/node_modules ./node_modules

EXPOSE 5000

CMD ["node", "dist/src/main.js"]
