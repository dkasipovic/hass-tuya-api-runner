ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache nodejs npm

COPY package.json /
COPY index.js /
RUN npm install

COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]