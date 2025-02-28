import express from "express";
import { authenticateJWT } from "../auth/auth.controller";
import {
  animeByGenre,
  fetchAllData,
  fetchAnime,
  fetchAnimeCharacters,
  animeByWords,
  animeEpisodes,
} from "./anime.controller";

const router = express.Router();

router.use(authenticateJWT);

router.get("/", fetchAllData);
router.get("/:id", fetchAnime);
router.get("/genre/:genreName", animeByGenre);
router.get("/search/:query", animeByWords);
router.get("/:anime/episodes", animeEpisodes);
router.get("/:anime/characters", fetchAnimeCharacters);

export default router;
