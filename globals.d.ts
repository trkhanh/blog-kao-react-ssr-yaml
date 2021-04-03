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
declare module "*.png";

// Read-only build flag set by Webpack
declare const __isBrowser__: boolean;

export interface Global {
  document: Document;
  window: Window;
}

declare const global: Global;