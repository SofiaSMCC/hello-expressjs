import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  fetchAllData,
  fetchAnime,
  animeByGenre,
  animeByWords,
  animeEpisodes,
  fetchAnimeCharacters,
} from "../anime/anime.controller";
import { authenticateJWT } from "../auth/auth.controller";
import { CustomError } from "../types/error";

const app = express();
app.use(express.json());
app.use(authenticateJWT);

app.get("/anime", fetchAllData);
app.get("/anime/:id", fetchAnime);
app.get("/anime/genre/:genreName", animeByGenre);
app.get("/anime/search/:query", animeByWords);
app.get("/anime/:anime/episodes", animeEpisodes);
app.get("/anime/:anime/characters", fetchAnimeCharacters);

// Use to simulate axios for testing
jest.mock("axios", () => ({
  get: jest.fn(),
}));

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error("Secret Key is not defined");
}

const token = jwt.sign({ username: "testuser" }, secretKey, {
  expiresIn: "1h",
});

// Handling Errors
app.use(
  (err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      message: "An error occurred",
      error: err.message,
    });
  }
);

describe("anime controller", () => {
  test("should fetch anime by genre with pagination", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({
      data: {
        data: [
          {
            mal_id: 1,
            title: "Cowboy Bebop",
            genres: [{ name: "action" }],
            year: "1998",
            images: "https://example.com/cowboybebop.jpg",
          },
          {
            mal_id: 2,
            title: "Samurai Champloo",
            genres: [{ name: "action" }],
            year: "2004",
            images: "https://example.com/samuraichamploo.jpg",
          },
        ],
      },
    });

    const response = await request(app)
      .get("/anime/genre/action?page=1&limit=1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      result: [
        {
          id: 1,
          title: "Cowboy Bebop",
          image: "https://example.com/cowboybebop.jpg",
          year: "1998",
        },
      ],
      pagination: {
        currentPage: 1,
        hasNextPage: true,
      },
    });
  });

  test("should fetch anime by words with pagination", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({
      data: {
        data: [
          {
            mal_id: 1,
            title: "Naruto",
            images: "https://example.com/naruto.jpg",
            year: "2002",
          },
          {
            mal_id: 2,
            title: "Naruto Shippuden",
            images: "https://example.com/narutoshippuden.jpg",
            year: "2007",
          },
          {
            mal_id: 3,
            title: "Naruto: Boruto Next Generations",
            images: "https://example.com/boruto.jpg",
            year: "2017",
          },
        ],
      },
    });

    const response = await request(app)
      .get("/anime/search/naruto?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      animes: [
        {
          id: 1,
          title: "Naruto",
          image: "https://example.com/naruto.jpg",
          year: "2002",
        },
        {
          id: 2,
          title: "Naruto Shippuden",
          image: "https://example.com/narutoshippuden.jpg",
          year: "2007",
        },
      ],
      pagination: {
        currentPage: 1,
        hasNextPage: true,
      },
    });
  });

  test("should fetch anime episodes with pagination", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 1, title: "Naruto" }],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: {
              episodes: [
                {
                  mal_id: 101,
                  url: "https://www.crunchyroll.com/naruto/episode-1-enter-naruto-uzumaki-520",
                  images: [
                    {
                      jpg: {
                        image_url:
                          "https://img1.ak.crunchyroll.com/i/spire3/1a41a51fef4d8475b2d1d3d5f4e9efb41482646269_full.jpg",
                      },
                    },
                  ],
                },
                {
                  mal_id: 102,
                  url: "https://www.crunchyroll.com/naruto/episode-2-my-name-is-konohamaru-521",
                  images: [
                    {
                      jpg: {
                        image_url:
                          "https://img1.ak.crunchyroll.com/i/spire1/d3f4f1e3f4cda1e1f4b4edadf3ed9d521482646269_full.jpg",
                      },
                    },
                  ],
                },
              ],
            },
          },
        })
      );

    const response = await request(app)
      .get("/anime/Naruto/episodes?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      episodes: [
        {
          id: 101,
          url: "https://www.crunchyroll.com/naruto/episode-1-enter-naruto-uzumaki-520",
          image: [
            {
              jpg: {
                image_url:
                  "https://img1.ak.crunchyroll.com/i/spire3/1a41a51fef4d8475b2d1d3d5f4e9efb41482646269_full.jpg",
              },
            },
          ],
        },
        {
          id: 102,
          url: "https://www.crunchyroll.com/naruto/episode-2-my-name-is-konohamaru-521",
          image: [
            {
              jpg: {
                image_url:
                  "https://img1.ak.crunchyroll.com/i/spire1/d3f4f1e3f4cda1e1f4b4edadf3ed9d521482646269_full.jpg",
              },
            },
          ],
        },
      ],
      pagination: {
        currentPage: 1,
        hasNextPage: false,
      },
    });
  });

  test("should fetch anime characters", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 1, title: "Naruto" }],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [
              {
                character: {
                  mal_id: 201,
                  name: "Naruto Uzumaki",
                  images: [
                    {
                      jpg: {
                        image_url:
                          "https://img1.ak.crunchyroll.com/i/spire3/1a41a51fef4d8475b2d1d3d5f4e9efb41482646269_full.jpg",
                      },
                    },
                  ],
                },
              },
              {
                character: {
                  mal_id: 202,
                  name: "Sasuke Uchiha",
                  images: [
                    {
                      jpg: {
                        image_url:
                          "https://img1.ak.crunchyroll.com/i/spire1/d3f4f1e3f4cda1e1f4b4edadf3ed9d521482646269_full.jpg",
                      },
                    },
                  ],
                },
              },
            ],
          },
        })
      );

    const response = await request(app)
      .get("/anime/Naruto/characters")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      characters: [
        {
          id: 201,
          name: "Naruto Uzumaki",
          image: [
            {
              jpg: {
                image_url:
                  "https://img1.ak.crunchyroll.com/i/spire3/1a41a51fef4d8475b2d1d3d5f4e9efb41482646269_full.jpg",
              },
            },
          ],
        },
        {
          id: 202,
          name: "Sasuke Uchiha",
          image: [
            {
              jpg: {
                image_url:
                  "https://img1.ak.crunchyroll.com/i/spire1/d3f4f1e3f4cda1e1f4b4edadf3ed9d521482646269_full.jpg",
              },
            },
          ],
        },
      ],
    });
  });

  // Error Tests

  test("should return 404 if anime ID not found", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: null });

    const response = await request(app)
      .get("/anime/123")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Anime not found",
    });
  });

  test("should return 400 if genre name is missing", async () => {
    const axios = require("axios");
    const error: CustomError = new Error("Genre name is required");
    error.status = 400;
    axios.get.mockRejectedValue(error);

    const response = await request(app)
      .get("/anime/genre/")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Genre name is required",
    });
  });

  test("should return 404 if anime by genre not found", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { data: [] } });

    const response = await request(app)
      .get("/anime/genre/horror123")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "No anime found for genre: horror123",
    });
  });

  test("should return 400 if search query is missing", async () => {
    const axios = require("axios");
    const error: CustomError = new Error("Query is required");
    error.status = 400;
    axios.get.mockRejectedValue(error);

    const response = await request(app)
      .get("/anime/search/")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Query is required",
    });
  });

  test("should return 404 if anime by search query not found", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { data: [] } });

    const response = await request(app)
      .get("/anime/search/nonexistentquery")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Anime not found",
    });
  });

  test("should return 404 if episodes not found", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 20, title: "Naruto" }],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: {
              episodes: [],
            },
          },
        })
      );

    const response = await request(app)
      .get("/anime/Naruto/episodes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Episodes not found",
    });
  });

  test("should return 404 if characters not found", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 20, title: "Naruto" }],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [],
          },
        })
      );

    const response = await request(app)
      .get("/anime/Naruto/characters")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Characters not found",
    });
  });
});
