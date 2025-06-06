import { describe, it, expect } from "vitest";
import { h, hString, hFragment, DOM_TYPES } from "../h.js";

describe("h.js", () => {
  describe("h()", () => {
    it("should create a virtual element node", () => {
      const vNode = h("div");
      expect(vNode).toEqual({
        tag: "div",
        props: {},
        children: [],
        type: DOM_TYPES.ELEMENT,
      });
    });

    it("should create a virtual element node with props", () => {
      const props = { id: "my-div", class: "container" };
      const vNode = h("div", props);
      expect(vNode).toEqual({
        tag: "div",
        props: props,
        children: [],
        type: DOM_TYPES.ELEMENT,
      });
    });

    it("should create a virtual element node with string children", () => {
      const vNode = h("p", {}, ["Hello world"]);
      expect(vNode.children).toEqual([
        { type: DOM_TYPES.TEXT, value: "Hello world" },
      ]);
    });

    it("should create a virtual element node with VNode children", () => {
      const childVNode = h("span", {}, ["Child"]);
      const vNode = h("div", {}, [childVNode]);
      expect(vNode.children).toEqual([childVNode]);
    });

    it("should map string children to text nodes", () => {
      const vNode = h("div", {}, ["Text child"]);
      expect(vNode.children).toEqual([
        { type: DOM_TYPES.TEXT, value: "Text child" },
      ]);
    });

    it("should handle mixed string and VNode children", () => {
      const spanVNode = h("span", {}, ["Span text"]);
      const vNode = h("div", {}, ["First text", spanVNode, "Last text"]);
      expect(vNode.children).toEqual([
        { type: DOM_TYPES.TEXT, value: "First text" },
        spanVNode,
        { type: DOM_TYPES.TEXT, value: "Last text" },
      ]);
    });

    it("should filter out null or undefined children", () => {
      const vNode = h("div", {}, [
        "Hello",
        null,
        h("span"),
        undefined,
        "World",
      ]);
      expect(vNode.children.length).toBe(3);
      expect(vNode.children[0]).toEqual({
        type: DOM_TYPES.TEXT,
        value: "Hello",
      });
      expect(vNode.children[1].tag).toBe("span");
      expect(vNode.children[2]).toEqual({
        type: DOM_TYPES.TEXT,
        value: "World",
      });
    });

    it("should use default props and children if not provided", () => {
      const vNode = h("section");
      expect(vNode.props).toEqual({});
      expect(vNode.children).toEqual([]);
    });
  });

  describe("hString()", () => {
    it("should create a virtual text node", () => {
      const textVNode = hString("Hello");
      expect(textVNode).toEqual({
        type: DOM_TYPES.TEXT,
        value: "Hello",
      });
    });
  });

  describe("hFragment()", () => {
    it("should create a virtual fragment node", () => {
      const child1 = h("p", {}, ["Child 1"]);
      const child2 = hString("Child 2");
      const fragmentVNode = hFragment([child1, child2]);

      expect(fragmentVNode).toEqual({
        type: DOM_TYPES.FRAGMENT,
        children: [child1, child2],
      });
    });

    it("should map string children within a fragment to text nodes", () => {
      const fragmentVNode = hFragment(["Text child", h("span")]);
      expect(fragmentVNode.children).toEqual([
        { type: DOM_TYPES.TEXT, value: "Text child" },
        h("span"),
      ]);
    });

    it("should filter out null or undefined children in a fragment", () => {
      const fragmentVNode = hFragment([
        "Hello",
        null,
        h("span"),
        undefined,
        "World",
      ]);
      expect(fragmentVNode.children.length).toBe(3);
    });

    it("should handle an empty array of children for a fragment", () => {
      const fragmentVNode = hFragment([]);
      expect(fragmentVNode.children).toEqual([]);
    });
  });
});
