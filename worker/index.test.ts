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
	test("conventional sitemap path redirects to the generated index", async () => {
		const response = await worker.fetch(new Request("https://taf.sh/sitemap.xml"), environment(), ctx);
		expect(response.status).toBe(301);
		expect(response.headers.get("Location")).toBe("https://taf.sh/sitemap-index.xml");
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

describe("video streaming", () => {
	const bytes = Uint8Array.from({ length: 20 }, (_, index) => index);
	function fullVideo(method = "GET") {
		return environment({ ASSETS: { fetch: async () => new Response(method === "HEAD" ? null : bytes, {
			headers: { "Content-Type": "video/mp4", "Content-Length": "20", ETag: '"video-v1"' },
		}) } as Fetcher });
	}
	for (const [range, start, end] of [
		["bytes=0-3", 0, 3], ["bytes=4-10", 4, 10], ["bytes=17-", 17, 19],
		["bytes=0-999", 0, 19], ["bytes=-4", 16, 19], ["bytes=-99", 0, 19],
	] as const) test(`serves ${range} when Assets ignores the range`, async () => {
		const response = await worker.fetch(new Request("https://taf.sh/reel/stats-api-demo.mp4", {
			headers: { Range: range },
		}), fullVideo(), ctx);
		expect(response.status).toBe(206);
		expect(response.headers.get("Content-Range")).toBe(`bytes ${start}-${end}/20`);
		expect(response.headers.get("Accept-Ranges")).toBe("bytes");
		expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([...bytes.slice(start, end + 1)]);
	});
	for (const range of ["bytes=20-", "bytes=-0"]) test(`rejects unsatisfiable ${range}`, async () => {
		const response = await worker.fetch(new Request("https://taf.sh/reel/stats-api-demo.mp4", {
			headers: { Range: range },
		}), fullVideo(), ctx);
		expect(response.status).toBe(416);
		expect(response.headers.get("Content-Range")).toBe("bytes */20");
		expect(await response.text()).toBe("");
	});
	for (const range of ["bytes=", "bytes=8-2", "bytes=0-1,4-5", "items=0-1"]) test(`ignores unsupported ${range}`, async () => {
		const response = await worker.fetch(new Request("https://taf.sh/reel/stats-api-demo.mp4", {
			headers: { Range: range },
		}), fullVideo(), ctx);
		expect(response.status).toBe(200);
		expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([...bytes]);
	});
	for (const [ifRange, status] of [['"video-v1"', 206], ['"old-video"', 200], ['W/"video-v1"', 200]] as const) test(`respects If-Range ${ifRange}`, async () => {
		const response = await worker.fetch(new Request("https://taf.sh/reel/stats-api-demo.mp4", {
			headers: { Range: "bytes=0-3", "If-Range": ifRange },
		}), fullVideo(), ctx);
		expect(response.status).toBe(status);
		expect((await response.arrayBuffer()).byteLength).toBe(status === 206 ? 4 : 20);
	});
	test("HEAD advertises ranges without a response body", async () => {
		const response = await worker.fetch(new Request("https://taf.sh/reel/stats-api-demo.mp4", {
			method: "HEAD", headers: { Range: "bytes=0-3" },
		}), fullVideo("HEAD"), ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("Accept-Ranges")).toBe("bytes");
		expect(response.headers.get("Content-Length")).toBe("20");
		expect(await response.text()).toBe("");
	});
	test("streams across chunks and cancels the asset before reading the rest", async () => {
		let offset = 0;
		let cancelled = false;
		const env = environment({ ASSETS: { fetch: async () => new Response(new ReadableStream({
			pull(controller) {
				controller.enqueue(bytes.slice(offset, offset + 3));
				offset += 3;
				if (offset >= bytes.length) controller.close();
			},
			cancel() { cancelled = true; },
		}), { headers: { "Content-Type": "video/mp4", "Content-Length": "20" } }) } as Fetcher });
		const response = await worker.fetch(new Request("https://taf.sh/reel/stats-api-demo.mp4", {
			headers: { Range: "bytes=4-7" },
		}), env, ctx);
		expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([4, 5, 6, 7]);
		expect(cancelled).toBe(true);
		expect(offset).toBeLessThan(bytes.length);
	});
	test("forwards byte ranges and preserves partial asset responses", async () => {
		let range: string | null = null;
		const env = environment({
			ASSETS: { fetch: async (request: Request) => {
				range = request.headers.get("Range");
				return new Response(new Uint8Array([1, 2, 3, 4]), {
					status: 206,
					headers: {
						"Content-Type": "video/mp4",
						"Accept-Ranges": "bytes",
						"Content-Range": "bytes 0-3/100",
						"Content-Length": "4",
					},
				});
			} } as Fetcher,
		});
		const response = await worker.fetch(new Request("https://taf.sh/reel/stats-api-demo.mp4", {
			headers: { Range: "bytes=0-3" },
		}), env, ctx);
		expect(range).toBe("bytes=0-3");
		expect(response.status).toBe(206);
		expect(response.headers.get("Content-Type")).toBe("video/mp4");
		expect(response.headers.get("Accept-Ranges")).toBe("bytes");
		expect(response.headers.get("Content-Range")).toBe("bytes 0-3/100");
		expect(response.headers.get("Content-Length")).toBe("4");
		expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3, 4]);
	});
});
