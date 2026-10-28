import { describe, expect, test } from "bun:test";
import worker from "./index";

const ctx = { waitUntil() {} } as ExecutionContext;
function environment(overrides: Partial<Env> = {}, status = 200) {
	return {
		ASSETS: { fetch: async () => new Response("static asset", { status }) },
		...overrides,
	} as Env;
}

describe("SEO routing", () => {
	test("canonical host redirect keeps path and query", async () => {
		const response = await worker.fetch(new Request("https://www.taf.sh/work/?source=link"), environment(), ctx);
		expect(response.status).toBe(301);
		expect(response.headers.get("Location")).toBe("https://taf.sh/work/?source=link");
	});
	for (const path of ["/products/cliniq", "/products/cliniq/"]) test(`permanent renamed product redirect: ${path}`, async () => {
		const response = await worker.fetch(new Request(`https://taf.sh${path}?source=old`), environment(), ctx);
		expect(response.status).toBe(301);
		expect(response.headers.get("Location")).toBe("https://taf.sh/products/rah-clinic/?source=old");
	});
	test("main site remains indexable", async () => {
		const response = await worker.fetch(new Request("https://taf.sh/work/"), environment(), ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("X-Robots-Tag")).toBeNull();
		expect(response.headers.get("Permissions-Policy")).toBe("tools=self");
	});
	test("version previews remain reviewable and noindexed", async () => {
		const response = await worker.fetch(new Request("https://abc123-taf-sh.example.workers.dev/work/"), environment(), ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
	});
	for (const path of ["/proposals", "/proposals/", "/proposals/Tamjeed_Khan_Proposal_Comparison.xlsx"]) test(`client deliverable stays noindexed: ${path}`, async () => {
		const response = await worker.fetch(new Request(`https://taf.sh${path}`), environment(), ctx);
		expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
	});
	test("missing pages keep 404 status and noindex", async () => {
		const response = await worker.fetch(new Request("https://taf.sh/missing/"), environment({}, 404), ctx);
		expect(response.status).toBe(404);
		expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
	});
});
