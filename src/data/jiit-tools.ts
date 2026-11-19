/*
 * The JIIT Tools Suite, one entry per tool, for /work/jiit-tools.
 * User counts come from the resume of June 2026 and the hub at
 * jiit-tools.tashif.codes. Screenshots were captured from the live sites on
 * 19 November 2026. Placement posts name the staff member who posted them,
 * so those names are blurred in the captures.
 */

export interface JiitTool {
	id: string;
	name: string;
	url: string;
	line: string;
	users?: string;
	stack: string[];
	/** Desktop captures at 1440 by 900. */
	shots?: string[];
	/** Phone captures at 412 by 892. */
	phone?: string[];
	links: { label: string; href: string }[];
	note?: string;
}

export const jiitHub = "https://jiit-tools.tashif.codes";

export const jiitFigures = [
	{ value: "18k+", label: "Students on JPortal" },
	{ value: "6.5k+", label: "Timetable users" },
	{ value: "5.2k+", label: "Mess menu readers" },
	{ value: "4k+", label: "Placement portal readers" },
];

export const jiitTools: JiitTool[] = [
	{
		id: "jportal",
		name: "JPortal",
		url: "https://jportal.tashif.codes",
		line: "JIIT's web portal, rebuilt for a phone. Attendance shows how many more classes you can miss before 75%. Grades plot SGPA and CGPA by semester, and marks for every test come from the portal's PDF, parsed in the browser with Pyodide. The demo account needs no login.",
		users: "18k+ students",
		stack: ["React", "Vite", "Pyodide", "PWA"],
		phone: ["/media/jiit-tools/shots/jportal-1.jpg", "/media/jiit-tools/shots/jportal-3.jpg", "/media/jiit-tools/shots/jportal-4.jpg", "/media/jiit-tools/shots/jportal-2.jpg"],
		links: [
			{ label: "Open JPortal", href: "https://jportal.tashif.codes" },
			{ label: "Source", href: "https://github.com/codeblech/jportal" },
		],
		note: "Open source, started by codeblech. I contribute to it and run this build.",
	},
	{
		id: "timetable",
		name: "JIIT Timetable",
		url: "https://jiit-timetable.tashif.codes",
		line: "Pick campus, year, batch and electives, and the official timetable shrinks to your classes. The Python parser runs in the browser through Pyodide, so building one needs no server. Export to PNG, PDF or Google Calendar, share a timetable by URL, or compare it with a friend's to find free slots. The academic calendar and exam schedule live in the same app.",
		users: "6.5k+ students",
		stack: ["Next.js", "Pyodide", "Python"],
		shots: ["/media/jiit-tools/shots/3.jpg", "/media/jiit-tools/shots/4.jpg", "/media/jiit-tools/shots/6.jpg", "/media/jiit-tools/shots/7.jpg"],
		links: [
			{ label: "Open the timetable", href: "https://jiit-timetable.tashif.codes" },
			{ label: "Source", href: "https://github.com/tashifkhan/JIIT-time-table-website" },
		],
	},
	{
		id: "mess-menu",
		name: "Mess Menu",
		url: "https://jiit-timetable.tashif.codes/mess-menu",
		line: "Breakfast, lunch and dinner for Sector 62 and Sector 128, by day and by week. It flags a stale menu instead of passing last week's off as current.",
		users: "5.2k+ readers",
		stack: ["Next.js"],
		shots: ["/media/jiit-tools/shots/5.jpg"],
		links: [
			{ label: "Open the mess menu", href: "https://jiit-timetable.tashif.codes/mess-menu" },
			{ label: "Menu data by life2harsh", href: "https://github.com/life2harsh/mess-schedular" },
		],
		note: "life2harsh updates the menu JSON for both campuses every week.",
	},
	{
		id: "placements",
		name: "Placement & Campus Updates",
		url: "https://jiit-placement-updates.tashif.codes",
		line: "Every SuperSet notice and job posting in one searchable feed. Jobs filter by package, CGPA, branch, location and open postings. The stats turn each year's offers into placement rate, package bands, branch and company breakdowns, a month-by-month timeline, and on-campus versus off-campus splits. The figures are unofficial, and the page says so.",
		users: "4k+ readers",
		stack: ["Next.js", "Python", "MongoDB"],
		shots: ["/media/jiit-tools/shots/8.jpg", "/media/jiit-tools/shots/9.jpg", "/media/jiit-tools/shots/10.jpg", "/media/jiit-tools/shots/15.jpg"],
		links: [
			{ label: "Open the portal", href: "https://jiit-placement-updates.tashif.codes" },
			{ label: "Source", href: "https://github.com/tashifkhan/JIIT-campus-updates" },
		],
	},
	{
		id: "telegram-bot",
		name: "Telegram Notification Bot",
		url: "https://t.me/SupersetNotificationBot",
		line: "Logs into SuperSet on a schedule, skips posts it has already seen, stores the rest in MongoDB and sends them to everyone who registered with /start.",
		stack: ["Python", "MongoDB", "Telegram"],
		shots: ["/media/jiit-tools/shots/11.jpg"],
		links: [
			{ label: "Open the bot", href: "https://t.me/SupersetNotificationBot" },
			{ label: "Write-up", href: "https://tashif.codes/projects/jiit-placement-alerts" },
			{ label: "Source", href: "https://github.com/tashifkhan/JIIT-placement-alerts" },
		],
	},
	{
		id: "sophos",
		name: "Sophos Auto-Login",
		url: "https://sophos-autologin.tashif.codes",
		line: "The hostel and LRC Wi-Fi logs you out about every 45 minutes. A Python CLI logs back in on a timer, moves to the next ID when one hits its data cap, runs a built-in speed test, and detaches as a background daemon on macOS and Linux. Rich terminal UI, SQLite-backed credentials, builds for Windows, macOS and Linux.",
		users: "About 100 users",
		stack: ["Python", "Rich", "SQLite"],
		shots: ["/media/jiit-tools/shots/13.jpg", "/media/jiit-tools/shots/14.jpg", "/media/jiit-tools/shots/12.jpg"],
		links: [
			{ label: "Read the guide", href: "https://sophos-autologin.tashif.codes" },
			{ label: "Releases", href: "https://github.com/tashifkhan/sophos-auto-login/releases" },
			{ label: "Source", href: "https://github.com/tashifkhan/sophos-auto-login" },
		],
	},
];
