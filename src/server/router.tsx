import { Router } from "express";
import * as React from "react";
import { renderToNodeStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

import { App } from "shared/containers";
import { Context } from "shared/containers";
import DB from "shared/db";
import { Favicon } from "shared/images";
import { node, Attributes } from "./xml";

const header = (initialData: Payload): string => {
  return `
      <meta charset="utf8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="theme-color" content="#202020">
      <meta name="description" content="Personal blog">
      <meta name="author" content="Bruno Fernandes">
      <title>kao</title>
      <link href=${Favicon} rel="icon">
      <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono&display=swap" rel="stylesheet">
      <link href="https://unpkg.com/highlight.js@10.3.1/styles/github.css" rel="stylesheet">
      <link href="https://unpkg.com/katex@0.12.0/dist/katex.min.css" rel="stylesheet">
      <link href="/static/styles/main.css" rel="stylesheet">
      <script src='/static/javascripts/bundle.js' defer></script>
      <script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>
    `;
};

export default function (db: DB): Router {
  const router = Router();

  router.get("/about", (req, res) => {
    const stream = renderToNodeStream(
      <StaticRouter location={req.url}>
        <App></App>
      </StaticRouter>
    );

    res.write(
      `<!DOCTYPE html><html lang="en"><head>${header(
        null
      )}</head><body><div id="root">`
    );

    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET / is an alias for GET /posts
  router.get("/", (req, res) => {
    const posts = db.list();
    console.log('posts', posts);
    
    const stream = renderToNodeStream(
      <StaticRouter location={req.url}>
        <Context.Posts.Provider value={posts}>
          <App />
        </Context.Posts.Provider>
      </StaticRouter>
    );

    res.write(
      `<!DOCTYPE html><html lang="en"><head>${header(
        posts
      )}</head><body><div id="root">`
    );
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET /posts?tag=<tag>
  router.get("/posts", (req, res) => {
    const tag = req.query.tag as string;
    const posts = db.list(tag);

    const stream = renderToNodeStream(
      <StaticRouter location={req.url}>
        <Context.Posts.Provider value={posts}>
          <App />
        </Context.Posts.Provider>
      </StaticRouter>
    );

    res.write(
      `<!DOCTYPE html><html lang="en"><head>${header(
        posts
      )}</head><body><div id="root">`
    );
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET /posts/<slug>
  router.get("/posts/:slug", (req, res) => {
    const { slug } = req.params;
    const postOrNone = db.get(slug);

    const stream = renderToNodeStream(
      <StaticRouter location={req.url}>
        <Context.Post.Provider value={postOrNone}>
          <App />
        </Context.Post.Provider>
      </StaticRouter>
    );
    res.status(postOrNone ? 200 : 404);
    res.write(
      `<!DOCTYPE html><html lang="en"><head>${header(
        postOrNone
      )}</head><body><div id="root">`
    );
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });

  // GET /api/posts?tag=<tag>
  // Fetch the posts in chronological order and filter by tag if supplied
  router.get("/api/posts", (req, res) => {
    const tag = req.query.tag as string;
    const posts = db.list(tag);
    res.json(posts);
  });

  // GET /api/posts/<slug>
  // Fetch a single post; these are uniquely identfied by their slugs
  router.get("/api/posts/:slug", (req, res) => {
    const { slug } = req.params;
    const postOrNone = db.get(slug);
    if (postOrNone) {
      res.json(postOrNone);
    } else {
      res.status(404).json({
        error: {
          message: "404: No post with that slug",
        },
      });
    }
  });

  // GET /feed.rss
  router.get("/feed.rss|/feed.xml|/rss.xml", (_, res) => {
    const recentPosts = db.list().slice(0, 10);
    const title = node("title", "kaoengine.in");
    const link = node("link", "https://www.kaoengine.in");
    const description = node("description", "Programming and Technology blog");
    const items = recentPosts.map(({ created, slug, title, summary }) => {
      const date = new Date(created);
      const url = `https://www.kaoengine.in/posts/${slug}`;
      return node("item", [
        node("title", title),
        node("author", "Bruno Fernandes"),
        node("description", summary),
        node("link", url),
        node("guid", url),
        node("pubDate", date.toUTCString()),
      ]);
    });
    const channel = node("channel", [title, link, description, ...items]);
    const rss = node("rss", [channel], new Attributes([["version", "1.0"]]));
    const prolog = `<?xml version="1.0" encoding="utf-8"?>`;
    res.type("application/xml");
    res.send(`${prolog}${rss}`);
  });

  // 404 handler
  router.get("*", (req, res) => {
    const stream = renderToNodeStream(
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    );
    res.status(404);
    res.write(
      `<!DOCTYPE html><html lang="en"><head>${header(
        null
      )}</head><body><div id="root">`
    );
    stream.pipe(res, { end: false });
    stream.on("end", () => res.end("</div></body></html>"));
  });
  return router;
}
