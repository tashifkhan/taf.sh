/*
 * Copy for the studio homepage. Everything here is taf.sh's own material,
 * lifted from the services, about and product pages so the two stay honest
 * with each other. No invented clients, quotes or numbers.
 */

export const email = "me@taf.sh";

/**
 * Where people can sponsor the work. Empty until a page exists: the footer's
 * Sponsor link only shows once this is set.
 */
export const sponsorUrl = "";

/**
 * The Google Play developer page. Empty until the developer account is
 * approved. While it is empty the Apps list says Google Play is coming, and
 * once set it links there. A per-app store link goes in `playStoreApps`,
 * keyed by the app's name in `reel`.
 */
export const playStoreDeveloperUrl = "";
export const playStoreApps: Record<string, string> = {
	// Billi: "https://play.google.com/store/apps/details?id=sh.taf.billi",
};

export const nav = [
	{ href: "/services", label: "Services" },
	{ href: "#process", label: "Process" },
	{ href: "#work", label: "Work" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
];

/* Figures from tashif.codes and GitHub, October 2026. */
export const stats = [
	{ value: 51, suffix: "", label: "Projects live right now" },
	{ value: 18, suffix: "k+", label: "Students on JPortal alone" },
	{ value: 12, suffix: "k", label: "Commits on GitHub" },
	{ value: 1, suffix: "", label: "Engineer at taf.sh" },
];

export const stack = [
	"Astro",
	"TypeScript",
	"React Native",
	"Expo",
	"FastAPI",
	"SQLModel",
	"PostgreSQL",
	"Kafka",
	"Workers",
	"Docker",
	"LLM pipelines",
	"RAG",
	"WhatsApp automation",
	"Tailwind",
];

export const services = [
	{
		id: "product",
		index: "01",
		title: "Product engineering",
		tag: "0 → 1",
		body: "From a rough idea to a running system. Architecture, backend, frontend, deploy and observability. You get production code and the infra it runs on.",
		items: ["Astro, React, TypeScript", "FastAPI, PostgreSQL", "React Native / Expo", "Docker, queues, CI"],
	},
	{
		id: "ai",
		index: "02",
		title: "AI systems",
		tag: "LLM",
		body: "LLM features that survive production. Structured extraction, eval-driven scoring, RAG and agents, built with the rigor of the TalentSync matching pipeline.",
		items: ["Parsing & extraction", "Scoring with evidence trails", "RAG over your data", "Evals that measure quality"],
	},
	{
		id: "messaging",
		index: "03",
		title: "Messaging platforms",
		tag: "Chat",
		body: "Business workflows over the chat apps people already use, on the event-driven backend that runs rah.clinic's WhatsApp platform.",
		items: ["Inbound, outbound, broadcasts", "Reminders that never slip", "Kafka, workers, retries", "Admin tooling & CLIs"],
	},
	{
		id: "web",
		index: "04",
		title: "Web presence",
		tag: "Astro",
		body: "Company sites, blogs and developer tools, built with Astro. I handle the design, content structure, search metadata, analytics and deployment.",
		items: ["Company & product sites", "Docs and marketing", "Design systems in code", "Performance & SEO passes"],
	},
];

export const process = [
	{
		step: "00",
		week: 0,
		title: "Intro call",
		body: "30 minutes. What you are building, why, and when you need it.",
		log: ["call booked", "problem written down", "fit checked, both ways"],
	},
	{
		step: "01",
		week: 1,
		title: "Written scope",
		body: "A short document with deliverables, timeline and a fixed price or weekly rate.",
		log: ["deliverables listed", "price agreed", "repo created in your org"],
	},
	{
		step: "02",
		week: 2,
		title: "First increment",
		body: "Schema, auth and the skeleton deployed to a URL you can click.",
		log: ["schema migrated", "auth working", "preview URL shared"],
	},
	{
		step: "03",
		week: 3,
		title: "Core flow",
		body: "The one path your users actually need, working end to end.",
		log: ["core flow live on preview", "edge cases logged", "feedback round 1"],
	},
	{
		step: "04",
		week: 4,
		title: "Polish & hardening",
		body: "Errors, empty states, observability and the boring parts that keep it up.",
		log: ["error tracking on", "load tested", "feedback round 2"],
	},
	{
		step: "05",
		week: 5,
		title: "Handover",
		body: "Code, infra, docs and a walkthrough. You own everything outright.",
		log: ["docs written", "walkthrough recorded", "keys transferred"],
		live: true,
	},
];

export const engagements = [
	{ title: "Fixed-scope project", body: "A defined build with a defined price and deadline. Best for 0 → 1 products." },
	{ title: "Embedded retainer", body: "A block of engineering time each month inside your team. Best for ongoing work." },
	{ title: "Advisory", body: "Architecture reviews, AI feasibility and second opinions before you commit budget." },
];

export type Product = {
	index: string;
	id: string;
	name: string;
	sector: "Hiring" | "Healthcare" | "Compliance";
	status: "Live" | "Beta" | "In development";
	desc: string;
	href: string;
	stack: string[];
	facts: [string, string][];
};

export const products: Product[] = [
	{
		index: "01",
		id: "talentsync",
		name: "TalentSync AI",
		sector: "Hiring",
		status: "Live",
		desc: "Resume intelligence for job seekers. ATS feedback and career-path prediction, free and unlimited.",
		href: "/products/talentsync",
		stack: ["LLM parsing", "FastAPI", "PostgreSQL"],
		facts: [
			["Audience", "Job seekers"],
			["Price", "Free"],
		],
	},
	{
		index: "02",
		id: "talentsync-hr",
		name: "TalentSync HR",
		sector: "Hiring",
		status: "Beta",
		desc: "Recruiting intelligence for teams. Evidence-backed candidate scoring, external validation and ranked shortlists.",
		href: "/products/talentsync-hr",
		stack: ["Scoring pipeline", "Evals", "Workers"],
		facts: [
			["Audience", "Recruiters"],
			["Output", "Ranked shortlists"],
		],
	},
	{
		index: "03",
		id: "rah-clinic",
		name: "rah.clinic",
		sector: "Healthcare",
		status: "In development",
		desc: "A clinical practice that runs on WhatsApp. Appointments, reminders and follow-ups over chat.",
		href: "/products/rah-clinic",
		stack: ["WhatsApp", "Kafka", "Schedulers"],
		facts: [
			["Audience", "Clinics"],
			["Channel", "WhatsApp"],
		],
	},
	{
		index: "04",
		id: "systematic-reasoning",
		name: "Systematic Reasoning",
		sector: "Compliance",
		status: "Live",
		desc: "ForgeIQX connects regulatory requirements, policy documents and evidence in one compliance workspace. Built with the team as founding engineer.",
		href: "/products/systematic-reasoning",
		stack: ["React", "Django", "PostgreSQL", "Kafka"],
		facts: [
			["Role", "Founding engineer"],
			["Product", "ForgeIQX"],
		],
	},
];

export const notes = [
	{
		kicker: "Ownership",
		title: "The person who designs the schema also writes the CSS.",
		body: "And answers the email. Nothing gets lost between roles, because there are no roles to lose it between.",
	},
	{
		kicker: "Products",
		title: "TalentSync and rah.clinic are running systems, not mockups.",
		body: "The consulting offer is the same engineering, pointed at your problem. You can click the proof.",
	},
	{
		kicker: "Size",
		title: "Small on purpose.",
		body: "Few clients and deep focus. There is no bench to keep busy, so there is no reason to sell hours for the sake of hours.",
	},
	{
		kicker: "AI",
		title: "Agents in production, not in demos.",
		body: "LLM pipelines with eval-driven scoring, so you can see whether a change made things better or just different.",
	},
	{
		kicker: "Cadence",
		title: "Small scopes, weekly deploys.",
		body: "You see running software every week instead of status decks, and the code is yours from the first commit.",
	},
];

export const assurances = [
	{ title: "You own the code", body: "Repo in your org from day one. No lock-in, no licence." },
	{ title: "Running software weekly", body: "A preview URL every week, not a status deck." },
	{ title: "Price up front", body: "Fixed price or weekly rate, written down before work starts." },
];

/*
 * The work panel groups studio products, team work, mobile apps and smaller
 * tools. Screens show the real applications in use.
 *
 * `id` names everything that belongs to an entry: its page on taf.sh, its
 * media in public/media/<id>/ and its film sources in video/<id>/. Products
 * and team work live at /products/<id>, everything else at /work/<id>, and
 * `href` is derived from that so a title can never point off the site.
 * External places (the running app, source, stores) go in `live` and `links`.
 */
export type ReelGroup = "product" | "team" | "app" | "shenanigan";

type ReelEntry = {
	id: string;
	name: string;
	group: ReelGroup;
	sector: string;
	year: string;
	line: string;
	tags: string[];
	stack: string[];
	/** Public site, when there is one; shows the "live site" badge. */
	live?: string;
	metric?: string;
	/** For apps: where it runs. */
	platforms?: string[];
	shots: string[];
	video?: { src: string; poster: string; label?: string; phone?: { src: string; poster: string } };
	/** Source, stores, downloads and related services. */
	links?: { label: string; href: string }[];
};

export type ReelItem = ReelEntry & { href: string };

export const pageFor = (item: Pick<ReelEntry, "id" | "group">) =>
	item.group === "product" || item.group === "team" ? `/products/${item.id}` : `/work/${item.id}`;

/** Paths inside public/media/<id>/. */
export const media = (id: string) => ({
	file: (path: string) => `/media/${id}/${path}`,
	shots: (n: number, ext = "jpg") => Array.from({ length: n }, (_, i) => `/media/${id}/shots/${i + 1}.${ext}`),
	video: { src: `/media/${id}/demo.mp4`, poster: `/media/${id}/poster.jpg` },
	cut: (name: string) => ({ src: `/media/${id}/cuts/${name}.mp4`, poster: `/media/${id}/cuts/${name}.jpg` }),
});

const entries: ReelEntry[] = [
	{
		id: "talentsync",
		name: "TalentSync AI",
		group: "product",
		sector: "hiring",
		year: "2025",
		line: "Resume analysis, role prediction, cold emails and interview prep for job seekers. Free and unlimited.",
		tags: ["product", "ai"],
		stack: ["Next.js", "FastAPI", "LangGraph", "Kafka"],
		live: "https://talentsync.tashif.codes",
		metric: "Free, unlimited",
		shots: media("talentsync").shots(9),
		video: media("talentsync").video,
	},
	{
		id: "talentsync-hr",
		name: "TalentSync HR",
		group: "product",
		sector: "hiring",
		year: "2026",
		line: "Evidence-backed candidate scoring for recruiters. Claims checked against GitHub and LeetCode, then ranked.",
		tags: ["product", "ai"],
		stack: ["FastAPI", "Evals", "PostgreSQL"],
		metric: "Beta",
		// Invite-only, and its stack is kept off to save RAM: one public screen for now.
		shots: media("talentsync-hr").shots(1),
	},
	{
		id: "rah-clinic",
		name: "rah.clinic",
		group: "product",
		sector: "healthcare",
		year: "2026",
		line: "A clinic that runs in WhatsApp. Prescriptions, reminders, vitals, recalls and billing after the consult.",
		tags: ["product", "messaging"],
		stack: ["WhatsApp", "Kafka", "Schedulers"],
		live: "https://rah.clinic",
		metric: "In development",
		shots: media("rah-clinic").shots(9),
		video: media("rah-clinic").video,
	},
	{
		id: "systematic-reasoning",
		name: "Systematic Reasoning",
		group: "team",
		sector: "compliance",
		year: "2026",
		line: "Founding engineer at Systematic Reasoning. We built ForgeIQX to connect regulatory requirements, policy documents, findings and evidence.",
		tags: ["team", "compliance", "ai"],
		stack: ["React", "Django", "PostgreSQL", "Kafka"],
		live: "https://app.systematicreasoning.com/",
		metric: "Founding engineer",
		shots: media("systematic-reasoning").shots(8),
		video: media("systematic-reasoning").video,
	},
	{
		id: "billi",
		name: "Billi",
		group: "app",
		sector: "finance",
		year: "2025",
		line: "A budgeting and expense manager for Android and the web, formerly Paisa. On-device bank SMS parsing, AI entry with Gemini Nano or your own key, budgets, app shortcuts, actions for assistants on Android 16, and layouts for phones, foldables and tablets.",
		tags: ["app", "mobile", "web"],
		stack: ["Kotlin", "Compose Multiplatform", "SQLite"],
		live: "https://billi.taf.sh",
		metric: "Local-first",
		platforms: ["Android", "Web"],
		shots: media("billi").shots(21),
		video: media("billi").video,
		links: [
			{ label: "Source", href: "https://github.com/tashifkhan/Billi" },
			{ label: "Android releases", href: "https://github.com/tashifkhan/Billi/releases" },
		],
	},
	{
		id: "patchwork",
		name: "Patchwork",
		group: "app",
		sector: "productivity",
		year: "2026",
		line: "CalDAV tasks, Nextcloud Deck boards, GitHub issues and Jira in one native app for iOS and Android. This walkthrough follows tasks and populated Jira boards across both native builds, including sprint filters and card dragging with sample data.",
		tags: ["app", "mobile"],
		stack: ["Expo", "React Native", "CalDAV", "Nextcloud Deck"],
		metric: "Native iOS + Android",
		platforms: ["iOS", "Android"],
		shots: media("patchwork").shots(6),
		video: { ...media("patchwork").video, label: "iOS + Android" },
		links: [
			{ label: "Source", href: "https://github.com/tashifkhan/Patchwork" },
		],
	},
	{
		id: "delhi-metro",
		name: "Delhi NCR Metro",
		group: "app",
		sector: "transit",
		year: "2025",
		line: "DMRC and NMRC trip planning with live alerts, as a web app and an Android app on F-Droid.",
		tags: ["app", "mobile"],
		stack: ["Expo", "React Native"],
		live: "https://ncr-metro.tashif.codes",
		metric: "F-Droid",
		platforms: ["Android", "Web"],
		shots: media("delhi-metro").shots(6, "webp"),
		video: { ...media("delhi-metro").video, label: "Web + phone walkthrough", phone: media("delhi-metro").cut("phone") },
		links: [
			{ label: "Source", href: "https://github.com/tashifkhan/delhi-metro" },
		],
	},
	{
		id: "jiit-tools",
		name: "JIIT Tools Suite",
		group: "shenanigan",
		sector: "education",
		year: "2023",
		line: "Six tools for JIIT students: JPortal for attendance and marks on a phone, a timetable builder with the mess menu, calendar and exams, a placement portal with a Telegram bot, and Sophos Wi-Fi auto-login for the hostels.",
		tags: ["app", "automation"],
		stack: ["React", "Next.js", "Pyodide", "Python", "MongoDB"],
		live: "https://jiit-tools.tashif.codes",
		metric: "18k+ on JPortal",
		shots: media("jiit-tools").shots(15),
		video: media("jiit-tools").video,
		links: [
			{ label: "JPortal", href: "https://jportal.tashif.codes" },
			{ label: "Timetable", href: "https://jiit-timetable.tashif.codes" },
			{ label: "Mess menu", href: "https://jiit-timetable.tashif.codes/mess-menu" },
			{ label: "Placements", href: "https://jiit-placement-updates.tashif.codes" },
			{ label: "Telegram bot", href: "https://t.me/SupersetNotificationBot" },
			{ label: "Sophos auto-login", href: "https://sophos-autologin.tashif.codes" },
		],
	},
	{
		id: "stats-apis",
		name: "Coding platforms stats APIs",
		group: "shenanigan",
		sector: "developer",
		year: "2024",
		line: "REST APIs for GitHub, LeetCode, Codeforces, GeeksforGeeks, CodeChef, HackerRank and takeUforward, plus self-hosted Forgejo and Gitea. Profiles, coding stats and activity share one JSON response format, with SVG cards for READMEs and a browser playground to try each endpoint. 151K requests in the last 30 days, from 400+ other sites.",
		tags: ["api", "developer tools"],
		stack: ["FastAPI", "Pydantic", "Redis"],
		live: "https://github-stats.tashif.codes",
		metric: "151K requests / 30 days",
		shots: media("stats-apis").shots(6),
		video: media("stats-apis").video,
		links: [
			{ label: "GitHub", href: "https://github-stats.tashif.codes" },
			{ label: "LeetCode", href: "https://leetcode-stats.tashif.codes" },
			{ label: "Codeforces", href: "https://codeforces-stats.tashif.codes" },
			{ label: "GeeksforGeeks", href: "https://gfg-stats.tashif.codes" },
			{ label: "CodeChef", href: "https://codechef-stats.tashif.codes" },
			{ label: "HackerRank", href: "https://hackerrank-stats.tashif.codes" },
			{ label: "takeUforward", href: "https://tuf-stats.tashif.codes" },
			{ label: "Forgejo & Gitea source", href: "https://github.com/tashifkhan/GitHost-Stats-API" },
		],
	},
	{
		id: "codetrace",
		name: "CodeTrace",
		group: "shenanigan",
		sector: "developer",
		year: "2025",
		line: "One dashboard for a coding footprint across seven platforms, each backed by its own stats API.",
		tags: ["tool", "apis"],
		stack: ["React", "TanStack Router", "FastAPI", "Redis"],
		live: "https://codetrace.xyz",
		metric: "7 APIs",
		shots: media("codetrace").shots(6),
		video: media("codetrace").video,
		links: [
			{ label: "Open the dashboard", href: "https://codetrace.xyz/app?github=tashifkhan&leetcode=khan-tashif" },
			{ label: "Source", href: "https://github.com/tashifkhan/CodeTrace" },
		],
	},
	{
		id: "agentic-browser",
		name: "Agentic Browser",
		group: "shenanigan",
		sector: "ai agents",
		year: "2025",
		line: "A browser side panel whose agents plan, act and verify on any page. REST and MCP clients, bring your own keys.",
		tags: ["tool", "ai"],
		stack: ["LangGraph", "FastAPI", "MCP"],
		metric: "BYO keys",
		// Slides from the project deck, also shown on its case study.
		shots: Array.from({ length: 6 }, (_, i) => media("agentic-browser").file(`landing/slides/${String(i + 1).padStart(2, "0")}.webp`)),
		video: media("agentic-browser").video,
		links: [{ label: "Source", href: "https://github.com/tashifkhan/agentic-browser" }],
	},
];

export const reel: ReelItem[] = entries.map((entry) => ({ ...entry, href: pageFor(entry) }));

export const reelGroups = [
	{ id: "all", label: "All" },
	{ id: "product", label: "Products" },
	{ id: "team", label: "Team work" },
	{ id: "app", label: "Mobile apps" },
	{ id: "shenanigan", label: "Digital shenanigans" },
] as const;
