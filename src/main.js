import Vue from 'vue';
import VueRouter from 'vue-router';
import ServicesList from './ServicesList.vue';
import { i18n } from './i18n.js';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'main',
    },
  ],
});

new Vue({
  router,
  i18n,
  render(h) {
    return h(ServicesList);
  },
}).$mount('#vue-app');



