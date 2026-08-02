/** Shared content for design variants — keeps copy consistent across explorations. */

export const products = [
	{
		index: "01",
		name: "TalentSync AI",
		desc: "Resume intelligence for job seekers — ATS feedback, career-path prediction, free and unlimited.",
		href: "/products/talentsync",
		status: "Live",
		tag: "Hiring",
	},
	{
		index: "02",
		name: "TalentSync HR",
		desc: "Recruiting intelligence for teams — evidence-backed candidate scoring, ranked shortlists.",
		href: "/products/talentsync-hr",
		status: "Beta",
		tag: "Recruiting",
	},
	{
		index: "03",
		name: "CliniQ",
		desc: "A clinical practice that runs on WhatsApp — appointments, reminders, and follow-ups over chat.",
		href: "/products/cliniq",
		status: "In development",
		tag: "Healthcare",
	},
] as const;

export const services = [
	{
		title: "Product engineering",
		body: "0 → 1 web and mobile apps. Schema to CSS, queues to deploy.",
	},
	{
		title: "AI systems",
		body: "LLM pipelines, RAG, scoring, and agents that ship to production.",
	},
	{
		title: "Messaging platforms",
		body: "WhatsApp automation at scale — clinics, support, and ops.",
	},
	{
		title: "Web presence",
		body: "Fast Astro sites like this one — designed and shipped end-to-end.",
	},
] as const;

export const traits = [
	{
		title: "Solo by design",
		body: "You work directly with the person writing every line of code.",
	},
	{
		title: "AI-native",
		body: "LLM pipelines, eval-driven scoring, and agents in production.",
	},
	{
		title: "Full-stack, literally",
		body: "Schema to CSS. APIs, queues, mobile apps, and the landing page.",
	},
	{
		title: "Products, not slides",
		body: "The studio runs its own products on the same stack it sells.",
	},
] as const;

export const stats = [
	{ fig: "Fig 1.", value: "03", label: "Products in production" },
	{ fig: "Fig 2.", value: "02", label: "Problem spaces" },
	{ fig: "Fig 3.", value: "01", label: "Human behind all of it" },
] as const;

export const process = [
	{
		step: "1",
		title: "Intro call",
		body: "30 minutes. What you are building, why, and when you need it.",
	},
	{
		step: "2",
		title: "Written scope",
		body: "Deliverables, timeline, fixed price or weekly rate. No surprises.",
	},
	{
		step: "3",
		title: "Weekly increments",
		body: "Running software every week, not status decks.",
	},
	{
		step: "4",
		title: "Handover",
		body: "Code, infra, docs, and a walkthrough. You own everything.",
	},
] as const;

export const email = "me@tashif.codes";
