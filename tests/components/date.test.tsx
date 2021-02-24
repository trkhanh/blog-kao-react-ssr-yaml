import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import Date from "shared/components/Date";

describe("<Date />", () => {
  let container: HTMLDivElement = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("renders UNIX birthday", () => {
    act(() => {
      render(<Date timestamp={0} />, container);
    });

    expect(container.textContent).toBe("1 January 1970");
  });

  it("renders current time", () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const now = new global.Date();

    const day = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    act(() => {
      render(<Date timestamp={now.getTime()} />, container);
    });
    expect(container.textContent).toBe(`${day} ${month} ${year}`);
  });
});
