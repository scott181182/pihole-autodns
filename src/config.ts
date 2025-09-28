import path from "node:path";
import type { BunFile } from "bun";

import * as z from "zod/mini";

import { loadEnvVar, MissingEnvironmentVariableError } from "./env";

const configFileSchema = z.partial(
    z.object({
        pihole: z.object({
            apiUrl: z.optional(z.url()),
        }),
        hostIp: z.ipv4(),
    }),
);

export interface Config {
    pihole: {
        apiUrl: string;
        password: string;
    };
    hostIp: string;
    directory: string;
}

async function parseConfigFile(file: BunFile): Promise<unknown> {
    if (!file.name) {
        throw new Error("Could not determine file extension for parsing");
    }
    const configExt = path.extname(file.name);
    switch (configExt.toLowerCase()) {
        case ".json":
            return file.json();
        case ".yaml":
        case ".yml":
            return Bun.YAML.parse(await file.text());
        default:
            throw new Error(`Unsupported config file extension/format: '${configExt}'`);
    }
}
async function loadConfigFile(file: BunFile): Promise<z.infer<typeof configFileSchema>> {
    const configData = await parseConfigFile(file);
    return configFileSchema.parse(configData);
}

export async function loadConfig(): Promise<Config> {
    const configPath = Bun.env.CONFIG_PATH ?? "config.yaml";
    const configFile = Bun.file(configPath);
    const configFileExists = await configFile.exists();

    const baseConfig = configFileExists ? await loadConfigFile(configFile) : {};

    try {
        return {
            pihole: {
                apiUrl: baseConfig.pihole?.apiUrl ?? loadEnvVar("PIHOLE_API_URL"),
                password: loadEnvVar("PIHOLE_PASSWORD"),
            },
            hostIp: baseConfig.hostIp ?? loadEnvVar("HOST_IP"),
            directory: loadEnvVar("DATA_DIRECTORY"),
        };
    } catch (err) {
        if (err instanceof MissingEnvironmentVariableError) {
            if (!["PIHOLE_PASSWORD", "DATA_DIRECTORY"].includes(err.key)) {
                throw new Error(
                    `Tried to load '${err.key}' for configuration, but couldn't find it in '${configPath}' or the environment`,
                    { cause: err },
                );
            }
        }
        throw err;
    }
}
