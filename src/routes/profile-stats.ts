import { withMeta } from "express-zod-api";
import { z } from "zod";
import {
  InstagramService,
  LensService,
  ServiceOutputSchema,
} from "../services";
import { BaseError } from "../utils";
import { endpointFactory } from "../utils/api";

enum Platform {
  Instagram = "instagram",
  Lens = "lens",
}

const ProfileStatsHandleSchema = withMeta(
  z.object({
    platform: z.nativeEnum(Platform),
    handle: z.string(),
  })
)
  .example({
    handle: "georgehotz",
    platform: Platform.Instagram,
  })
  .example({
    handle: "aave.lens",
    platform: Platform.Lens,
  });

const route = endpointFactory.build({
  description:
    "Get profile statistics such as followers, following, posts, and likes.",
  method: "get",
  input: ProfileStatsHandleSchema,
  output: ServiceOutputSchema,
  handler: async ({ input: { platform, handle }, options, logger }) => {
    logger.debug("Options:", options);
    const service =
      platform === Platform.Instagram
        ? new InstagramService()
        : new LensService();
    const stats = await service.getProfileStats(handle);
    return stats;
  },
});

export default route;
