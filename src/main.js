import "./assets/css/main.css";

import { createApp } from "vue";
import components from "@lewishowles/components";

import App from "./App.vue";

const app = createApp(App);

app.use(components);
app.mount("#app");
