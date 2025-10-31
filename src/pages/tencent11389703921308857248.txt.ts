import type { APIRoute } from "astro";

const robotsTxt = `
16169989001968489116
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
