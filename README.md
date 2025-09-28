# Docker PiHole AutoDNS

This package automatically registers and de-registers domain names with a PiHole instance's Local DNS Records setting based on the presence of services running in Docker.

## Domain Name Sources

Domain names are dynamically loaded from files in a configured directory. The files are watched for updates, then parsed for domain names _depending on their file name_. We currently support the following domain name sources:

-   Plaintext list of domain names (files with `.domains.` in their name)
    -   This can be used to put a whitelist of domain names that should have records, but wouldn't be detected in Traefik router rules.
-   Plaintext list of [Traefik router rules](https://doc.traefik.io/traefik/reference/routing-configuration/http/router/rules-and-priority/) (files with `.traefik.` in their name)
    -   Looks for `` Host(`<domain name>`) `` in rules to parse out the domain name.
    -   This file is generated automatically using [docker-gen](https://github.com/nginx-proxy/docker-gen) (see [templates/traefik_rules.tpl.txt](./templates/traefik_rules.tpl.txt)).

## Configuration

Configuration can be provided through a file and/or environment variables. Anything not in the configuration file will be looked up in environment variables. The path to the configuration file can be specified using the `$CONFIG_PATH` environment variable. This file can be either JSON or YAML. You can currently specify the following structure:

```yaml
pihole:
    # The API endpoint of the PiHole instance (e.g. "http://pihole/api").
    # Falls back to $PIHOLE_API_URL
    apiUrl: <string>
# The Host IP of the PiHole machine to resolve DNS A Records to.
# Falls back to $HOST_IP
hostIp: <string>
# The directory with files to dynamically load domains from (e.g. "/app/data").
# Falls back to $DATA_DIRECTORY
directory: <string>
```

The following variables can _only_ be specified via environment variables:

-   `$PIHOLE_PASSWORD`
    -   An app password for the PiHole instance, so we can update settings via the API
-   `$DATA_DIRECTORY`
    -   Path to the directory to find all files
    -   Defaults to `/app/data`
-   `$DOCKER_HOST`
    -   Path to the Docker socket (which should be mounted in the container)
    -   Defaults to `unix:///tmp/docker.sock`

# Development

This project uses [Bun](https://bun.sh/) for the custom script.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```
