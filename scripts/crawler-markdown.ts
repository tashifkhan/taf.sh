import { parse, serialize, type DefaultTreeAdapterMap } from "parse5";
import TurndownService from "turndown";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const isElement = (node: Node): node is Element => "tagName" in node;
const attr = (node: Element, name: string) => node.attrs.find(item => item.name === name)?.value;
const discarded = new Set(["script", "style", "svg", "canvas", "nav", "button", "form", "input", "select", "textarea", "dialog", "template", "img", "video", "audio", "source"]);

function find(node: Node, tag: string): Element | undefined {
	if (isElement(node) && node.tagName === tag) return node;
	if ("childNodes" in node) for (const child of node.childNodes) {
		const match = find(child, tag);
		if (match) return match;
	}
}

function clean(node: Element, source: URL) {
	// The homepage headline has two decorative letter layers. Its accessible
	// label is the actual heading and must survive removing aria-hidden nodes.
	const label = attr(node, "aria-label");
	if (/^h[1-6]$/.test(node.tagName) && label) {
		node.childNodes = [{ nodeName: "#text", value: label, parentNode: node }];
	}
	node.childNodes = node.childNodes.filter(child => !isElement(child) || (
		!discarded.has(child.tagName) && attr(child, "aria-hidden") !== "true" &&
		attr(child, "hidden") === undefined && attr(child, "inert") === undefined
	));
	for (const child of node.childNodes) if (isElement(child)) {
		if (child.tagName === "a") {
			const href = child.attrs.find(item => item.name === "href");
			if (href) {
				const url = new URL(href.value, source);
				// Do not carry executable or unsupported link schemes into Markdown.
				if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) href.value = url.href;
				else child.attrs = child.attrs.filter(item => item.name !== "href");
			}
		}
		clean(child, source);
	}
}

export function pageMarkdown(html: string, source: URL) {
	const main = find(parse(html), "main");
	if (!main) throw new Error(`Missing main content: ${source}`);
	clean(main, source);
	const converter = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced" });
	converter.addRule("displayedSpan", {
		filter: "span",
		replacement: (content, node) => {
			// CSS can separate inline elements visually without HTML whitespace.
			// Retain those word boundaries in status chips and metric captions.
			const classes = node.getAttribute("class")?.split(/\s+/) ?? [];
			return classes.some(value => ["block", "flex", "inline-flex"].includes(value)) ? ` ${content} ` : content;
		},
	});
	converter.addRule("definitionTerm", { filter: "dt", replacement: content => `\n\n${content.trim()}: ` });
	converter.addRule("definitionValue", { filter: "dd", replacement: content => `${content.trim()}\n\n` });
	const markdown = converter.turndown(serialize(main));
	if (!/^# .+/m.test(markdown)) throw new Error(`Missing Markdown heading: ${source}`);
	return `Source: <${source.href}>\n\n${markdown}\n`;
}
