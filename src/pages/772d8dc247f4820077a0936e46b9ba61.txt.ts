import type { APIRoute } from "astro";

const robotsTxt = `
c381cbc421b173300035c84d86a89c532c3a7cb3
`.trim();

export const GET: APIRoute = () => {
    return new Response(robotsTxt, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
};
