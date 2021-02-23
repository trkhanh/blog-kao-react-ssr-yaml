import * as React from "react";

export default {
  Post: React.createContext<Post>(null),
  Posts: React.createContext<PostStub[]>(null),
};
