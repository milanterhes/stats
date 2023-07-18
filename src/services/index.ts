import axios, { AxiosError } from "axios";
import { z } from "zod";
import { ProfileStatError } from "../utils";

interface ProfileStat {
  followers: number | null;
  following: number | null;
  posts: number | null;
  likes: number | null;
}

abstract class ProfileStatService {
  abstract getProfileStats(handle: string): Promise<ProfileStat>;
}

const InstagramProfileSchema = z.object({
  data: z.object({
    user: z.object({
      edge_follow: z.object({
        count: z.number(),
      }),
      edge_followed_by: z.object({
        count: z.number(),
      }),
      edge_owner_to_timeline_media: z.object({
        count: z.number(),
      }),
    }),
  }),
});

export class InstagramService extends ProfileStatService {
  async getProfileStats(handle: string): Promise<ProfileStat> {
    let result;
    try {
      result = await axios.get(
        "https://i.instagram.com/api/v1/users/web_profile_info/?username=" +
          handle,
        {
          // this is a workaround for the instagram api authentication
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 9; GM1903 Build/PKQ1.190110.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36 Instagram 103.1.0.15.119 Android (28/9; 420dpi; 1080x2260; OnePlus; GM1903; OnePlus7; qcom; sv_SE; 164094539)",
          },
        }
      );
    } catch (error) {
      throw new ProfileStatError("Failed to fetch profile stats", 500, error);
    }

    let parsed;
    try {
      parsed = InstagramProfileSchema.parse(result.data);
    } catch (error) {
      throw new ProfileStatError("Failed to parse profile stats", 500, error);
    }

    return {
      followers: parsed.data.user.edge_followed_by.count,
      following: parsed.data.user.edge_follow.count,
      posts: parsed.data.user.edge_owner_to_timeline_media.count,
      likes: null,
    };
  }
}
