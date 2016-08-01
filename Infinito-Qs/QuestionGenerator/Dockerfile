FROM mhart/alpine-node:6.3.0

RUN mkdir -p /opt/service
WORKDIR /opt/service

RUN apk --update add python build-base

COPY package.json .
RUN npm install --production

COPY bin ./bin
COPY bower_components ./bower_components
COPY models ./models
COPY public ./public
COPY routes ./routes
COPY schema ./schema
COPY views ./views
COPY app.js .
COPY tempFileToStoreIntermediary.json .
COPY tempFileToStoreQues.json .

CMD ["npm", "start", "--production"]
