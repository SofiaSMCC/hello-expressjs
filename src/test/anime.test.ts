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

app.use(
  (err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      message: "An error occurred",
      error: err.message,
    });
  }
);

describe("Anime Controller", () => {
  it("should fetch all data", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { data: [] } });

    const response = await request(app)
      .get("/anime")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it("should fetch anime by ID", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { id: 1, title: "Example Anime" } });

    const response = await request(app)
      .get("/anime/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, title: "Example Anime" });
  });

  it("should fetch anime by genre", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({
      data: {
        data: [
          { mal_id: 1, title: "Example Anime", genres: [{ name: "action" }] },
        ],
      },
    });

    const response = await request(app)
      .get("/anime/genre/action")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      result: [
        { id: 1, title: "Example Anime", image: undefined, year: undefined },
      ],
    });
  });

  it("should fetch anime by words", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({
      data: { data: [{ mal_id: 1, title: "Example Anime" }] },
    });

    const response = await request(app)
      .get("/anime/search/example")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      animes: [
        { id: 1, title: "Example Anime", image: undefined, year: undefined },
      ],
    });
  });

  it("should fetch anime episodes", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 1, title: "Example Anime" }],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: {
              episodes: [
                { mal_id: 101, url: "http://example.com/episode1", images: {} },
              ],
            },
          },
        })
      );

    const response = await request(app)
      .get("/anime/Example Anime/episodes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      episodes: [{ id: 101, url: "http://example.com/episode1", image: {} }],
    });
  });

  it("should fetch anime characters", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 1, title: "Example Anime" }],
          },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [
              { character: { mal_id: 201, name: "Character 1", images: {} } },
            ],
          },
        })
      );

    const response = await request(app)
      .get("/anime/Example Anime/characters")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      characters: [{ id: 201, name: "Character 1", image: {} }],
    });
  });

  // Tests de error

  it("should return 404 if anime ID not found", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: null });

    const response = await request(app)
      .get("/anime/999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Anime not found",
    });
  });

  it("should return 400 if genre name is missing", async () => {
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

  it("should return 404 if anime by genre not found", async () => {
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { data: [] } });

    const response = await request(app)
      .get("/anime/genre/nonexistentgenre")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "No anime found for genre: nonexistentgenre",
    });
  });

  it("should return 400 if search query is missing", async () => {
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

  it("should return 404 if anime by search query not found", async () => {
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

  it("should return 404 if episodes not found", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 1, title: "Example Anime" }],
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
      .get("/anime/Example Anime/episodes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Episodes not found",
    });
  });

  it("should return 404 if characters not found", async () => {
    const axios = require("axios");
    axios.get
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            data: [{ mal_id: 1, title: "Example Anime" }],
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
      .get("/anime/Example Anime/characters")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "An error occurred",
      error: "Characters not found",
    });
  });
});
