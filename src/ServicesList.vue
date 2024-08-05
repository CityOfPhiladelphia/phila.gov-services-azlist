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
            {{ $t("Filter by category") }}
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
                  {{ $t("All services") }}
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
            class="vue-search"
          >
            <input
              v-model="options.searchValue"
              class="search-field"
              type="text"
              :placeholder="$t('Search bar')"
              @keyup="updateResultsList()"
              @keydown.enter.prevent=""
            >
            <button v-if="options.searchValue" class="clear-search-btn" @click="clearAllFilters()">
              <i class="fas fa-times" />
            </button>
            <button
              class="search-submit"
              @click="updateResultsList()"
            >
              <i class="fa-solid fa-magnifying-glass" />
            </button>
          </div>
          <div class="filter-summary">
            <div class="result-summary">
              <span v-if="hasResults()">
                Showing {{ totalResultsCount }} results <span v-if="checkedItems.length > 0 || options.searchValue.length > 0"> for </span><span v-if="options.searchValue.length > 0"><b><em>"{{ options.searchValue }}"</em></b></span>
              </span>
              <span v-else>
                No results for <b><em>"{{ options.searchValue }}"</em></b>
              </span>  
            </div>
            <span v-if="checkedItems.length > 0">
              <button 
                v-for="item in checkedItems"
                :key="item"
                class="filter-button"
                @click="clearFilter(item)"
              >
                {{ item }}
                <i class="fa-solid fa-xmark"></i>
              </button>
            </span>
            <span v-if="checkedItems.length > 0 || options.searchValue.length > 0">
              <input
                type="submit"
                class="clear-button"
                value="Clear all"
                @click="clearAllFilters()"
              >
            </span>
            <div v-if="!hasResults()" class="helper-text">
              There were no results found matching your search. Try adjusting your search settings.
              <br>
              <br>
              Here are some options:
              <ul>
                <li>Use different or fewer search terms</li>
                <li>Check your spelling</li>
                <li>Remove or adjust any filters</li>
              </ul>
              Want to start over? Select Clear all to reset the search settings.
            </div>
          </div>
          <nav
            v-if="options.azAnchors && options.azGroup && (language !== 'zh')"
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
                          <a :href="translateLink(listItem.link)">
                            {{ listItem.title }}
                          </a>
                          <p
                            class="hide-for-small-only mbl"
                            v-html="listItem.desc"
                          />
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
                    <a :href="translateLink(listItem.link)">
                      {{ listItem.title }}
                    </a>
                    <p
                      class="hide-for-small-only mbl"
                      v-html="listItem.desc"
                    />
                  </div>
                </div>
              </template>
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
import { loadLanguageAsync } from './i18n.js';


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
      totalServicesCount: 0,
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

    language() {
      let lang = this.isTranslated(window.location.pathname);
      const validLanguages = [ '/es', '/zh', '/ar', '/ht', '/fr', '/sw', '/pt', '/ru', '/vi' ];
      if (validLanguages.includes(lang)) {
        return lang.substring(1); 
      } 
      return 'en'; 
    },

    slug() {
      let vm = this;
      if (vm.language == 'en') {
        return process.env.VUE_APP_DIR_API;
      }
      const languageCode = vm.language; 
      const url = process.env.VUE_APP_BUCKET_URL + `${languageCode}/phila_service_directory.json`;
      return url;
    },
    
    currentRouteName() {
      return this.isTranslated(window.location.pathname);
    },

    categoriesSlug(){
      let vm = this;
      if (vm.language == 'en') {
        return process.env.VUE_APP_CAT_API;
      }
      const languageCode = vm.language;
      const url = process.env.VUE_APP_BUCKET_URL + `${languageCode}/phila_service_categories.json`;
      return url;
    },
    totalResultsCount() {
      if (typeof this.resultsList === 'object') {
        let totalCount = 0;
        for (const key in this.resultsList) {
          totalCount += this.resultsList[key].length;
        }
        return totalCount;
      } else if (Array.isArray(this.resultsList)) {
        return this.resultsList.length;
      }
      return 0;
    },
  },
  mounted() {
    deepMerge(this.options, this.propOptions);
    loadLanguageAsync(this.language);
    this.init();
  },
  methods: {
    isTranslated(path) {
      let splitPath = path.split("/");
      const langList = [ 'zh', 'es','ar', 'fr', 'ru', 'ms', 'hi', 'pt', 'bn', 'id', 'sw', 'ja', 'de', 'ko', 'it', 'fa', 'tr', 'nl', 'te', 'vi', 'ht' ];
      for (let i = 0; i < splitPath.length; i++) {
        if (langList.indexOf(splitPath[i]) > -1) {
          return '/'+splitPath[i];
        }
      }
      return null;
    },
    
    translateLink(link) {
      let self = this;
      var slug = "";
      if (link.startsWith("https://www.phila.gov")) {
        slug = link.slice("https://www.phila.gov".length);
      }
      return self.currentRouteName ? self.currentRouteName+slug : slug;
    },

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
      return axios.get(this.categoriesSlug).then((response) => {
        self.categories = response.data;
      });
    },
    getAzList() {
      let self = this;
      return axios.get(this.slug).then((response) => {
        self.list = response.data.map((item) => {
          var categories = [ "" ];
          if(typeof item.categories !== 'string') {
            categories = item.categories.map((cat) => {
              if (cat) {
                return cat.slug;
              }
              return '';
            });
          }

          return {
            title: item.title,
            link: item.link,
            desc: item.desc,
            categories,
          };
        });
        self.resultsList = self.list;
        self.totalServicesCount = self.list.length;
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
        
        // if (!combinedList.hasOwnProperty(letter)) {
        if (!(letter in combinedList)) {
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

    clearFilter(item) {
      if (this.checkedItems.includes(item)) {
        this.checkedItems = this.checkedItems.filter(checkedItem => checkedItem !== item);
      } 
      this.updateResultsList();
      this.updateRouterQuery('checkedItems', this.checkedItems);
    },

    clearAllFilters() {
      this.checkedItems = [];
      
      this.options.searchValue = '';

      this.defaultCheckboxChecked = true;

      this.updateResultsList();
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
      this.showFilterSummary = false;
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
        // return !this.resultsList.hasOwnProperty(letter);
        return !(letter in this.resultsList);
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

.vue-search {
    position: relative;
    display: flex;

    .search-field{
      min-height: 3.8rem;
      border: 2px solid #0f4d90;
      background: white;
    }

    .clear-search-btn {
      position: absolute;
      top:16px;
      right: 70px;
      padding: 0;
      font-size: 20px;
      background-color: #fff;
      opacity: 0.8;
      cursor: pointer;
      color: rgba(60, 60, 60, 0.5);
        &:hover {
        background: transparent;
        color: black;
      }
    }

    .search-submit{ 
      padding: 0.4rem;
      font-size: 2rem;
      font-weight: 400;
      background: #0f4d90;
      color: white;
      width: 3.8rem;
      height: 3.8rem;
      cursor: pointer;
    }

    .fa-magnifying-glass{
      font-weight: normal;
    }
  }

.filter-summary{
  margin: 0px 0px 16px 0px;
}

.filter-button{
  margin: 0px 8px 8px 0px;
  padding: 6px;
  border-radius: 4px;
  border: 2px solid transparent;
  background-color: #cfcfcf;
  color: #333333;
  line-height: normal;
  text-transform: capitalize;
  font-weight: normal;
  cursor: pointer;
}

.filter-button:hover{
  border-color: #2176d2;
}

.result-summary {
  margin-right: 8px;
  margin-bottom: 8px;
}

.clear-button{
  padding: 0;
  border: none;
  background-color: transparent;
  color: #0f4d90;
  cursor: pointer;
  font-weight: 700;
  text-decoration: underline;
}

.helper-text{
  margin-top: 16px;
}


</style>