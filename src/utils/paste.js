const got = require("@esm2cjs/got").default;
const { inspect } = require("util");

module.exports = async (body, raw) => {
    const instance = 'paste.ivr.fi';
    
    let stringBody;
    
    if (typeof body === 'string') {
        stringBody = body;
    } else if (typeof body === 'object' && body !== null) {
        try {
            stringBody = JSON.stringify(body, null, 2);
        } catch (error) {
            stringBody = inspect(body, {
                showHidden: false,
                depth: 5,
                maxArrayLength: 1000,
                maxStringLength: 10000,
                breakLength: 80,
                compact: false
            });
        }
    } else {
        stringBody = String(body);
    }

    const paste = await got.post(`https://${instance}/documents`, { body: stringBody }).json();
    if (raw) return `https://${instance}/raw/${paste.key}`;
    else return `https://${instance}/${paste.key}`;
};
