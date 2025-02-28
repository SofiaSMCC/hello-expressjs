import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import movieRoutes from "./movie/movie.routes";
import authRoutes from "./auth/auth.routes";
import animeRoutes from "./anime/anime.routes";
import logger from "./logger";
import { CustomError } from "./types/error";

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use((req, _res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode < 400) {
      logger.info(
        `Success response for ${req.method} ${req.url}: ${res.statusCode}`
      );
    }
  });
  next();
});

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use("/anime", animeRoutes);

app.use(
  (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.status || 500;
    logger.error(
      `Error processing request for ${req.method} ${req.url}: ${err.message}`
    );
    res.status(statusCode).json({
      message: "An error occurred",
      error: err.message,
    });
  }
);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
