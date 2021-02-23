import * as React from "react";

const About: React.FC = () => (
  <div className="about">
    <h1>About</h1>
    <p>
      Hello, my name is Bruno Fernandes, and I write code for fun and profit.
    </p>
    <p>
      I studied Chemical Engineering at university. My interests include
      programming, applied maths and amateur photography -- in that order.
    </p>
    <p>
      I work at Disney Streaming Services in London. The views I express are my
      own, and not those of my employer. And no, I can{"'"}t introduce you to{" "}
      <a href="https://google.com/search?q=baby+yoda">Baby Yoda</a>.
    </p>
    <p>
      You can find the source code for this website on{" "}
      <a href="https://github.com/bfdes/bfdes.in">GitHub</a>.
    </p>
  </div>
);

export default About;
