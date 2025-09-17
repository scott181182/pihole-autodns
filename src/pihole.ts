import * as z from "zod/mini";



const apiErrorSchema = z.object({
    key: z.string(),
    message: z.string(),
    hint: z.optional(z.nullable(z.string())),
});
const apiErrorResponseSchema = z.object({
    error: apiErrorSchema
});

const authResponseSchema = z.object({
    session: z.object({
        valid: z.boolean(),
        sid: z.nullable(z.string()),
        validity: z.int(),
        message: z.string()
    })
});

const dnsHostSchema = z.codec(
    z.string().check(z.regex(/([\d.]+) ([^\s])/)),
    z.object({ ip: z.ipv4(), domain: z.string() }),
    {
        decode: (host) => {
            const [ip, domain] = host.split(" ");
            return { ip: ip!, domain: domain! };
        },
        encode: ({ ip, domain }) => `${ip} ${domain}`
    }
)
const dnsHostsResponseSchema = z.object({
    config: z.object({
        dns: z.object({
            hosts: z.array(dnsHostSchema)
        })
    })
});



export class PiHoleError extends Error {
    public constructor(
        message?: string,
        public readonly response?: z.infer<typeof apiErrorSchema>,
    ) {
        super(message ?? "Error response from PiHole API");
    }
}

interface ApiRequestInit extends RequestInit {
    /** Send a request with Content-Type: application/json */
    json?: unknown;
    /** Specify whether to skip sending the current session ID. */
    noSid?: boolean;
}

/**
 * Client for interfacing with the PiHole API.
 *
 * @see https://docs.pi-hole.net/api/ for more information.
 */
export class PiHoleClient {
    /**
     * Session ID sent with each request.
     * Call {@link authenticate} to fetch a new one.
     */
    private sid: string | undefined;

    /**
     * @param apiBase The base URL of the API (e.g. http://localhost/api)
     * @param password App Password for the PiHole instance.
     */
    public constructor(
        public readonly apiBase: string,
        private readonly password: string
    ) {  }

    private async makeApiRequest(path: string, init?: ApiRequestInit) {
        if(init?.json) {
            init.body = JSON.stringify(init.json);
            init.headers = {
                ...init.headers,
                "content-type": "application/json",
            }
        }
        if(!init?.noSid) {
            if(!this.sid) {
                throw new Error(`Not authenticated. Cannot send request to '${path}' endpoint`);
            }
            // TODO: be smarter about adding query params.
            path += `?sid=${this.sid}`
        }
        const res = await fetch(`${this.apiBase}${path}`, init);

        if(!res.ok) {
            try {
                const resBody = await res.json();
                const err = apiErrorResponseSchema.parse(resBody);
                throw new PiHoleError(undefined, err.error);
            } catch(err) {
                throw new PiHoleError(`Error response from PiHole API (${res.status}) and could not parse response body`)
            }
        }

        return res.json();
    }

    /**
     * Authenticates with the PiHole API, using the app password to get a new session ID.
     */
    public async authenticate() {
        const res = await this.makeApiRequest("/auth", {
            method: "POST",
            json: { password: this.password },
            noSid: true,
        });

        const resData = authResponseSchema.parse(res);
        if(!resData.session.sid) {
            throw new Error("Failed to get `sid` from auth response");
        }

        this.sid = resData.session.sid;
    }

    ////////////////////
    //   Config API   //
    ////////////////////

    public async getDnsHosts(): Promise<z.infer<typeof dnsHostSchema>[]> {
        const res = await this.makeApiRequest("/config/dns/hosts");
        const resData = dnsHostsResponseSchema.parse(res);
        return resData.config.dns.hosts;
    }

    private async modifyConfigValue(method: "PUT" | "DELETE", element: string, value: string) {
        const path = `/config/${element}/${encodeURIComponent(value)}`;
        return this.makeApiRequest(path, { method });
    }

    public async addDnsHost(domain: string, ip: string) {
        await this.modifyConfigValue("PUT", "dns/hosts", z.encode(dnsHostSchema, { ip, domain }));
    }
    public async removeDnsHost(domain: string, ip: string) {
        await this.modifyConfigValue("DELETE", "dns/hosts", z.encode(dnsHostSchema, { ip, domain }));
    }
}
