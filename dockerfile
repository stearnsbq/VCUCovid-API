FROM alpine:3.7


RUN apk update && apk add --update nodejs

VOLUME ./scraper/history /scraper/history

COPY . .


RUN npm install

ENTRYPOINT ["node", "index.js"]

