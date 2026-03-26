import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/health/db",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const health = await ctx.runQuery(api.setup.dbHealth, {});
    return new Response(JSON.stringify(health, null, 2), {
      status: health.ok ? 200 : 503,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }),
});

export default http;
