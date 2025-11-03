import type { APIRoute } from "astro";

const robotsTxt = `
bd9ff7a74173d2a4bc880816d474fa312a624dcb
`.trim();

export const GET: APIRoute = () => {
    return new Response(robotsTxt, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
};
