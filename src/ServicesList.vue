<template>
  <div class="service directory">
    <div class="row">
      <template v-if="!loaded">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin fa-3x loadingdir" />
        </div>
      </template>
      <template v-else>
        <div
          class="medium-7 columns show-for-medium filter"
          data-desktop-filter-wrapper=""
        >
          <h2 class="h4 mtn">
            {{ options.labels.filterByText }}
          </h2> 
          <form>
            <ul class="no-bullet pan">
              <li>
                <input
                  id="all"
                  type="checkbox"
                  :checked="defaultCheckboxChecked"
                  @change="uncheckAllCheckboxes();updateResultsList()"
                >
                <label for="all">
                  {{ options.labels.defaultCheckboxLabel }}
                </label>
              </li>
              <li
                v-for="listItem in categories"
                :key="listItem.slug"
              >
                <input
                  :id="listItem.slug"
                  v-model="checkedItems"
                  type="checkbox"
                  :value="listItem.slug"
                  @change="updateResultsList()"
                >
                <label :for="listItem.slug">
                  {{ listItem.name }}
                </label>
              </li>
            </ul>
          </form>
        </div>
        <div
          id="a-z-filter-list"
          class="medium-16 columns results a-z-list"
        >
          <div
            v-if="options.searchBox"
            class="search"
          >
            <input
              v-model="options.searchValue"
              class="search-field"
              type="text"
              :placeholder="options.labels.searchPlaceholder"
              @keyup="updateResultsList()"
              @keydown.enter.prevent=""
            >
          </div>
          <nav
            v-if="options.azAnchors && options.azGroup"
            class="show-for-medium"
          >
            <ul class="inline-list mbm pan mln h4">
              <li
                v-for="letter in alphabetLetters"
                :key="letter"
              >
                <a
                  v-scroll-to="getScrollToSettings(letter)"
                  href="#"
                  :disabled="isLetterInResults(letter)"
                  :aria-disabled="isLetterInResults(letter)"
                >
                  {{ letter }}
                </a>
              </li>
            </ul>
          </nav>
          <div class="list">
            <template v-if="hasResults()">
              <template v-if="options.azGroup">
                <div
                  v-for="(listValue, letter) in resultsList"
                  :key="letter"
                >
                  <div class="row collapse a-z-group">
                    <hr
                      :id="'l-' + letter"
                      class="letter separator"
                      :data-alphabet="numericLetterFilter(letter)"
                    >
                    <div class="small-20 medium-24 columns">
                      <div class="small-21 columns result mvm">
                        <div
                          v-for="(listItem, index) in listValue"
                          :key="'g-' + letter + index"
                        >
                          <a :href="listItem.link">
                            {{ listItem.title }}
                          </a>
                          <p class="hide-for-small-only mbl">
                            {{ listItem.desc }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="small-20 medium-24 columns">
                  <div
                    v-for="(listItem, lIndex) in resultsList"
                    :key="'l-' + lIndex"
                  >
                    <a :href="listItem.link">
                      {{ listItem.title }}
                    </a>
                    <p class="hide-for-small-only mbl">
                      {{ listItem.desc }}
                    </p>
                  </div>
                </div>
              </template>
            </template>
            <template v-else>
              <div class="nothing-found h3">
                {{ options.labels.noResultsMsg }}
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>

import Vue from 'vue';
import VueScrollTo from 'vue-scrollto';
import deepMerge from 'lodash/merge';
import Fuse from 'fuse.js';
import axios from 'axios';

Vue.prototype.$search = function (term, list, options) {
  return new Promise(function (resolve, reject) {
    var run = new Fuse(list, options);
    var results = run.search(term);
    resolve(results);
  });
};

Vue.use(VueScrollTo);

export default {
  name: 'Azlist',
  data() {
    return {
      alphabet: 'abcdefghijklmnopqrstuvwxyz#',
      categories: [],
      checkedItems: [],
      defaultCheckboxChecked: true,
      loaded: false,
      options: {
        azAnchors: true, //display a-z anchors, azGroup must also be true
        azGroup: true, //group results by a-z
        fuseSearchOptions: {
          keys: [
            'title',
            'desc',
          ],
          threshold: 0.2,
          // tokenize: true, 
          shouldSort: true,
        },
        labels: {
          noResultsMsg: `Sorry, we couldn't find anything for that search. Please try different terms.`,
          searchPlaceholder: 'Begin typing to filter results by title or description',
          defaultCheckboxLabel: 'All Services',
          filterByText: 'Filter by service category',
        },
        searchBox: true, //display search box
        searchValue: '',
        scrollToSettings: {
          container: "body",
          duration: 1000,
          easing: "ease",
          offset: -70,
          x: false,
          y: true,
        },
      },
      resultsList: [],
    };
  },
  computed: {
    alphabetLetters() {
      return this.alphabet.toUpperCase().split('');
    },
  },
  mounted() {
    deepMerge(this.options, this.propOptions);
    this.init();
  },
  methods: {
    init() {
      let self = this;
      let promises = [];
      promises.push(this.getAzListCategories());
      promises.push(this.getAzList());

      Promise.all(promises).then(values => {
        self.updateResultsList();
        this.loaded = true;
      });
    },
    getAzListCategories() {
      let self = this;
      return axios.get(process.env.VUE_APP_CAT_API).then((response) => {
        self.categories = response.data;
      });
    },
    getAzList() {
      let self = this;
      return axios.get(process.env.VUE_APP_DIR_API).then((response) => {
        self.list = response.data.map((item) => {

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
        self.resultsList = self.list;
      });
    },
    hasResults() {
      
      //test if results are not grouped
      if (Array.isArray(this.resultsList) && this.resultsList.length > 0) {
        return true;
      }

      //test if results are grouped
      if (this.resultsList === Object(this.resultsList) && Object.keys(this.resultsList).length > 0) {
        return true;
      }

      return false;
    },
    async updateResultsList() {

      let filteredList = this.list;

      //checkboxes filter
      filteredList = await this.filterCheckbox(filteredList);

      //search filter
      if (this.options.searchBox) {
        filteredList = await this.filterSearch(filteredList);
      }
      
      if (this.options.azGroup) {
        filteredList = await this.groupAzList(filteredList);
      } else {
        this.sortResultsListByLabel(filteredList);
      }

      this.resultsList = filteredList;

    },
    sortResultsListByLabel(list) {
      return list.sort((a, b) => {
        if (a.title.toUpperCase() < b.title.toUpperCase()) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
      });
    },
    groupAzList(list) {

      let combinedList = {};
      let orderedCombinedList = {};
      let alpha = {};
      let numeric = {};
      
      list.forEach((item, index) => {
        let letter = item.title.charAt(0).toUpperCase();
        
        if (!combinedList.hasOwnProperty(letter)) {
          combinedList[letter] = [];
          combinedList[letter].push(item);
        } else {
          combinedList[letter].push(item);
        }
        
        combinedList[letter] = this.sortResultsListByLabel(combinedList[letter]);

      }, this);
      
      //sorts letters

      Object.keys(combinedList).sort().forEach(function(key) {
        if (isNaN(key)) {
          alpha[key] = combinedList[key];  
        } else {
          numeric["#"] = combinedList[key];  
        }
      });

      deepMerge(alpha, numeric);

      return alpha ;

    },
    filterCheckbox(list) {
      if (this.checkedItems.length > 0) {
        this.uncheckDefaultCheckbox();
        if (window.dalaLayer) {
          window.dataLayer.push({ 'serviceCategory': this.checkedItems });
        }
        return list.filter((listItem) => {
          return listItem.categories.some((tag) => {
            return this.checkedItems.includes(tag);
          }, this);
        });
      } 
      this.uncheckAllCheckboxes();
      return list;
      

    },
    filterSearch(list) {
      if (this.options.searchValue != '') {
        return this.$search(this.options.searchValue, list, this.options.fuseSearchOptions).then(results => {
          return results;
        });
      } 
      return list;
      
    },
    uncheckAllCheckboxes() {
      this.defaultCheckboxChecked = true;
      this.checkedItems = [];
    },
    uncheckDefaultCheckbox() {
      this.defaultCheckboxChecked = false;
    },
    isLetterInResults(letter) {
      if (this.options.azAnchors && this.options.azGroup) {
        return !this.resultsList.hasOwnProperty(letter);
      }
    },
    numericLetterFilter(letter) {
      if (typeof letter == 'string') {
        return letter.replace('N-','');
      }
      return letter;
    },
    getScrollToSettings(letter) {
      if (letter === "#") {
        return deepMerge({ el: "#l-\\#" }, this.options.scrollToSettings); 
      }
      return deepMerge({ el: `#l-${letter}` }, this.options.scrollToSettings); 
    },
  },
};
</script>

<style lang="scss" scoped>

#a-z-filter-list hr::after {
  position: absolute;
}

</style>