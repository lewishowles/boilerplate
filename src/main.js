import "./assets/css/main.css";

import { createApp } from "vue";
import components from "@lewishowles/components";

import App from "./App.vue";
import router from "./router/index.js";

const app = createApp(App);

app.use(components);
app.use(router);
app.mount("#app");
