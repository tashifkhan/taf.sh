// The deployed Assets binding can omit Content-Length even for known-size files.
// Keep sizes in the same deployment as the media so range responses can use them.
const sizes: Record<string, number> = {};
const files = Array.from(new Bun.Glob("reel/**/*.mp4").scanSync("public")).sort();
for (const path of files) sizes[`/${path}`] = Bun.file(`public/${path}`).size;
await Bun.write("worker/video-manifest.json", JSON.stringify(sizes, null, 2) + "\n");
console.log(`Recorded sizes for ${files.length} MP4 files.`);
