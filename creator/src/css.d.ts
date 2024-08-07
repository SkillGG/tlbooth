import type * as CSS from "csstype";

declare module "csstype" {
  interface Properties {
    ["--w"]?: CSS.Properties["width"];
    ["--h"]?: CSS.Properties["height"];
    ["--size"]?: CSS.Properties["width"];
    ["--time"]?: CSS.Properties["animationDuration"];
    ["--accent"]?: CSS.Properties["color"];
    ["--bg"]?: CSS.Properties["backgroundColor"];
    ["--weight"]?: CSS.Properties["borderWidth"];
    ["--outlineColor"]?: CSS.Properties["color"];
  }
}
