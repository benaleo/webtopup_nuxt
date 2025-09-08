import { db } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const items = await db.user.findMany({
      where: {
        role: "USER",
        is_active: true,
        is_open_joki: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        is_open_joki: true,
      },
      orderBy: { updated_at: "desc" },
      take: 60,
    });

    return { items };
  } catch (err) {
    console.error("/api/joki error", err);
    throw createError({ statusCode: 500, statusMessage: "Failed to load joki" });
  }
});
