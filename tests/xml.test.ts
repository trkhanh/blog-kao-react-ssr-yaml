import { Attributes, node } from "server/xml";

const attributes = new Attributes([
  ["key1", "value1"],
  ["key2", "value2"],
]);

describe("Leaf.toString", () => {
  it("serializes attributes", () => {
    const leaf = node("leaf", "content", attributes);
    expect(leaf.toString()).toMatch(/^<leaf key1="value1" key2="value2"/);
  });
});
