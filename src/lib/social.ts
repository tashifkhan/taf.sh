export type SocialCard = {
	slug: string;
	label: string;
	title: string[];
	description: string[];
	tags: string[];
};

export const socialCards: Record<string, SocialCard> = {
	"/": { slug: "studio", label: "Independent software studio", title: ["Products built end to end.", "Then kept running."], description: ["Product engineering, AI systems and websites.", "Built and operated by Tashif Ahmad Khan in Delhi."], tags: ["Product engineering", "AI systems", "Websites"] },
	"/about": { slug: "about", label: "The engineer behind taf.sh", title: ["Tashif Ahmad Khan.", "One engineer. The whole build."], description: ["The person who designs the schema also writes the CSS.", "TalentSync, rah.clinic and founding work at Systematic Reasoning."], tags: ["Delhi / worldwide", "Independent", "Engineering"] },
	"/services": { slug: "services", label: "Software engineering services", title: ["Your idea.", "Built to run."], description: ["Architecture, backend, interface and deployment.", "Work directly with the engineer building your software."], tags: ["Product builds", "LLM pipelines", "WhatsApp", "Astro"] },
	"/contact": { slug: "contact", label: "Start a project", title: ["What are you building?", "Let's talk."], description: ["Software projects, AI systems and websites.", "Email me@taf.sh. Replies come from Tashif."], tags: ["me@taf.sh", "Delhi / worldwide"] },
	"/work": { slug: "work", label: "Selected software projects", title: ["Projects you can open.", "Software people use."], description: ["Studio products, team work and developer tools.", "Explore the case studies and open the live applications."], tags: ["TalentSync", "rah.clinic", "ForgeIQX", "Open source"] },
	"/work/tashif-codes": { slug: "tashif-codes", label: "Website case study", title: ["tashif.codes", "The build behind the site."], description: ["A personal portfolio, project directory and engineering blog.", "Astro, React, search metadata and public traffic analytics."], tags: ["Astro", "React", "SEO", "Analytics"] },
	"/products/talentsync": { slug: "talentsync", label: "Studio product / Hiring", title: ["TalentSync AI", "A better resume starts here."], description: ["Resume analysis, ATS feedback and career guidance.", "Free, unlimited core tools for job seekers."], tags: ["Resume analysis", "ATS feedback", "Free"] },
	"/products/talentsync-hr": { slug: "talentsync-hr", label: "Studio product / Hiring / Beta", title: ["TalentSync HR", "Screen candidates with evidence."], description: ["Resume parsing, external validation and ranked shortlists.", "Recruiting intelligence for hiring teams."], tags: ["Candidate scoring", "Evidence", "Recruiting"] },
	"/products/rah-clinic": { slug: "rah-clinic", label: "Studio product / Healthcare / In development", title: ["rah.clinic", "Your clinic. In WhatsApp."], description: ["Appointments, reminders and patient follow-ups over chat.", "Built for clinics and private practices."], tags: ["WhatsApp", "Appointments", "Patient follow-ups"] },
	"/products/systematic-reasoning": { slug: "systematic-reasoning", label: "Team work / Founding engineer", title: ["Systematic Reasoning", "ForgeIQX compliance workspace."], description: ["Connect regulatory requirements, policies and evidence.", "Tashif Ahmad Khan's founding engineering work with the team."], tags: ["Compliance", "Policy documents", "Evidence"] },
};

export function socialImagePath(path: string) {
	return `/og/${(socialCards[path] ?? socialCards["/"]).slug}.jpg`;
}
