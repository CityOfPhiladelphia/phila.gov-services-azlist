import Vue from 'vue';
import ServicesList from './ServicesList.vue';

Vue.config.productionTip = false;

new Vue({
  render(h) {
    return h(ServicesList);
  },
}).$mount('#vue-app');



