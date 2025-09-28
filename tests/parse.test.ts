import { describe, expect, it } from "bun:test";
import path from "node:path";

import { parseDomainsFromDirectory } from "../src/parse";
import { TestLogger } from "./logger";

describe("parseDomainsFromDirectory", () => {
    const TEST_LOGGER = new TestLogger();

    it("should parse traefik rules from a directory", async () => {
        const expected = new Set(["traefik.home", "grist.home", "pihole.home"]);
        const res = await parseDomainsFromDirectory(path.join("tests/data/test1"), TEST_LOGGER);

        expect(res).toEqual(expected);
    });

    it("should parse both domains and traefik rules from a directory", async () => {
        const expected = new Set([
            "something.random.home",
            "pihole.home",
            "example.local",
            "traefik.home",
            "grist.home",
        ]);
        const res = await parseDomainsFromDirectory(path.join("tests/data/test2"), TEST_LOGGER);

        expect(res).toEqual(expected);
    });
});
