import "./assets/css/main.css";

import { PiniaColada } from "@pinia/colada";
import { createApp } from "vue";
import { createPinia } from "pinia";
import components from "@lewishowles/components";

import App from "./App.vue";
import router from "./router/index.js";

const app = createApp(App);
const pinia = createPinia();

app.use(components);
app.use(pinia);
app.use(PiniaColada);
app.use(router);
app.mount("#app");
