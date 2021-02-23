import * as React from "react";
import { Link } from "react-router-dom";

type Tag = {
  value: string;
};

const Tag: React.FC<Tag> = ({ value }: Tag) => (
  <Link to={`/posts?tag=${value}`}> {value}</Link>
);

type Tags = {
  tags: string[];
};

const Tags: React.FC<Tags> = ({ tags }: Tags) => (
  <span>
    {tags
      .map((tag) => <Tag key={tag} value={tag}></Tag>)
      .reduce((acc, tag) => [...acc, "#", tag], [])}
  </span>
);

export default Tags;
