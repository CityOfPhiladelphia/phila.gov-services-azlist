import Vue from 'vue';
import AzList from './AzList.vue';
import axios from 'axios';


Vue.config.productionTip = false;


async function getAzListCategories() {
  return axios.get(process.env.VUE_APP_CAT_API).then((response) => {
    return response.data;
  });
}

async function getAzList() {
  return axios.get(process.env.VUE_APP_DIR_API).then((response) => {
    return response.data.map((item) => {

      let categories = item.categories.map((cat) => {
        
        if (cat) {
          return cat.slug;
        }

        return '';
        
      });

      return {
        title: item.title,
        link: item.link,
        desc: item.desc,
        categories,
      };
    });
  });
}

async function initAzList() {

  const categories = await getAzListCategories();
  const list = await getAzList();

  new Vue({
    render(h) {
      return h(AzList, {
        props: {
          categories,
          list,
        },
      });
    },
  }).$mount('#vue-app');

}

initAzList();


