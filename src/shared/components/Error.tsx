import * as React from "react";

type Props = {
  children: string;
};

const Error: React.FC<Props> = ({ children }: Props) => (
  <div className="error">
    <h1>Error</h1>
    <div>{children}</div>
  </div>
);

export default Error;
