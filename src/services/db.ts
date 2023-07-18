import { Platform, PrismaClient } from "@prisma/client";
import { DbError } from "../utils/errors";

const prisma = new PrismaClient();

interface DbProps {
  platform: Platform;
  handle: string;
  followers: number | null;
  following: number | null;
  posts: number | null;
  likes: number | null;
}

class DbService {
  async getStats(platform: Platform, handle: string) {
    try {
      const result = await prisma.stats.findMany({
        where: {
          platform: platform,
          handle: handle,
        },
      });

      if (result.length === 0) {
        return null;
      }

      if (result.length > 1) {
        await prisma.stats.deleteMany({
          where: {
            platform: platform,
            handle: handle,
          },
        });

        return null;
      }

      return result[0];
    } catch (error) {
      throw new DbError("Error getting stats", 500, error);
    }
  }

  async insertStats({
    followers,
    following,
    handle,
    likes,
    platform,
    posts,
  }: DbProps) {
    try {
      const existing = await this.getStats(platform, handle);

      if (existing) {
        await this.updateStats(existing.id, {
          followers,
          following,
          likes,
          posts,
        });
        return;
      }

      await prisma.stats.create({
        data: {
          followers,
          following,
          handle,
          likes,
          platform,
          posts,
        },
      });

      return;
    } catch (error) {
      throw new DbError("Error inserting stats", 500, error);
    }
  }

  private async updateStats(
    id: number,
    { followers, following, likes, posts }: Omit<DbProps, "handle" | "platform">
  ) {
    await prisma.stats.update({
      where: {
        id,
      },
      data: {
        followers,
        following,
        likes,
        posts,
        lastChecked: new Date(),
      },
    });
  }
}

export default DbService;
