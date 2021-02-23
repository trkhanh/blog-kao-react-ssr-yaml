type NonEmptyArray<T> = [T, ...T[]];

export class Attributes extends Map<string, string> {
  toString(): string {
    return Array.from(this.entries())
      .map(([key, value]) => `${key}="${value}" `)
      .join("")
      .trim();
  }

  static empty(): Attributes {
    return new Attributes();
  }
}

export interface Tree {
  readonly name: string;
  readonly attributes: Attributes;
}

export class Leaf implements Tree {
  name: string;
  attributes: Attributes;
  content: string;
  constructor(
    name: string,
    content: string,
    attributes: Attributes = Attributes.empty()
  ) {
    this.name = name;
    this.content = content;
    this.attributes = attributes;
  }
  toString(): string {
    const { name, content, attributes } = this;
    if (content && attributes.size) {
      return `<${name} ${attributes}>${content}</${name}>`;
    }
    if (content) {
      return `<${name}>${content}</${name}>`;
    }
    if (attributes.size) {
      return `<${name} ${attributes} />`;
    }
    return `<${name} />`;
  }
}

export class Branch implements Tree {
  name: string;
  attributes: Attributes;
  children: NonEmptyArray<Tree>;
  constructor(
    name: string,
    children: NonEmptyArray<Tree>,
    attributes: Attributes = Attributes.empty()
  ) {
    this.name = name;
    this.children = children;
    this.attributes = attributes;
  }
  toString(): string {
    const { name, attributes, children } = this;
    const content = children.join("");
    const openingTag = attributes.size
      ? `<${name} ${attributes}>`
      : `<${name}>`; // Handle whitespace
    const closingTag = `</${name}>`;
    return `${openingTag}${content}${closingTag}`;
  }
}

export function node(
  name: string,
  content: string | NonEmptyArray<Tree> = "",
  attributes: Attributes = Attributes.empty()
): Tree {
  if (Array.isArray(content)) {
    return new Branch(name, content, attributes);
  }
  return new Leaf(name, content, attributes);
}
