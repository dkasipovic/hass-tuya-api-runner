ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache \
    nodejs \
    npm \
    git

COPY package.json /
COPY index.js /
RUN cd / && npm install --unsafe-perm 2>&1

COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]