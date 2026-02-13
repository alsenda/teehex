import { mount } from "svelte";
import App from "./App.svelte";
import "./styles.css";

const target = document.getElementById("app");
if (target === null) {
  throw new Error("Root element not found");
}

mount(App, { target });
