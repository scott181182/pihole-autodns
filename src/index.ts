import { watch } from "node:fs/promises";
import path from "node:path";

import { type Config, loadConfig } from "./config";
import { type ILogger, Logger } from "./logger";
import { parseDomainsFromDirectory } from "./parse";
import { PiHoleClient } from "./pihole";
import { diffArrays } from "./utils";

/**
 * Reads what domains should be present in DNS records from files in a configured directory,
 * then reconciles this list of domains with the hosts registered with PiHole.
 */
async function reconcileDomainNames(client: PiHoleClient, config: Config, logger: ILogger) {
    const domains = await parseDomainsFromDirectory(config.directory, logger);
    await client.authenticate();

    /** All DNS rules currently on the PiHole instance. */
    const allCurrentHosts = await client.getDnsHosts();
    /** DNS rules for the given host IP address on the PiHole instance. */
    const currentHosts = allCurrentHosts.filter((d) => d.ip === config.hostIp);

    const diff = diffArrays(
        currentHosts.map((h) => h.domain),
        domains,
    );

    if (diff.add.size === 0 && diff.remove.size === 0) {
        logger.info("No DNS changes to be made");
        return;
    }

    logger.info("Found diff:", { add: [...diff.add], remove: [...diff.remove] });

    logger.info("Sending Updates to PiHole API...");
    for (const toAdd of diff.add) {
        await client.addDnsHost(toAdd, config.hostIp);
    }
    for (const toRemove of diff.remove) {
        await client.removeDnsHost(toRemove, config.hostIp);
    }
    logger.info("Done!");
}

const logger = new Logger();
async function main() {
    const config = await loadConfig();
    const client = new PiHoleClient(config.pihole.apiUrl, config.pihole.password);

    logger.info("Reconciling domain names with initial directory contents...");
    await reconcileDomainNames(client, config, logger);

    const watcher = watch(config.directory, { encoding: "utf8" });
    for await (const event of watcher) {
        logger.info(
            `Detected change at '${path.join(config.directory, event.filename ?? "")}', reconciling domain names...`,
        );
        await reconcileDomainNames(client, config, logger).catch((err) => {
            if (err instanceof Error) {
                logger.error(err.message);
            } else {
                logger.error("An unknown error occurred updating domain names", { error: err });
            }
        });
    }
}
await main().catch((err) => {
    if (err instanceof Error) {
        logger.error(err.message);
    } else {
        logger.error("An unknown error occurred", { error: err });
    }
});
