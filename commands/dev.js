const simpleGit = require("simple-git");
const git = simpleGit();
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "dev",
    cooldown: 0,
    aliases: ["load", "unload", "reload", "pull", "status", "push", "restart", "rejoin", "nojoin"],
    description: "Load, Unload, Reload commands and restart the bot from the chat, dev level required",
    level: 4,
    levelError: null,
    execute: async (msg, client, config, utils) => {
        const Command = require("../src/commands.js");
        try {
            const subCommand = msg.command?.toLowerCase();
            const commandName = msg.args[0]?.toLowerCase();

            if (!commandName && ["load", "unload", "reload"].includes(subCommand)) {
                return {
                    text: `/me FeelsDankMan Provide a command name to ${subCommand}.`,
                    reply: true,
                };
            }

            switch (subCommand) {
                case "load": {
                    try {
                        const newCommand = findCommand(commandName);
                        Command.add(newCommand);
                        return {
                            text: `/me Loaded "${newCommand.name}" successfully.`,
                            reply: true,
                        };
                    } catch (e) {
                        if (e.code === "MODULE_NOT_FOUND") {
                            return {
                                text: `/me FeelsDankMan No command named "${commandName}" found.`,
                                reply: true,
                            };
                        } else {
                            logger.error(e);
                            return {
                                text: `/me monkaS Error loading command "${commandName}": ${e}`,
                                reply: true,
                            };
                        }
                    }
                }
                case "unload": {
                    try {
                        const existingCommand = findCommand(commandName);
                        if (!existingCommand)
                            return {
                                text: `/me FeelsDankMan No command named "${commandName}" found.`,
                                reply: true,
                            };

                        Command.delete(existingCommand);
                        return {
                            text: `/me Unloaded "${existingCommand.name}" successfully.`,
                            reply: true,
                        };
                    } catch (e) {
                        logger.error(e);
                        return {
                            text: `/me monkaS Error reloading command "${commandName}": ${e.message}`,
                            reply: true,
                        };
                    }
                }
                case "reload": {
                    const existingCommand = findCommand(commandName);
                    if (!existingCommand)
                        return {
                            text: `/me FeelsDankMan No command named "${commandName}" found.`,
                            reply: true,
                        };

                    try {
                        delete require.cache[require.resolve(`./${existingCommand.name}.js`)];
                        Command.delete(existingCommand);
                        const newCommand = require(`./${existingCommand.name}.js`);
                        Command.add(newCommand);

                        return {
                            text: `/me Reloaded "${existingCommand.name}" successfully.`,
                            reply: true,
                        };
                    } catch (e) {
                        logger.error(e);
                        return {
                            text: `/me monkaS Error reloading command "${commandName}": ${e.message}`,
                            reply: true,
                        };
                    }
                }
                case "pull": {
                    await client.me(msg.channel.login, `Fetching changes...`);
                    const statusSummary = await git.pull();
                    if (statusSummary.files.length === 0) {
                        return {
                            text: "/me FeelsDankMan No changes to commit.",
                            reply: true,
                        };
                    } else {
                        return {
                            text: `/me ✅ ${statusSummary.files.length} file(s) changed, (+${statusSummary.summary.insertions}, -${statusSummary.summary.deletions})`,
                            reply: true,
                        };
                    }
                }
                case "status": {
                    const [statusSummary, branch, commitHash] = await Promise.all([
                        git.status(),
                        git.revparse(["--abbrev-ref", "HEAD"]),
                        git.revparse(["--short", "HEAD"]),
                    ]);

                    const response = [
                        ["Untracked", statusSummary.not_added],
                        ["Conflicted", statusSummary.conflicted],
                        ["Created", statusSummary.created],
                        ["Modified", statusSummary.modified],
                        ["Deleted", statusSummary.deleted],
                        ["Renamed", statusSummary.renamed],
                        ["Staged", statusSummary.staged],
                    ]
                        .filter(([, arr]) => arr?.length)
                        .map(([label, arr]) => `${label}: ${arr.length}`);

                    if (msg.flags?.log) {
                        logger.log(`Git status: ${branch}@${commitHash}`, {
                            not_added: statusSummary.not_added,
                            conflicted: statusSummary.conflicted,
                            created: statusSummary.created,
                            modified: statusSummary.modified,
                            deleted: statusSummary.deleted,
                            renamed: statusSummary.renamed,
                            staged: statusSummary.staged,
                        });
                    }

                    return {
                        text: `/me Git status: ${branch}@${commitHash} • ${response.length === 0 ? "Up to date peepoHappy" : response.join(" • ")}`,
                        reply: true,
                    };
                }
                case "push": {
                    const statusSummary = await git.status();
                    if (statusSummary.isClean()) {
                        return {
                            text: "/me FeelsDankMan No changes to commit.",
                            reply: true,
                        };
                    }

                    const diffSummary = await git.diffSummary();

                    await client.me(
                        msg.channel.login,
                        `${statusSummary.files.length} file(s) changed, (+${diffSummary.deletions}, -${diffSummary.insertions}) Pushing changes...`
                    );

                    await git.add(".");
                    const commitMessage = "...";
                    await git.commit(commitMessage);
                    await git.push();

                    return {
                        text: "/me ✅ Changes have been pushed to GitHub.",
                        reply: true,
                    };
                }
                case "restart": {
                    return restartBot(msg, client, config, utils);
                }
                case "rejoin": {
                    return rejoinChannels(msg, client, config, utils);
                }
                case "nojoin": {
                    return nojoinChannels(msg, client, config, utils);
                }
                default: {
                    return {
                        text: "/me FeelsDankMan Invalid subcommand. Available subcommands: <load | unload | reload | restart | nojoin>.",
                        reply: true,
                    };
                }
            }
        } catch (e) {
            logger.error(e);
            return {
                text: "/me monkaS An error occurred, will be checked later.",
                reply: true,
            };
        }
    },
};

