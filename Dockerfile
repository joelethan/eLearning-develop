FROM node:10.18.1-alpine3.10

RUN mkdir app
WORKDIR app
COPY . .
RUN npm install
EXPOSE 5001
CMD [ "/bin/sh", "-c", "npm run-script dev" ]