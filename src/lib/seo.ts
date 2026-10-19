import { email, reel, services } from "../components/studio/data";

export const studioDescription = "Independent software studio in Delhi run by Tashif Ahmad Khan. Product engineering, AI systems, WhatsApp platforms and Astro websites for teams worldwide.";

// Route copy also supplies breadcrumbs and the subject of each WebPage node.
export const pageMetadata: Record<string, { title: string; description: string; label: string; type?: string }> = {
	"/": { title: "Software studio & AI engineering in Delhi", description: studioDescription, label: "Home" },
	"/about": { title: "Tashif Ahmad Khan, software engineer & founder", description: "Meet Tashif Ahmad Khan, the engineer behind taf.sh, tashif.codes, TalentSync and rah.clinic. Based in Delhi and founding engineer at Systematic Reasoning.", label: "About", type: "AboutPage" },
	"/services": { title: "Product engineering, AI & web development services", description: "Work with Tashif Ahmad Khan on product engineering, LLM pipelines, WhatsApp automation and Astro websites. Based in Delhi, working with teams worldwide.", label: "Services" },
	"/contact": { title: "Contact Tashif Ahmad Khan for software projects", description: "Discuss a software project with Tashif Ahmad Khan at taf.sh. Product builds, AI systems and websites. Email me@taf.sh, with replies within a day or two.", label: "Contact", type: "ContactPage" },
	"/work": { title: "Software projects, apps & engineering case studies", description: "Explore TalentSync AI, TalentSync HR, rah.clinic, ForgeIQX and tools by Tashif Ahmad Khan. Case studies, live project links and the tashif.codes portfolio.", label: "Work", type: "CollectionPage" },
	"/work/tashif-codes": { title: "tashif.codes: Astro website & SEO case study", description: "How Tashif Ahmad Khan built tashif.codes with Astro and React. Explore the portfolio, developer tools and blog, with public analytics and search captures.", label: "tashif.codes" },
	"/products/talentsync": { title: "TalentSync AI: free resume analysis & ATS feedback", description: "TalentSync AI gives job seekers free, unlimited resume analysis, ATS feedback and career guidance. Explore the product built by Tashif Ahmad Khan at taf.sh.", label: "TalentSync AI" },
	"/products/talentsync-hr": { title: "TalentSync HR: AI candidate screening & scoring", description: "TalentSync HR helps recruiters parse resumes, validate candidate claims and rank applicants with evidence-backed scoring. Explore the hiring platform in beta.", label: "TalentSync HR" },
	"/products/rah-clinic": { title: "rah.clinic: WhatsApp clinic management software", description: "Explore rah.clinic, a WhatsApp platform for clinic appointments, reminders and patient follow-ups. In development at taf.sh by Tashif Ahmad Khan.", label: "rah.clinic" },
	"/products/systematic-reasoning": { title: "ForgeIQX: compliance software at Systematic Reasoning", description: "A walkthrough of ForgeIQX at Systematic Reasoning. Tashif Ahmad Khan's founding engineering work on policy documents, control mappings and compliance evidence.", label: "Systematic Reasoning" },
};

export const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";
export const canonicalPath = (path: string) => path === "/" ? "/" : `${normalizePath(path)}/`;
export const projectSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function breadcrumbs(path: string, label: string) {
	return [
		{ name: "Home", path: "/" },
		...(path.startsWith("/products/") || path.startsWith("/work/") ? [{ name: "Work", path: "/work" }] : []),
		...(path === "/" ? [] : [{ name: label, path }]),
	];
}

