import { describe, expect, test } from "bun:test";
import { pageMarkdown } from "./crawler-markdown";

describe("public HTML to Markdown", () => {
	test("keeps accessible headings, facts and source links while removing decoration and forms", () => {
		const markdown = pageMarkdown(`<header>Site navigation</header><main>
			<h1 aria-label="Products built end to end."><span aria-hidden="true">Letter animation</span></h1>
			<p>TalentSync AI is <em>free</em> &amp; live.</p>
			<ul><li>Resume analysis</li><li><a href="/work/">Read the work</a></li></ul>
			<dl><dt>Status</dt><dd>Beta</dd></dl><p><span class="inline-flex">Beta</span><span>hiring</span></p>
			<a href="#specs">Specs</a><a href="mailto:me@taf.sh">Email</a>
			<div aria-hidden="true">Decorative duplicate</div><div hidden>Private toggle</div>
			<div inert>Inactive dialog</div><script>tracking()</script><style>body{}</style>
			<svg><title>SVG decoration</title></svg><button>Open reel</button>
			<form><label>Private field</label><input value="Do not export"></form>
		</main><footer>Footer navigation</footer>`, new URL("https://taf.sh/products/talentsync/"));
		expect(markdown).toContain("# Products built end to end.");
		expect(markdown).toContain("TalentSync AI is _free_ & live.");
		expect(markdown).toContain("-   Resume analysis");
		expect(markdown).toContain("[Read the work](https://taf.sh/work/)");
		expect(markdown).toContain("[Specs](https://taf.sh/products/talentsync/#specs)");
		expect(markdown).toContain("[Email](mailto:me@taf.sh)");
		expect(markdown).toContain("Status: Beta");
		expect(markdown).toContain("Beta hiring");
		for (const excluded of ["Letter animation", "Decorative duplicate", "Private toggle", "Inactive dialog", "tracking", "body{}", "SVG decoration", "Open reel", "Private field", "Do not export", "Site navigation", "Footer navigation"]) {
			expect(markdown).not.toContain(excluded);
		}
	});

	test("requires main content and a heading rather than exporting an error page", () => {
		expect(() => pageMarkdown("<h1>Outside main</h1>", new URL("https://taf.sh/"))).toThrow("Missing main");
		expect(() => pageMarkdown("<main><p>No heading</p></main>", new URL("https://taf.sh/"))).toThrow("Missing Markdown heading");
	});
});
