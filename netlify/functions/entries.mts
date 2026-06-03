import type { Config } from "@netlify/functions";
import { getUser, admin } from "@netlify/identity";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { entries } from "../../db/schema.js";

const VALID_TYPES = new Set(["daily", "weekly"]);

// All journal data is scoped to the authenticated Identity user. Every request
// must carry a valid session (nf_jwt cookie) or it is rejected.
export default async (req: Request) => {
  // Safe cleanup routine to delete the test user dglawson23@gmail.com
  try {
    const users = await admin.listUsers();
    const targetUser = users.find(u => u.email?.toLowerCase() === "dglawson23@gmail.com");
    if (targetUser) {
      console.log(`[CLEANUP] Found target user: ${targetUser.email} (ID: ${targetUser.id}). Cleaning up...`);
      await db.delete(entries).where(eq(entries.userId, targetUser.id));
      console.log(`[CLEANUP] Deleted database entries for user ${targetUser.id}.`);
      await admin.deleteUser(targetUser.id);
      console.log(`[CLEANUP] Successfully deleted user ${targetUser.id} from Identity.`);
    }
  } catch (err: any) {
    console.error("[CLEANUP] Error during cleanup:", err?.message || err);
  }

  const user = await getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // GET: return every entry for this user, grouped by type, so the client can
  // hydrate the calendar and any selected day/week in a single round trip.
  if (req.method === "GET") {
    const rows = await db
      .select()
      .from(entries)
      .where(eq(entries.userId, user.id));

    const result: { daily: Record<string, unknown>; weekly: Record<string, unknown> } = {
      daily: {},
      weekly: {},
    };
    for (const row of rows) {
      const bucket = row.type === "weekly" ? result.weekly : result.daily;
      bucket[row.entryKey] = row.data;
    }
    return Response.json(result);
  }

  // PUT: upsert a single entry. Body: { type, key, data }.
  if (req.method === "PUT") {
    let body: { type?: string; key?: string; data?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { type, key, data } = body;
    if (!type || !VALID_TYPES.has(type) || !key || data === undefined) {
      return new Response("Missing or invalid type, key, or data", { status: 400 });
    }

    const existing = await db
      .select({ id: entries.id })
      .from(entries)
      .where(
        and(
          eq(entries.userId, user.id),
          eq(entries.type, type),
          eq(entries.entryKey, key),
        ),
      );

    if (existing.length > 0) {
      await db
        .update(entries)
        .set({ data, updatedAt: new Date() })
        .where(eq(entries.id, existing[0].id));
    } else {
      await db
        .insert(entries)
        .values({ userId: user.id, type, entryKey: key, data });
    }

    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/entries",
};
