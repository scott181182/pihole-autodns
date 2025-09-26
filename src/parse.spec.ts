import { describe, it, expect } from "bun:test"
import { parseDomains, parseTraefikDomains } from "./parse";



describe("parseTraefikDomains", () => {
    const TRAEFIK_RULE_CONTENT = `
        Host(\`traefik.home\`)&&PathPrefix(\`/api\`)
        Host(\`traefik.home\`)
        Host(\`grist.home\`)
        Host(\`pihole.home\`)
    `;

    it("should parse traefik router rules", async () => {
        const blob = new Blob([TRAEFIK_RULE_CONTENT])
        const res = await parseTraefikDomains(blob);

        expect(res).toEqual([
            "traefik.home",
            "grist.home",
            "pihole.home",
        ]);
    });
});

describe("parseDomains", () => {
    const WHITELIST_CONTENT = `
        something.random.home

        pihole.home
        example.local
    `;

    it("should parse domains", async () => {
        const blob = new Blob([WHITELIST_CONTENT])
        const res = await parseDomains(blob);

        expect(res).toEqual([
            "something.random.home",
            "pihole.home",
            "example.local",
        ]);
    });
});
