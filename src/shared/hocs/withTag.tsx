import * as React from "react";
import { useLocation } from "react-router-dom";

/** Method to parse query compatible with client and server. Ref: https://stackoverflow.com/a/3855394/4981237 */
function parseQuery(queryString: string): Map<string, string> {
  return (/^[?#]/.test(queryString) ? queryString.slice(1) : queryString)
    .split("&")
    .reduce((params, param) => {
      const [key, value] = param.split("=");
      const decoded = value
        ? decodeURIComponent(value.replace(/\+/g, " "))
        : "";
      return params.set(key, decoded);
    }, new Map());
}

type Props = {
  tag?: string;
};

export default function (Component: React.FC<Props>) {
  return function WithTag(rest: Record<string, unknown>): React.ReactElement {
    const location = useLocation();
    const query = parseQuery(location.search);
    return <Component tag={query.get("tag")} {...rest} />;
  };
}
