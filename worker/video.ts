/** Supply single byte ranges when the deployed Assets binding returns a full MP4. */
export async function videoResponse(request: Request, response: Response): Promise<Response> {
	if (response.status !== 200 || !response.headers.get("Content-Type")?.startsWith("video/mp4")) return response;
	const headers = new Headers(response.headers);
	headers.set("Accept-Ranges", "bytes");
	const full = () => new Response(response.body, { status: response.status, headers });
	const length = Number(headers.get("Content-Length"));
	const range = request.headers.get("Range");
	if (request.method !== "GET" || !range || !Number.isSafeInteger(length) || length <= 0 || headers.has("Content-Encoding")) return full();

	const ifRange = request.headers.get("If-Range");
	if (ifRange) {
		const etag = headers.get("ETag");
		const modified = Date.parse(headers.get("Last-Modified") ?? "");
		const matches = ifRange.startsWith('"')
			? ifRange === etag
			: !ifRange.startsWith("W/") && Number.isFinite(modified) && modified <= Date.parse(ifRange);
		if (!matches) return full();
	}

	// Ignore malformed or multipart ranges. A full 200 response is valid for these.
	const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
	if (!match || (!match[1] && !match[2])) return full();
	const first = match[1] ? Number(match[1]) : null;
	const last = match[2] ? Number(match[2]) : null;
	if ((first !== null && !Number.isSafeInteger(first)) || (last !== null && !Number.isSafeInteger(last))) return full();
	if (first !== null && last !== null && last < first) return full();
	const start = first ?? Math.max(0, length - (last ?? 0));
	const end = first === null ? length - 1 : Math.min(last ?? length - 1, length - 1);
	headers.delete("Content-Length");
	if (start >= length || (first === null && last === 0)) {
		await response.body?.cancel();
		headers.set("Content-Range", `bytes */${length}`);
		return new Response(null, { status: 416, headers });
	}
	if (!response.body) return full();

	const reader = response.body.getReader();
	let offset = 0;
	const body = new ReadableStream<Uint8Array>({
		async pull(controller) {
			try {
				while (offset <= end) {
					const { value, done } = await reader.read();
					if (done) throw new Error("Video asset ended before the requested range");
					const chunkStart = offset;
					offset += value.byteLength;
					if (offset <= start) continue;
					controller.enqueue(value.subarray(Math.max(0, start - chunkStart), Math.min(value.byteLength, end - chunkStart + 1)));
					if (offset > end) {
						controller.close();
						await reader.cancel();
					}
					return;
				}
			} catch (error) {
				controller.error(error);
				await reader.cancel(error);
			}
		},
		cancel(reason) { return reader.cancel(reason); },
	});
	headers.set("Content-Range", `bytes ${start}-${end}/${length}`);
	// The runtime streams this body. Content-Range supplies the byte count
	// without buffering the video to manufacture a Content-Length header.
	return new Response(body, { status: 206, headers });
}
