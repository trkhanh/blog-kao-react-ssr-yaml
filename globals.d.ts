// Common types to be kept in sync on client and server
declare interface PostStub {
  title: string;
  slug: string;
  summary: string;
  wordCount: number;
  tags: string[];
  created: number;
}

declare interface Post extends PostStub {
  body: string;
  previous?: string;
  next?: string;
}

declare type Payload = Post | PostStub[];

// Allows image import in TypeScript
declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*.jpg" {
  const content: string;
  export default content;
}
declare module "*.svg" {
  const content: string;
  export default content;
}

// Read-only build flag set by Webpack
declare const __isBrowser__: boolean;

// Mocked values set in Jest test code
declare namespace NodeJS {
  interface Global {
    __isBrowser__: boolean;
    fetch: jest.Mock;
  }
}

// Data for deferred render supplied by the server
declare interface Window {
  __INITIAL_DATA__: Payload;
}
