FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg imagemagick \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY . .

RUN mkdir -p /app/data/uploads/auto/audio /app/data/uploads/auto/visual \
  && chown -R node:node /app /app/data

ENV NODE_ENV=production \
    ROOT_DIR=/app/data

USER node

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||8000,path:'/api/get-video-list'},r=>process.exit(r.statusCode?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "index.js"]
