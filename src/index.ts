import express from "express";
import bodyParser from "body-parser";
import movieRoutes from "./movie/movie.routes";
import authRoutes from "./auth/auth.routes";
import animeRoutes from "./anime/anime.routes";
import logger from "./logger";

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use((req, _res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use("/anime", animeRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