export function structuredData(site: URL, path: string, title: string, description: string, image: string) {
	const absolute = (value: string) => {
		const url = new URL(value, site);
		if (url.origin === site.origin && !url.pathname.split("/").pop()?.includes(".")) {
			url.pathname = canonicalPath(url.pathname);
		}
		return url.href;
	};
	const organization = absolute("/#studio");
	const person = absolute("/#tashif");
	const website = absolute("/#website");
	const canonical = absolute(path);
	const metadata = pageMetadata[path];
	const project = reel.find(item => item.href === path);
	const projectId = (item: typeof reel[number]) => absolute(item.href.startsWith("/") ? `${item.href}#software` : `/work#${projectSlug(item.name)}-software`);
	const graph: Record<string, unknown>[] = [
		{
			"@type": "ProfessionalService", "@id": organization, name: "taf.sh", url: absolute("/"),
			description: studioDescription, email, image: new URL("/og/studio.jpg", image).href,
			logo: { "@type": "ImageObject", url: absolute("/icon-512.png"), width: 512, height: 512 },
			founder: { "@id": person },
			address: { "@type": "PostalAddress", addressLocality: "Delhi", addressCountry: "IN" },
			sameAs: ["https://github.com/tashifkhan", "https://linkedin.com/in/tashifkhan", "https://tashif.codes"],
		},
		{
			"@type": "Person", "@id": person, name: "Tashif Ahmad Khan", url: "https://tashif.codes/",
			jobTitle: "Software engineer", mainEntityOfPage: absolute("/about"),
			sameAs: ["https://github.com/tashifkhan", "https://linkedin.com/in/tashifkhan"],
			worksFor: { "@id": organization },
		},
		{ "@type": "WebSite", "@id": website, name: "taf.sh", url: absolute("/"), description: studioDescription, publisher: { "@id": organization }, inLanguage: "en" },
		{
			"@type": metadata?.type ?? "WebPage", "@id": `${canonical}#webpage`, url: canonical,
			name: title, description, isPartOf: { "@id": website }, inLanguage: "en",
			primaryImageOfPage: { "@type": "ImageObject", url: image },
			...(path !== "/" ? { breadcrumb: { "@id": `${canonical}#breadcrumbs` } } : {}),
			...(path === "/about" ? { mainEntity: { "@id": person } } : {}),
			...(path === "/" ? { about: { "@id": organization }, mentions: reel.map(item => ({ "@id": projectId(item) })) } : {}),
			...(path === "/work" ? { mainEntity: { "@id": `${canonical}#projects` } } : {}),
			...(path === "/services" ? { mainEntity: { "@id": `${canonical}#services` } } : {}),
			...(path === "/work/tashif-codes" ? { mainEntity: { "@id": `${canonical}#case-study` } } : {}),
			...(project ? { mainEntity: { "@id": projectId(project) } } : {}),
		},
	];
	if (path !== "/") graph.push({
		"@type": "BreadcrumbList", "@id": `${canonical}#breadcrumbs`,
		itemListElement: breadcrumbs(path, metadata?.label ?? title).map((item, index) => ({
			"@type": "ListItem", position: index + 1, name: item.name, item: absolute(item.path),
		})),
	});
	if (path === "/services") {
		graph.push({
			"@type": "OfferCatalog", "@id": `${canonical}#services`, name: "Software engineering services",
			itemListElement: services.map(service => ({
				"@type": "Offer", itemOffered: {
					"@type": "Service", "@id": `${canonical}#${service.id}`, name: service.title,
					description: service.body, url: `${canonical}#${service.id}`, provider: { "@id": organization },
				},
			})),
		});
	}
	const projects = project ? [project] : path === "/" || path === "/work" ? reel : [];
	for (const item of projects) graph.push({
		"@type": "SoftwareApplication", "@id": projectId(item),
		name: item.name === "Systematic Reasoning" ? "ForgeIQX" : item.name,
		description: item.line, url: item.live ?? absolute(item.href),
		...(item.shots.length ? { screenshot: absolute(item.shots[0]) } : {}),
		// Team work is not owned or published by the studio.
		...(item.group !== "team" ? { author: { "@id": person } } : {}),
	});
	if (path === "/work") graph.push({
		"@type": "ItemList", "@id": `${canonical}#projects`, name: "Selected software projects", numberOfItems: reel.length,
		itemListElement: reel.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: { "@id": projectId(item) } })),
	});
	if (path === "/work/tashif-codes") graph.push({
		"@type": "CreativeWork", "@id": `${canonical}#case-study`, name: "tashif.codes website case study",
		description, url: canonical, author: { "@id": person },
		about: { "@type": "WebSite", name: "tashif.codes", url: "https://tashif.codes/", author: { "@id": person } },
	});
	return { "@context": "https://schema.org", "@graph": graph };
}