async function restartBot(msg, client, config, utils) {
    try {
        await client.me(msg.channel.login, `ppCircle Restarting...`);
        eval(process.exit());
    } catch (e) {
        logger.error(e);
        return {
            text: "/me monkaS An error occurred, will be checked later.",
            reply: true,
        };
    }
}

function getSymmetricDifference(iter1, iter2) {
    const arr1 = Array.isArray(iter1) ? iter1 : [...iter1];
    const arr2 = Array.isArray(iter2) ? iter2 : [...iter2];
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    return [...arr1.filter((x) => !set2.has(x)), ...arr2.filter((x) => !set1.has(x))];
}

async function rejoinChannels(msg, client, config, utils) {
    try {
        const channels = await db.query("SELECT login FROM channels WHERE active = 1").map((e) => e.login);
        const toRejoin = getSymmetricDifference(anonClient.joinedChannels, channels);

        if (!toRejoin.length) {
            return { text: "/me idiot", reply: true };
        }

        await Promise.allSettled(toRejoin.map((ch) => anonClient.part(ch.toLowerCase())));

        const results = await Promise.allSettled(toRejoin.map((ch, i) => utils.sleep(i * 500).then(() => anonClient.join(ch.toLowerCase()))));
        const succeeded = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.map((r, i) => ({ result: r, channel: toRejoin[i] })).filter(({ result }) => result.status === "rejected");

        if (failed.length > 0) {
            logger.warn(
                `Failed to rejoin ${failed.length} channels:`,
                failed.map(({ channel, result }) => `${channel}: ${result.reason}`)
            );
        }

        return {
            text: `/me rejoined ${succeeded}/${toRejoin.length} channels${
                failed.length ? ` Failed: ${failed.map((f) => f.channel).join(", ")}` : ""
            }.`,
            reply: true,
        };
    } catch (e) {
        logger.error(e);
        return {
            text: "/me monkaS An error occurred, will be checked later.",
            reply: true,
        };
    }
}

async function nojoinChannels(msg, client, config, utils) {
    try {
        const channels = await db.query("SELECT login FROM channels WHERE active = 1").map((e) => e.login);
        const notJoined = getSymmetricDifference(anonClient.joinedChannels, channels);

        if (!notJoined.length) {
            return { text: "/me ✅ Joined all channels", reply: true };
        }

        const antiPingChannels = await Promise.all(notJoined.map((ch) => utils.utils.antiPing(ch)));

        return {
            text: `/me Not joined channels: ${antiPingChannels.join(", ")}`,
            reply: true,
        };
    } catch (e) {
        logger.error(e);
        return {
            text: "/me monkaS An error occurred, will be checked later.",
            reply: true,
        };
    }
}

function findCommand(cmd) {
    const commandFiles = fs.readdirSync(path.join(__dirname, "../commands")).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const commandPath = path.join(__dirname, "../commands", file);
        const command = require(commandPath);

        if (command.name === cmd || (command.aliases && command.aliases.includes(cmd))) {
            return command;
        }
    }
    return null;
}
