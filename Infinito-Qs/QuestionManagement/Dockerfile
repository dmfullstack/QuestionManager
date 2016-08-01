FROM mhart/alpine-node:6.3.0

RUN mkdir -p /opt/service
WORKDIR /opt/service

RUN apk --update add python build-base

COPY package.json .
RUN npm install --production

COPY QuestionAnalyzer ./QuestionAnalyzer
COPY bin ./bin
COPY models ./models
COPY passport ./passport
COPY public ./public
COPY routes ./routes
COPY test ./test
COPY views ./views
COPY app.js .
COPY test.js .
COPY testData .

CMD ["npm", "start", "--production"]
