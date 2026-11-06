FROM node:24-bookworm-slim AS base
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Dev target: runs the Vite dev server with HMR. Source is bind-mounted
# in docker-compose.dev.yml instead of copied, so edits on the host are
# picked up live.
FROM base AS dev
EXPOSE 9000
CMD ["yarn", "dev", "--host"]

FROM base AS build
COPY . .
RUN yarn build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
