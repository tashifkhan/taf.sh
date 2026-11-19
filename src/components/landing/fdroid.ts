/**
 * The F-Droid repo the Android apps ship from. It lives on tashif.codes, and
 * F-Droid clients keep this address once added, so it doesn't move.
 * The fingerprint is the repo signing certificate's SHA-256: F-Droid checks
 * it when the repo is added.
 */
export const FDROID_PAGE = "https://tashif.codes/fdroid";
export const FDROID_REPO_ADD =
	"https://tashif.codes/fdroid/repo?fingerprint=568557c435bdf555725de95de596a90d6fa964d4bf0b71874f254cd0be7e94c9";

/** The F-Droid install route, as a Routes row. */
export const fdroidRoute = (app: string) => ({
	title: "F-Droid",
	body: `Add my repo under Settings, Repositories, then install ${app}. <a href="${FDROID_PAGE}" target="_blank" rel="noopener noreferrer">Setup steps</a>`,
	copy: FDROID_REPO_ADD,
});

/** Google Play, as a Routes row. There is no listing until the developer account is approved. */
export const playRoute = (href: string | undefined) =>
	href
		? { title: "Google Play", body: "The same build, through the Play Store.", action: { label: "Open Google Play", href, external: true } }
		: { title: "Google Play", body: "Not listed yet. The listing goes up once the developer account is approved." };
