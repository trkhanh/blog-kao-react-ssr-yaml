import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import Tags from "src/shared/components/Tags";

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

describe("<Tags/>", () => {
    it("renders emply span for a post with no tags", () => {
        //Edge case
        act(() => {
            render(
                <MemoryRouter>
                    <Tags tags={[]} />
                </MemoryRouter>,
                container
            );
        });
        expect(container.querySelectorAll("a")).toHaveLength(0);
    });

    it("renders a single tag", () => {
        const tags = ["Algorithms"];
        act(() => {
            render(
                <MemoryRouter>
                    <Tags tags={tags} />
                </MemoryRouter>,
                container
            );
        });
        expect(container.querySelectorAll("a")).toHaveLength(1);
    });

    it('renders multiple tags', () => {
        const tags = ["Algorithms", "Python"];
        act(() => {
            render(
                <MemoryRouter>
                    <Tags tags={tags} />
                </MemoryRouter>,
                container
            );
        });
        expect(container.querySelectorAll("a")).toHaveLength(tags.length);
    })
});

describe("<Tag/>", () => {
    it('navigates to correct route when clicked', () => {
        const tags = ["Algorithms", "Python"];

        act(() => {
            render(
                <MemoryRouter>
                    <Tags tags={tags} />
                </MemoryRouter>,
                container
            )
        });

        const firstLink = container.querySelector("a").href
        expect(firstLink.endsWith(`/post?tag=${tags[0]}`))
    })
})
