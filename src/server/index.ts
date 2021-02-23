import * as http from "http";
import app from "./app";
import { parse } from "path";

// Look for Markdown files in /posts non-recursively
const context = require.context("/posts", false, /\.md$/);

const posts = context.keys().map((filePath) => {
  const slug = parse(filePath).name;
  const post = context(filePath);
  return { ...post, slug };
});

function normalizePort(val: number | string): number | string | boolean {
  const port = typeof val === "string" ? parseInt(val, 10) : val;
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

// Create an app given its posts
const mode = process.env.NODE_ENV;
const server = http.createServer(app(posts, mode));

// Attempt to normalize the port
const port = normalizePort(process.env.PORT || 8080);

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.debug(`Express server listening on ${bind}`);
}

// Listen on provided port, on all network interfaces
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
