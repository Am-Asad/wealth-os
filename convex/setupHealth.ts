import { api } from "./_generated/api";
import { action } from "./_generated/server";

export const assertDbHealth = action({
  args: {},
  handler: async (ctx): Promise<{ ok: boolean; [key: string]: unknown }> => {
    const health: { ok: boolean; [key: string]: unknown } = await ctx.runQuery(
      api.setup.dbHealth,
      {},
    );
    if (!health.ok) {
      throw new Error(`DB health check failed: ${JSON.stringify(health)}`);
    }
    return health;
  },
});
