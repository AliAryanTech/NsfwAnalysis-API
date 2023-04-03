FROM node:lts-buster

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y ffmpeg wget libc6-dev
COPY package.json .
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn", "start"]
