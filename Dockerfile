FROM node:lts-bullseye
ARG DATABASE_URL
ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        vim \
        netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY . .
EXPOSE 3000

RUN chmod +x /usr/src/app/docker-startup.sh && chown -R node /usr/src/app
USER node
RUN npm install --production
RUN npx prisma generate
RUN DATABASE_URL=$DATABASE_URL npm run build
CMD ["npm", "start"]
