FROM node:lts-bullseye
ARG DATABASE_URL
ENV NODE_ENV=production

RUN apt-get update
RUN apt-get install -y vim netcat-openbsd

WORKDIR /usr/src/app
COPY . .
EXPOSE 3000

RUN chmod +x /usr/src/app/docker-startup.sh && chown -R node /usr/src/app
USER node
RUN npm install --production
RUN npx prisma generate
RUN DATABASE_URL=$DATABASE_URL npm run build
CMD ["npm", "start"]
