import { withMeta } from "express-zod-api";
import { z } from "zod";
import {
  InstagramService,
  LensService,
  ServiceOutputSchema,
} from "../services";
import { endpointFactory } from "../utils/api";
import { Platform } from "@prisma/client";
import DbService from "../services/db";

const ProfileStatsHandleSchema = withMeta(
  z.object({
    platform: z.nativeEnum(Platform),
    handle: z.string(),
  })
)
  .example({
    handle: "georgehotz",
    platform: Platform.instagram,
  })
  .example({
    handle: "aaveaave.lens",
    platform: Platform.lens,
  });

const route = endpointFactory.build({
  description:
    "Get profile statistics such as followers, following, posts, and likes.",
  method: "get",
  input: ProfileStatsHandleSchema,
  output: ServiceOutputSchema,
  handler: async ({ input: { platform, handle } }) => {
    const dbService = new DbService();
    const cachedStats = await dbService.getStats(platform, handle);

    // if lastChecked is not older than 1 minute
    if (
      cachedStats?.lastChecked &&
      cachedStats.lastChecked > new Date(Date.now() - 60000)
    ) {
      return cachedStats;
    }

    const statService =
      platform === Platform.instagram
        ? new InstagramService()
        : new LensService();

    const stats = await statService.getProfileStats(handle);

    await dbService.insertStats({
      platform,
      handle,
      followers: stats.followers,
      following: stats.following,
      likes: stats.likes,
      posts: stats.posts,
    });

    return stats;
  },
});

export default route;
