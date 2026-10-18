/*
 * Copy for the studio homepage. Everything here is taf.sh's own material,
 * lifted from the services, about and product pages so the two stay honest
 * with each other. No invented clients, quotes or numbers.
 */

export const email = "me@taf.sh";

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
		body: "Fast, content-driven sites that score well and read well. This one ships its CSS inline and most visitors download no JavaScript framework at all.",
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
 * The work panel groups team work, studio products and smaller tools.
 * Screens show the real applications in use.
 */
export type ReelItem = {
	name: string;
	group: "team" | "product" | "shenanigan";
	sector: string;
	year: string;
	line: string;
	tags: string[];
	stack: string[];
	href: string;
	/** Public site, when there is one; shows the "live site" badge. */
	live?: string;
	metric?: string;
	shots: string[];
	video?: { src: string; poster: string };
};

const shots = (name: string, n: number) => Array.from({ length: n }, (_, i) => `/reel/${name}-${i + 1}.jpg`);

export const reel: ReelItem[] = [
	{
		name: "TalentSync AI",
		group: "product",
		sector: "hiring",
		year: "2025",
		line: "Resume analysis, role prediction, cold emails and interview prep for job seekers. Free and unlimited.",
		tags: ["product", "ai"],
		stack: ["Next.js", "FastAPI", "LangGraph", "Kafka"],
		href: "/products/talentsync",
		live: "https://talentsync.tashif.codes",
		metric: "Free, unlimited",
		shots: shots("talentsync", 9),
		video: { src: "/reel/talentsync-demo.mp4", poster: "/reel/talentsync-poster.jpg" },
	},
	{
		name: "TalentSync HR",
		group: "product",
		sector: "hiring",
		year: "2026",
		line: "Evidence-backed candidate scoring for recruiters. Claims checked against GitHub and LeetCode, then ranked.",
		tags: ["product", "ai"],
		stack: ["FastAPI", "Evals", "PostgreSQL"],
		href: "/products/talentsync-hr",
		metric: "Beta",
		// Invite-only, and its stack is kept off to save RAM: one public screen for now.
		shots: ["/reel/talentsync-hr.jpg"],
	},
	{
		name: "rah.clinic",
		group: "product",
		sector: "healthcare",
		year: "2026",
		line: "A clinic that runs in WhatsApp. Prescriptions, reminders, vitals, recalls and billing after the consult.",
		tags: ["product", "messaging"],
		stack: ["WhatsApp", "Kafka", "Schedulers"],
		href: "/products/rah-clinic",
		live: "https://rah.clinic",
		metric: "In development",
		shots: shots("rah-clinic", 9),
		video: { src: "/reel/rah-clinic-demo.mp4", poster: "/reel/rah-clinic-poster.jpg" },
	},
	{
		name: "Systematic Reasoning",
		group: "team",
		sector: "compliance",
		year: "2026",
		line: "Founding engineer at Systematic Reasoning. We built ForgeIQX to connect regulatory requirements, policy documents, findings and evidence.",
		tags: ["team", "compliance", "ai"],
		stack: ["React", "Django", "PostgreSQL", "Kafka"],
		href: "/products/systematic-reasoning",
		live: "https://app.systematicreasoning.com/",
		metric: "Founding engineer",
		shots: shots("systematic-reasoning", 8),
		video: { src: "/reel/systematic-reasoning-demo.mp4", poster: "/reel/systematic-reasoning-poster.jpg" },
	},
	{
		name: "Agentic Browser",
		group: "shenanigan",
		sector: "ai agents",
		year: "2025",
		line: "A browser side panel whose agents plan, act and verify on any page. REST and MCP clients, bring your own keys.",
		tags: ["tool", "ai"],
		stack: ["LangGraph", "FastAPI", "MCP"],
		href: "https://github.com/tashifkhan/agentic-browser",
		live: "https://tashif.codes/u/agentic-browser",
		metric: "BYO keys",
		shots: [],
		video: { src: "/reel/agentic-browser-demo.mp4", poster: "/reel/agentic-browser-poster.jpg" },
	},
	{
		name: "CodeTrace",
		group: "shenanigan",
		sector: "developer",
		year: "2025",
		line: "One dashboard for a coding footprint across seven platforms, each backed by its own stats API.",
		tags: ["tool", "apis"],
		stack: ["TanStack Start", "FastAPI", "Redis"],
		href: "https://codetrace.xyz/app?github=tashifkhan&leetcode=khan-tashif",
		live: "https://codetrace.xyz",
		metric: "7 APIs",
		shots: shots("codetrace", 3),
	},
	{
		name: "JIIT Campus Updates",
		group: "shenanigan",
		sector: "education",
		year: "2025",
		line: "Placement and campus notices in one feed, with job listings and placement stats pulled from the portals.",
		tags: ["app", "automation"],
		stack: ["Next.js", "Python", "MongoDB"],
		href: "https://jiit-placement-updates.tashif.codes",
		live: "https://jiit-placement-updates.tashif.codes",
		metric: "4k+ users",
		shots: shots("campus", 3),
	},
	{
		name: "JIIT Timetable",
		group: "shenanigan",
		sector: "education",
		year: "2024",
		line: "Personal timetables parsed from the official PDF in the browser, plus mess menu, calendar and exams.",
		tags: ["app"],
		stack: ["Next.js", "Pyodide"],
		href: "https://jiit-timetable.tashif.codes",
		live: "https://jiit-timetable.tashif.codes",
		metric: "6.5k+ users",
		shots: shots("jptt", 3),
	},
	{
		name: "Delhi NCR Metro",
		group: "shenanigan",
		sector: "transit",
		year: "2025",
		line: "DMRC and NMRC trip planning with live alerts, as a web app and an Android app on F-Droid.",
		tags: ["app", "mobile"],
		stack: ["Expo", "React Native"],
		href: "https://ncr-metro.tashif.codes",
		live: "https://ncr-metro.tashif.codes",
		metric: "F-Droid",
		shots: shots("ncr-metro", 3),
	},
	{
		name: "WikiSpark",
		group: "shenanigan",
		sector: "reading",
		year: "2025",
		line: "A calmer Wikipedia reader, with a browser extension that sends every Wikipedia link through it.",
		tags: ["app", "extension"],
		stack: ["TypeScript", "Wikipedia API"],
		href: "https://wikispark.tashif.codes",
		live: "https://wikispark.tashif.codes",
		shots: shots("wikispark", 2),
	},
	{
		name: "GitHub Stats API",
		group: "shenanigan",
		sector: "developer",
		year: "2024",
		line: "A REST API and dashboard for GitHub profiles, commits and heatmaps. One of seven that feed CodeTrace.",
		tags: ["api"],
		stack: ["FastAPI", "Redis"],
		href: "https://github-stats.tashif.codes",
		live: "https://github-stats.tashif.codes",
		shots: shots("github-stats", 2),
	},
	{
		name: "Paisa",
		group: "shenanigan",
		sector: "finance",
		year: "2025",
		line: "Local-first expense manager for Android. No nags, no cloud lock-in.",
		tags: ["app", "mobile"],
		stack: ["Kotlin", "Android"],
		href: "https://paisa.tashif.codes",
		live: "https://paisa.tashif.codes",
		metric: "Local-first",
		shots: shots("paisa", 1),
	},
];

export const reelGroups = [
	{ id: "all", label: "All" },
	{ id: "product", label: "Products" },
	{ id: "team", label: "Team work" },
	{ id: "shenanigan", label: "Digital shenanigans" },
] as const;
