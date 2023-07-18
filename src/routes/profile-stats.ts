import { Router } from "express";
import { z } from "zod";
import { zParseRequest } from "../utils";
import { InstagramService } from "../services";

const router = Router();

enum Platform {
  Instagram = "instagram",
  Lens = "lens",
}

const ProfileStatsHandleSchema = z.object({
  params: z.object({
    platform: z.nativeEnum(Platform),
    handle: z.string(),
  }),
});

router.get("/:platform/:handle", async (req, res, next) => {
  try {
    const { params } = await zParseRequest(ProfileStatsHandleSchema, req);
    const instagramService = new InstagramService();
    const stats = await instagramService.getProfileStats(params.handle);
    res.send(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
