import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as express from "express";
import { Request, Response } from "express";
import * as logger from "morgan";
import * as path from "path";
import { RequestListener } from "http";

import DB from "shared/db";
import router from "./router";
import { Post } from "globals";

export default function (posts: Post[], mode = "test"): RequestListener {
  const app = express();

  // Apply middleware stack:
  // i) logger
  switch (mode) {
    case "production":
      app.use(logger("common"));
      break;
    case "development":
      app.use(logger("dev"));
  }

  // ii) request parser
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // ii) static server w/ gzip compression
  app.use(compression());
  app.use("/static", express.static(path.resolve(__dirname, "static")));

  // iii) router
  const db = new DB(posts);
  app.use("/", router(db));

  // Error handler
  type RequestError = { status?: number } & Error;

  app.use((err: RequestError, req: Request, res: Response) => {
    res.status(err.status || 500);
    console.error(err.stack);
    const message =
      err.status === 500
        ? "500: Internal Server error"
        : `${err.status}: ${err.message}`;

    res.json({
      error: {
        message,
      },
    });
  });

  return app;
}
