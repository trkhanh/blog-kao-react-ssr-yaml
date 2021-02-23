import * as React from "react";
import { useParams } from "react-router";

type Props = {
  slug: string;
};

export default function (Component: React.FC<Props>) {
  return function WithSlug(reset: Record<string, unknown>): React.ReactElement {
    const { slug } = useParams();
    return <Component slug={slug} {...reset}></Component>;
  };
}
