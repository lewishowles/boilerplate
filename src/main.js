import "./assets/css/main.css";

import { PiniaColada } from "@pinia/colada";
import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "@/App.vue";
import router from "@/router";

// Root Vue application instance.
const app = createApp(App);
// Pinia store instance shared by the application.
const pinia = createPinia();

app.use(pinia);
app.use(PiniaColada);
app.use(router);
app.mount("#app");
