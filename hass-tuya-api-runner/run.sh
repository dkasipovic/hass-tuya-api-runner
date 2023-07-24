#!/usr/bin/with-contenv bashio
set +u

export TUYA_CLIENT_ID=$(bashio::config 'tuya_client_id')
export TUYA_CLIENT_SECRET=$(bashio::config 'tuya_client_secret')
export TUYA_API_PATH=$(bashio::config 'tuya_api_path')
bashio::log.info "Tuya Client ID: ${TUYA_CLIENT_ID}"
bashio::log.info "Tuya Client Secret: ${TUYA_CLIENT_SECRET}"
bashio::log.info "Tuya API Path: ${TUYA_API_PATH}"

bashio::log.info "Starting Tuya API Runner..."

while read -r input; do
    echo "Got: ${input}"
    result = $(node ./index.js "${input}")
done