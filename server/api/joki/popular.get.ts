import { db } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const items = await db.user.findMany({
      // Cast where to any to accommodate custom boolean flags on User model
      where: {
        role: "USER",
        is_active: true,
        is_open_joki: true,
        // Popular joki flag
        is_popular_joki: true,
      } as any,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        is_open_joki: true,
      },
      orderBy: { updated_at: "desc" },
      take: 30,
    });

    return { items };
  } catch (err) {
    console.error("/api/joki/popular error", err);
    throw createError({ statusCode: 500, statusMessage: "Failed to load popular joki" });
  }
});
