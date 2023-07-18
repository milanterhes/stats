import axios, { AxiosError, AxiosHeaders } from "axios";
import { InstagramService, LensService, ServiceOutput } from "../src/services";

const axios404Error = new AxiosError(
  "",
  "404",
  {
    headers: new AxiosHeaders(),
  },
  {},
  {
    status: 404,
    statusText: "Not Found",
    config: {
      headers: new AxiosHeaders(),
    },
    data: {},
    headers: {},
  }
);

describe("InstagramService", () => {
  it("should fetch and parse profile stats correctly", async () => {
    const handle = "some_instagram_handle";
    const service = new InstagramService();

    const axiosMockResponse = {
      data: {
        data: {
          user: {
            edge_follow: { count: 100 },
            edge_followed_by: { count: 200 },
            edge_owner_to_timeline_media: { count: 50 },
          },
        },
      },
    };

    jest.spyOn(axios, "get").mockResolvedValue(axiosMockResponse);

    const profileStats: ServiceOutput = await service.getProfileStats(handle);

    expect(profileStats).toEqual({
      followers: 200,
      following: 100,
      posts: 50,
      likes: null,
    });
  });

  it("should handle the 404 error correctly", async () => {
    const handle = "non_existent_instagram_handle";
    const service = new InstagramService();

    jest.spyOn(axios, "get").mockRejectedValue(axios404Error);

    await expect(service.getProfileStats(handle)).rejects.toThrowError(
      "Profile not found"
    );
  });

  it("should handle the 500 error correctly when parsing", async () => {
    const handle = "some_instagram_handle";
    const service = new InstagramService();

    const axiosMockResponse = {
      data: {
        data: {
          user: {
            edge_follow: { count: 100 },
            edge_followed_by: { count: 200 },
            // Missing "edge_owner_to_timeline_media" field to trigger the parsing error
          },
        },
      },
    };

    jest.spyOn(axios, "get").mockResolvedValue(axiosMockResponse);

    await expect(service.getProfileStats(handle)).rejects.toThrowError(
      "Failed to parse profile stats"
    );
  });
});

describe("LensService", () => {
  it("should fetch and parse profile stats correctly", async () => {
    const handle = "some_lens_handle";
    const service = new LensService();

    const axiosMockResponse = {
      data: {
        data: {
          profile: {
            stats: {
              totalFollowers: 300,
              totalFollowing: 150,
              totalPosts: 75,
              totalCollects: 25,
            },
          },
        },
      },
    };

    jest.spyOn(axios, "post").mockResolvedValue(axiosMockResponse);

    const profileStats: ServiceOutput = await service.getProfileStats(handle);

    expect(profileStats).toEqual({
      followers: 300,
      following: 150,
      posts: 75,
      likes: 25,
    });
  });

  it("should handle the 404 error correctly", async () => {
    const handle = "non_existent_lens_handle";
    const service = new LensService();

    jest.spyOn(axios, "post").mockResolvedValue({
      data: {
        data: {
          profile: null,
        },
      },
    });

    await expect(service.getProfileStats(handle)).rejects.toThrowError(
      "Profile not found"
    );
  });

  it("should handle the 500 error correctly when parsing", async () => {
    const handle = "some_lens_handle";
    const service = new LensService();

    const axiosMockResponse = {
      data: {
        data: {
          // Missing "profile" field to trigger the parsing error
        },
      },
    };

    jest.spyOn(axios, "post").mockResolvedValue(axiosMockResponse);

    await expect(service.getProfileStats(handle)).rejects.toThrowError(
      "Failed to parse profile stats"
    );
  });
});
