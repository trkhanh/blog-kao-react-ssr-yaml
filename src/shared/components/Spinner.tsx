import * as React from "react";
import { Loading } from "shared/images";

const Spinner: React.FC = () => (
  <div className="spinner">
    <img src={Loading} />
  </div>
);

export default Spinner;
