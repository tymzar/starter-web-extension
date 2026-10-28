import React from "react";
import { createRoot } from "react-dom/client";

import { PageRoot } from "../../components/page-root/page-root";
import { Popup } from "./popup";

const container = document.querySelector("#root");

if (!container) {
  throw new Error("Could not find the root element!");
}

const root = createRoot(container);
root.render(
  <PageRoot>
    <Popup />
  </PageRoot>,
);
