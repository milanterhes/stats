import axios, { AxiosError } from "axios";
import { z } from "zod";
import { ProfileStatError } from "../utils/errors";
import { logger } from "../utils/logger";

// The fields are nullable in case the selected platform doesn't return them
export const ServiceOutputSchema = z.object({
  followers: z.number().nullable(),
  following: z.number().nullable(),
  posts: z.number().nullable(),
  likes: z.number().nullable(),
});

export type ServiceOutput = z.infer<typeof ServiceOutputSchema>;

abstract class ProfileStatService {
  abstract getProfileStats(handle: string): Promise<ServiceOutput>;
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
  /**
   * Fetches profile statistics for the given handle using Instagram API.
   * @param handle - The handle of the Instagram profile.
   * @returns A Promise that resolves to the profile statistics.
   * @throws {ProfileStatError} If there's an error fetching or parsing the data.
   */
  async getProfileStats(handle: string): Promise<ServiceOutput> {
    let result;
    try {
      result = await axios.get(
        "https://instagram.com/api/v1/users/web_profile_info/?username=" +
          handle,
        {
          // this is a workaround for the instagram api authentication
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 9; GM1903 Build/PKQ1.190110.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.143 Mobile Safari/537.36 Instagram 103.1.0.15.119 Android (28/9; 420dpi; 1080x2260; OnePlus; GM1903; OnePlus7; qcom; sv_SE; 164094539)",
            "X-Ig-App-Id": "936619743392459",
          },
        }
      );
    } catch (error) {
      logger.error(error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new ProfileStatError("Profile not found", 404, error);
      }
      throw new ProfileStatError("Failed to fetch profile stats", 500, error);
    }

    let parsed;
    logger.info(result.data);
    try {
      parsed = InstagramProfileSchema.parse(result.data);
    } catch (error) {
      logger.error(error);
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

const query = `
query GetProfileData($handle: Handle) {
    profile(request: { handle: $handle }) {
      handle
      id
      stats {
        totalFollowers
        totalPosts
        totalFollowing
        totalCollects
      }
    }
  }
  `;

const LensProfileSchema = z.object({
  data: z.object({
    profile: z
      .object({
        stats: z.object({
          totalFollowers: z.number(),
          totalPosts: z.number(),
          totalFollowing: z.number(),
          totalCollects: z.number(),
        }),
      })
      .or(z.null()),
  }),
});

export class LensService extends ProfileStatService {
  /**
   * Fetches profile statistics for the given handle using Lens Protocol API.
   * @param handle - The handle of the profile.
   * @returns A Promise that resolves to the profile statistics.
   * @throws {ProfileStatError} If there's an error fetching or parsing the data.
   */
  async getProfileStats(handle: string): Promise<ServiceOutput> {
    const variables = {
      handle,
    };
    let result;
    try {
      result = await axios.post(
        "https://api.lens.dev/",
        {
          query,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      logger.error(error);
      throw new ProfileStatError("Failed to fetch profile stats", 500, error);
    }

    let parsed;
    try {
      parsed = LensProfileSchema.parse(result.data);
    } catch (error) {
      logger.error(error);
      throw new ProfileStatError("Failed to parse profile stats", 500, error);
    }

    if (parsed.data.profile === null)
      throw new ProfileStatError("Profile not found", 404);

    return {
      followers: parsed.data.profile.stats.totalFollowers,
      following: parsed.data.profile.stats.totalFollowing,
      posts: parsed.data.profile.stats.totalPosts,
      likes: parsed.data.profile.stats.totalCollects,
    };
  }
}
