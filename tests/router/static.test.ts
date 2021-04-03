import app from "server/app";
import * as request from "supertest";

const server = app([], "test");

test("/about page renders", () => request(server).get("/about").expect(200));
test("404 page renders on fallthrough", () =>
  request(server).get("/random").expect(404));
