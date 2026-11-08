/** Leave media URLs inactive until the visitor explicitly requests playback. */
export function initVideoPlayers(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>("[data-video-player]").forEach((player) => {
		if (player.hasAttribute("data-video-ready")) return;
		const video = player.querySelector<HTMLVideoElement>("video[data-video-src]");
		const play = player.querySelector<HTMLButtonElement>("[data-video-play]");
		const src = video?.dataset.videoSrc;
		if (!video || !play || !src) return;
		player.setAttribute("data-video-ready", "");

		play.addEventListener("click", () => {
			// Assigning src here, rather than on visibility or hover, prevents
			// speculative media requests even when preload="none" is ignored.
			if (!video.hasAttribute("src")) video.src = src;
			else if (video.error) video.load();
			video.controls = true;
			play.hidden = true;
			video.focus({ preventScroll: true });
			// Call play synchronously so mobile browsers retain the user gesture.
			void video.play().catch(() => {
				video.controls = false;
				play.hidden = false;
				if (document.activeElement === video) play.focus({ preventScroll: true });
			});
		});
		play.hidden = false;
	});
}
