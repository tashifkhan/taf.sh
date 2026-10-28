import { email, reel, services, stats } from "../components/studio/data";
import { pageMetadata, studioDescription } from "../lib/seo";
import {
	buildMailto,
	clip,
	contactDraft,
	copyText,
	isEmail,
	openMailto,
	registerTools,
	type WebmcpTool,
} from "../lib/webmcp";

const ORIGIN = "https://taf.sh";
const BUDGETS = ["< ₹2L", "₹2–5L", "₹5–15L", "₹15L+", "Not sure"];

const about = {
	name: "Tashif Ahmad Khan",
	studio: "taf.sh",
	based: "Delhi, India",
	role: "Founding engineer at Systematic Reasoning",
	email,
	site: ORIGIN,
	portfolio: "https://tashif.codes",
	github: "https://github.com/tashifkhan",
	summary:
		"Independent software studio. Product engineering, AI systems, WhatsApp platforms and Astro websites. One engineer, me@taf.sh.",
};

function fillContactForm(fields: {
	name?: string;
	email?: string;
	budget?: string;
	brief?: string;
}) {
	const form = document.querySelector<HTMLFormElement>("[data-form]");
	if (!form) return false;
	const set = (name: string, value?: string) => {
		if (!value) return;
		const field = form.elements.namedItem(name);
		if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
			field.value = value;
		} else if (name === "budget") {
			const radio = form.querySelector<HTMLInputElement>(`input[name="budget"][value="${CSS.escape(value)}"]`);
			if (radio) radio.checked = true;
		}
	};
	set("name", fields.name);
	set("email", fields.email);
	set("brief", fields.brief);
	set("budget", fields.budget);
	form.closest<HTMLElement>("[data-form-wrap]")?.scrollIntoView({ block: "center" });
	return true;
}

function tools(): WebmcpTool[] {
	return [
		{
			name: "get_studio_overview",
			description: "Overview of taf.sh, Tashif Ahmad Khan, and the public pages on this site.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true },
			execute: () => ({
				...about,
				description: studioDescription,
				stats: stats.map((item) => `${item.value}${item.suffix} ${item.label}`),
				pages: Object.entries(pageMetadata).map(([path, page]) => ({
					path,
					url: new URL(path, ORIGIN).href,
					title: page.title,
				})),
			}),
		},
		{
			name: "list_services",
			description: "List taf.sh engineering services.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true },
			execute: () => ({
				services: services.map((service) => ({
					id: service.id,
					title: service.title,
					tag: service.tag,
					body: clip(service.body, 220),
				})),
			}),
		},
		{
			name: "get_service",
			description: "Get one taf.sh service by id: product, ai, messaging, or web.",
			inputSchema: {
				type: "object",
				properties: {
					id: { type: "string", description: "Service id: product, ai, messaging, web" },
				},
				required: ["id"],
			},
			annotations: { readOnlyHint: true },
			execute: ({ id }) => {
				const service = services.find((item) => item.id === String(id ?? "").toLowerCase());
				if (!service) return { ok: false, error: "Unknown service id. Use product, ai, messaging, or web." };
				return { id: service.id, title: service.title, tag: service.tag, body: service.body, items: service.items };
			},
		},
		{
			name: "list_work",
			description: "List studio products, team work, and tools shown on taf.sh.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true },
			execute: () => ({
				work: reel.map((item) => ({
					name: item.name,
					group: item.group,
					href: item.href.startsWith("http") ? item.href : new URL(item.href, ORIGIN).href,
					live: item.live ?? null,
					line: clip(item.line, 180),
				})),
			}),
		},
		{
			name: "get_product",
			description: "Get one product or case study by name or path, such as TalentSync or /products/rah-clinic.",
			inputSchema: {
				type: "object",
				properties: {
					query: { type: "string", description: "Product name or path" },
				},
				required: ["query"],
			},
			annotations: { readOnlyHint: true },
			execute: ({ query }) => {
				const needle = String(query ?? "").trim().toLowerCase();
				const item = reel.find(
					(entry) =>
						entry.name.toLowerCase().includes(needle) ||
						entry.href.toLowerCase().includes(needle) ||
						(entry.live ?? "").toLowerCase().includes(needle),
				);
				if (!item) return { ok: false, error: "No matching product on taf.sh." };
				return {
					name: item.name,
					group: item.group,
					line: item.line,
					href: item.href.startsWith("http") ? item.href : new URL(item.href, ORIGIN).href,
					live: item.live ?? null,
					stack: item.stack,
					metric: item.metric ?? null,
				};
			},
		},
		{
			name: "get_about",
			description: "Facts about Tashif Ahmad Khan and taf.sh.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true },
			execute: () => about,
		},
		{
			name: "get_contact",
			description: "How to reach Tashif. Does not send mail.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true },
			execute: () => ({
				email,
				contactPage: `${ORIGIN}/contact/`,
				reply: "Usually within a day or two",
				start_contact: "Use start_contact to draft a project brief. It opens the visitor's mail app and returns the draft for in-chat agents.",
			}),
		},
		{
			name: "copy_studio_email",
			description: "Copy me@taf.sh to the clipboard. Does not send mail.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: false, consequentialHint: true },
			execute: async () => {
				const copied = await copyText(email);
				return { ok: true, email, copied, note: copied ? "Copied me@taf.sh." : "Clipboard blocked. Address is me@taf.sh." };
			},
		},
		{
			name: "start_contact",
			description:
				"Draft a project brief to me@taf.sh. Fills the on-page form when present, opens the visitor's mail app, and returns the full draft for in-chat agents such as Grok. Does not send until a human hits Send or the agent sends from the user's mailbox after they confirm.",
			inputSchema: {
				type: "object",
				properties: {
					name: { type: "string", description: "Visitor's name" },
					email: { type: "string", description: "Visitor's reply-to email" },
					brief: {
						type: "string",
						description: "What they are building, timing, and what is in the way. At least 20 characters.",
					},
					budget: {
						type: "string",
						enum: BUDGETS,
						description: "Rough budget band",
					},
				},
				required: ["name", "email", "brief"],
			},
			annotations: { readOnlyHint: false, consequentialHint: true },
			execute: async ({ name, email: replyTo, brief, budget }) => {
				const person = String(name ?? "").trim();
				const mail = String(replyTo ?? "").trim();
				const note = String(brief ?? "").trim();
				const band = BUDGETS.includes(String(budget ?? "")) ? String(budget) : "Not sure";
				if (!person) return { ok: false, error: "Add a name." };
				if (!isEmail(mail)) return { ok: false, error: "That reply-to email does not look right." };
				if (note.length < 20) return { ok: false, error: "Give the brief at least 20 characters." };

				const ref = `taf-${Date.now().toString(36).slice(-4)}`;
				const subject = `Project brief from ${person} [${ref}]`;
				const body = `${note}\n\nBudget: ${band}\nReply to: ${mail}\nRef: ${ref}`;
				const filledForm = fillContactForm({ name: person, email: mail, budget: band, brief: note });
				const opened = openMailto(buildMailto(email, subject, body));
				return contactDraft({ to: email, subject, body, opened, filledForm });
			},
		},
	];
}

let controller: AbortController | null = null;

export async function registerStudioWebmcp() {
	if (document.body.hasAttribute("data-noindex")) return;
	if (!document.modelContext) return;
	controller?.abort();
	controller = new AbortController();
	try {
		await registerTools(tools(), controller.signal);
	} catch {
		// Origin trial, Permissions-Policy, or an older polyfill. The page still works.
	}
}
