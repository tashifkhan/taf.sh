const clock = (seconds: number) => {
	if (!Number.isFinite(seconds)) return "0:00";
	const s = Math.floor(seconds);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Leave media URLs inactive until the visitor explicitly requests playback,
 * then drive the site's own control bar: play, seek, time, speed up to 3x,
 * sound, picture in picture and full screen.
 * A player without a bar falls back to the browser's controls.
 */
export function initVideoPlayers(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>("[data-video-player]").forEach((player) => {
		if (player.hasAttribute("data-video-ready")) return;
		const video = player.querySelector<HTMLVideoElement>("video[data-video-src]");
		const play = player.querySelector<HTMLButtonElement>("[data-video-play]");
		const src = video?.dataset.videoSrc;
		if (!video || !play || !src) return;
		player.setAttribute("data-video-ready", "");

		const bar = player.querySelector<HTMLElement>("[data-video-bar]");
		const showControls = (on: boolean) => {
			if (bar) bar.hidden = !on;
			else video.controls = on;
		};

		play.addEventListener("click", () => {
			// Assigning src here, rather than on visibility or hover, prevents
			// speculative media requests even when preload="none" is ignored.
			if (!video.hasAttribute("src")) video.src = src;
			else if (video.error) video.load();
			showControls(true);
			play.hidden = true;
			(bar?.querySelector<HTMLElement>("[data-video-toggle]") ?? video).focus({ preventScroll: true });
			// Call play synchronously so mobile browsers retain the user gesture.
			void video.play().catch(() => {
				showControls(false);
				play.hidden = false;
				play.focus({ preventScroll: true });
			});
		});
		play.hidden = false;

		if (!bar) return;
		const toggle = bar.querySelector<HTMLButtonElement>("[data-video-toggle]");
		const seek = bar.querySelector<HTMLInputElement>("[data-video-seek]");
		const time = bar.querySelector<HTMLElement>("[data-video-time]");
		const duration = bar.querySelector<HTMLElement>("[data-video-duration]");
		const mute = bar.querySelector<HTMLButtonElement>("[data-video-mute]");
		const full = bar.querySelector<HTMLButtonElement>("[data-video-full]");
		if (!toggle || !seek || !time || !duration || !mute || !full) return;

		let seeking = false;
		const sync = () => {
			const playing = !video.paused && !video.ended;
			player.dataset.videoState = playing ? "playing" : "paused";
			toggle.setAttribute("aria-label", playing ? "Pause" : "Play");
			player.toggleAttribute("data-video-muted", video.muted);
			mute.setAttribute("aria-label", video.muted ? "Turn sound on" : "Mute");
		};
		const flip = () => {
			if (video.paused || video.ended) void video.play().catch(() => {});
			else video.pause();
		};

		toggle.addEventListener("click", flip);
		video.addEventListener("click", () => {
			if (!bar.hidden) flip();
		});
		for (const name of ["play", "pause", "ended", "volumechange"]) video.addEventListener(name, sync);
		video.addEventListener("loadedmetadata", () => {
			duration.textContent = clock(video.duration);
		});
		video.addEventListener("timeupdate", () => {
			time.textContent = clock(video.currentTime);
			if (!seeking && video.duration) seek.value = String(Math.round((video.currentTime / video.duration) * 1000));
		});
		seek.addEventListener("input", () => {
			seeking = true;
			if (video.duration) time.textContent = clock((Number(seek.value) / 1000) * video.duration);
		});
		seek.addEventListener("change", () => {
			if (video.duration) video.currentTime = (Number(seek.value) / 1000) * video.duration;
			seeking = false;
		});
		mute.addEventListener("click", () => {
			video.muted = !video.muted;
		});

		// Speed: a slider from 0.25x to 3x, plus a few one-tap rates.
		const speedBtn = bar.querySelector<HTMLButtonElement>("[data-video-speed-btn]");
		const speedPop = bar.querySelector<HTMLElement>("[data-video-speed-pop]");
		const speedRange = bar.querySelector<HTMLInputElement>("[data-video-speed-range]");
		const speedOut = bar.querySelector<HTMLElement>("[data-video-speed-out]");
		if (speedBtn && speedPop && speedRange && speedOut) {
			const rates = speedPop.querySelectorAll<HTMLElement>("[data-video-rate]");
			const setRate = (rate: number) => {
				video.playbackRate = rate;
				speedRange.value = String(rate);
				speedOut.textContent = speedBtn.textContent = `${rate}x`;
				speedBtn.setAttribute("aria-label", `Playback speed, ${rate}x`);
				rates.forEach((b) => b.toggleAttribute("data-on", Number(b.dataset.videoRate) === rate));
			};
			const open = (on: boolean) => {
				speedPop.hidden = !on;
				speedBtn.setAttribute("aria-expanded", String(on));
				// Keeps the bar on screen while the menu is open.
				player.toggleAttribute("data-video-menu", on);
			};
			speedBtn.addEventListener("click", () => open(speedPop.hidden));
			speedRange.addEventListener("input", () => setRate(Number(speedRange.value)));
			rates.forEach((b) => b.addEventListener("click", () => setRate(Number(b.dataset.videoRate))));
			document.addEventListener("click", (event) => {
				if (!speedPop.hidden && !speedBtn.parentElement?.contains(event.target as Node)) open(false);
			});
			player.addEventListener("keydown", (event) => {
				if (event.key !== "Escape" || speedPop.hidden) return;
				open(false);
				speedBtn.focus();
			});
			setRate(1);
		}

		// Picture in picture floats the clip above the page and above other
		// apps. Browsers without the API hide the button.
		const pip = bar.querySelector<HTMLButtonElement>("[data-video-pip]");
		if (pip) {
			if (!document.pictureInPictureEnabled) pip.hidden = true;
			pip.addEventListener("click", () => {
				if (document.pictureInPictureElement === video) void document.exitPictureInPicture().catch(() => {});
				else void video.requestPictureInPicture().catch(() => {});
			});
			video.addEventListener("enterpictureinpicture", () => pip.setAttribute("aria-label", "Leave picture in picture"));
			video.addEventListener("leavepictureinpicture", () => pip.setAttribute("aria-label", "Picture in picture"));
		}

		// iPhones only let the video element itself go full screen.
		const iosFull = (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen;
		if (!document.fullscreenEnabled && !iosFull) full.hidden = true;
		full.addEventListener("click", () => {
			if (document.fullscreenElement) void document.exitFullscreen();
			else if (player.requestFullscreen) void player.requestFullscreen().catch(() => {});
			else iosFull?.call(video);
		});
		sync();
	});
}
