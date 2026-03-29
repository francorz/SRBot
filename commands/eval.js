const got = require("@esm2cjs/got").default;
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const crypto = require("crypto");
const { inspect } = require("util");
const { subscriptions } = require("../classes/eventsub.js");

module.exports = {
    name: "eval",
    cooldown: 5000,
    aliases: ["eval", "js"],
    description: `Executes javascript codes from the chat, dev level required`,
    level: 4,
    levelError: null,
    execute: async (msg, client, utils) => {
        try {
            let code = msg.args.join(" ").replace(/„|“/gm, '"');

            code = await evalCode(msg, client, utils, code);

            return {
                text: ["haste"].includes(msg.command) ? await utils.paste(code) : `/me ${code}`,
                reply: true,
            };
        } catch (e) {
            logger.error(e);

            const positionMatch = e.stack.match(/<anonymous>:(\d+):(\d+)/);
            const position = positionMatch ? ` [${positionMatch[1]}:${positionMatch[2]}]` : "";

            return {
                text: `/me monkaS 🚫 ${e.constructor?.name}: ${e.message}.${position}`,
                reply: true,
            };
        }
    },
};

function stringify(obj) {
    if (typeof obj === "string") {
        return obj;
    }
    if (obj instanceof Error) {
        return obj.stack.toString();
    }
    return inspect(obj, {
        showHidden: true,
        depth: null,
        maxArrayLength: null,
        maxStringLength: null,
    });
}

async function evalCode(msg, client, utils, code) {
    if (msg.args[0].startsWith("http")) {
        const res = await fetch(msg.args[0])
            .then((r) => r.text())
            .then((r) => r.replace(/„|“/gm, '"'));
        code = code.replace(msg.args[0], res);
    }

    if (/return|await/.test(code)) {
        code = `(async () => { ${code} } )()`;
    }

    code = await Promise.resolve(eval(code)).then((data) => stringify(data));
    return code;
}
