type Index = Map<string, number>;

/**
 * In-memory database to query the posts.
 */

export default class DB {
  private posts: Post[];
  private index: Index; // Index to query the posts by slug

  constructor(posts: Post[]) {
    this.posts = posts.sort((a, b) => b.created - a.created);
    this.index = this.posts.reduce(
      (index, post, i) => index.set(post.slug, i),
      new Map()
    );
  }

  public list(tag?: string): PostStub[] {
    const stubs = this.posts.map(({ body, ...stub }) => stub);
    if (tag === undefined) {
      return stubs;
    }
    return stubs.filter((p) => p.tags.includes(tag));
  }

  public get(slug: string): Post {
    const index = this.index.get(slug);
    if (index === undefined) {
      return null; // Not found
    }
    let previous;
    let next;
    if (index > 0) {
      next = this.posts[index - 1].slug;
    }
    if (index < this.posts.length - 1) {
      previous = this.posts[index + 1].slug;
    }
    return {
      previous,
      next,
      ...this.posts[index],
    };
  }
}
