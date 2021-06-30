FROM node:14-alpine3.13 as app

RUN mkdir /build
COPY ${CI_PROJECT_NAME}.tar.gz /build/
WORKDIR /build
RUN tar xvzf ${CI_PROJECT_NAME}.tar.gz
RUN rm src/assets/config.json
RUN npm install
RUN npm run build
WORKDIR dist

FROM nginx:1.21.0-alpine
COPY --from=app /build/dist/digitwin-app/ /usr/share/nginx/html/
COPY nginx/nginx.conf /etc/nginx/nginx.conf
RUN ln -s /usr/share/nginx/html/assets/config/config.json /usr/share/nginx/html/assets/config.json
EXPOSE 80/tcp
