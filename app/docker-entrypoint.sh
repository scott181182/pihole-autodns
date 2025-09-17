#!/bin/bash
set -e

function _check_unix_socket() {
	# Warn if the DOCKER_HOST socket does not exist
	if [[ ${DOCKER_HOST} == unix://* ]]; then
		local SOCKET_FILE="${DOCKER_HOST#unix://}"

		if [[ ! -S ${SOCKET_FILE} ]]; then
			cat >&2 <<-EOT
				ERROR: you need to share your Docker host socket with a volume at ${SOCKET_FILE}
				Typically you should run this image with: \`-v /var/run/docker.sock:${SOCKET_FILE}:ro\`
			EOT

			exit 1
		fi
	fi
}

# Run the init logic if the default CMD was provided
if [[ $* == 'forego start' ]]; then
	_check_unix_socket
fi

exec "$@"
