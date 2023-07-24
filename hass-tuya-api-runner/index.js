const crypto = require('crypto');
const axios = require('axios');
const qs = require('qs');

const TUYA_CLIENT_ID = process.env.TUYA_CLIENT_ID || '';
const TUYA_CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET || '';
const TUYA_API_PATH = process.env.TUYA_API_PATH || 'https://openapi.tuyaeu.com';

let TOKEN = '';
let REFRESH_TOKEN = '';

const config = {
    /* openapi host */
    host: TUYA_API_PATH,
    /* fetch from openapi platform */
    accessKey: TUYA_CLIENT_ID,
    /* fetch from openapi platform */
    secretKey: TUYA_CLIENT_SECRET
};

async function encryptStr(str, secret) {
    return crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex').toUpperCase();
}

async function getToken(cb) {
    const method = 'GET';
    const timestamp = Date.now().toString();
    const signUrl = '/v1.0/token?grant_type=1';
    const contentHash = crypto.createHash('sha256').update('').digest('hex');
    const stringToSign = [method, contentHash, '', signUrl].join('\n');
    const signStr = config.accessKey + timestamp + stringToSign;

    const headers = {
        t: timestamp,
        sign_method: 'HMAC-SHA256',
        client_id: TUYA_CLIENT_ID,
        sign: await encryptStr(signStr, config.secretKey),
    };
    const { data: login } = await axios.get(`${config.host}/v1.0/token?grant_type=1`, { headers });
    if (!login || !login.success) {
        throw Error(`fetch failed: ${login.msg}`);
    }
    TOKEN = login.result.access_token;
    REFRESH_TOKEN = login.result.refresh_token;
    console.log('Got token', TOKEN);

    if (cb) cb();
}

async function CallAPI(url) {
    const query = {};
    const method = 'POST';
    const reqHeaders = await getRequestSign(url, method, {}, query, {});
    console.log(`Calling ${config.host}${url}`)
    const data = await axios.post(`${config.host}${url}`, query, {
        headers: reqHeaders
    }).catch((e) => {
        console.log('AXIOS ERROR', e);
    })
    if (!data || !data.data || !data.data.success) {
        throw Error(`request api failed: ${data.msg}`);
    }

    console.log(data.data);
}

async function getRequestSign(path, method, headers, query, body) {
    const t = Date.now().toString();
    const [uri, pathQuery] = path.split('?');
    const queryMerged = Object.assign(query, qs.parse(pathQuery));
    const sortedQuery = {};
    Object.keys(queryMerged)
        .sort()
        .forEach((i) => (sortedQuery[i] = query[i]));

    const querystring = decodeURIComponent(qs.stringify(sortedQuery));
    const url = querystring ? `${uri}?${querystring}` : uri;
    const contentHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
    const stringToSign = [method, contentHash, '', url].join('\n');
    const signStr = config.accessKey + TOKEN + t + stringToSign;
    return {
        t,
        path: url,
        client_id: config.accessKey,
        sign: await encryptStr(signStr, config.secretKey),
        sign_method: 'HMAC-SHA256',
        access_token: TOKEN,
    };
}

if (process.argv && process.argv[2] && process.argv[2].length) {
    getToken(function () {
        console.log('Calling', process.argv[2]);
        CallAPI(process.argv[2]);
    });
}