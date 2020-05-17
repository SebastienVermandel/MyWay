import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import VueGtag from "vue-gtag";

Vue.config.productionTip = false;

Vue.use(VueGtag, {
  config: { id: "UA-166921881-1" }
});

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
