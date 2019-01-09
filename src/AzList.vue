<template>
  <div id="azlist-component">
    <div class="search-filter" v-if="options.searchBox">
      <input type="text" v-model="options.searchValue" :placeholder="options.labels.searchPlaceholder" @keyup="updateResultsList()">
    </div>
    <div v-if="options.azAnchors && options.azGroup" class="az-anchors">
      <ul>
        <li v-for="letter in alphabetLetters" :key="letter">
          <a href="#" v-scroll-to="'#l-' + letter" :disabled="isLetterInResults(letter)">{{ letter }}</a>
        </li>
      </ul>
    </div>
    <div class="checkboxes-filter">
      {{ options.labels.filterByText }}
      <ul>
        <li>
          <input id="all" type="checkbox" @change="uncheckAllCheckboxes();updateResultsList()" :checked="defaultCheckboxChecked">
          <label for="all">{{ options.labels.defaultCheckboxLabel }}</label>
        </li>
        <li v-for="listItem in categories" :key="listItem.slug" >
          <input type="checkbox" :value="listItem.slug" :id="listItem.slug" v-model="checkedItems" @change="updateResultsList()">
          <label :for="listItem.slug">{{ listItem.name }}</label>
        </li>
      </ul>
    </div>
    <div class="results">
      <h2>Results</h2>
      <template v-if="hasResults()">
        <template v-if="options.azGroup">
          <div v-for="(list, letter) in resultsList" :key="letter">
            <div class="letter-block" :id="'l-' + letter">
              <div class="letter">
                {{ letter }}
              </div>
              <div v-for="(listItem, index) in list" :key="'g-' + letter + index">
                <a :href="listItem.link">{{ listItem.title }}</a>
                <p>{{ listItem.desc }}</p>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-for="(listItem, lIndex) in resultsList" :key="'l-' + lIndex">
            <a :href="listItem.link">{{ listItem.title }}</a>
            <p>{{ listItem.desc }}</p>
          </div>
        </template>  
      </template>
      <template v-else>
        {{ options.labels.noResultsMsg }}
      </template>
    </div>
  </div>
</template>

<script>
import VueFuse from 'vue-fuse'
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import deepMerge from 'lodash/merge'


Vue.use(VueScrollTo, {
  container: "body",
  duration: 1000,
  easing: "ease",
  offset: 0,
  force: true,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
 })

Vue.use(VueFuse)

export default {
  name: 'azlist',
  props: {
    categories: {
      type: [Array],
      default: () => {
        return [{
          name: 'Sample Category 1',
          slug: 'cat-1',
        }]
      },
      validator: (value) => {

        let sample = value[0]

        if (
          sample.hasOwnProperty('name') &&
          sample.hasOwnProperty('slug')
        ) {
          return true
        }
        
        console.log(`The data must be an array of objects with the following keys: name, slug`)

        return false

      },
    },
    list: {
      type: [Array],
      default: () => {
        return [{
          title: 'Sample Entry Label',
          desc: 'Sample Entry Desc... you have no data',
          link: 'http://www.google.com',
          categories: ['cat-1'],
        }]
      },
      validator: (value) => {

        let sample = value[0]

        if (
          sample.hasOwnProperty('title') &&
          sample.hasOwnProperty('desc') &&
          sample.hasOwnProperty('link') &&
          sample.hasOwnProperty('categories')
        ) {
          return true
        }
        
        console.log(`The data must be an array of objects with the following keys: title, desc, link, categories`)

        return false

      },
    },
    propOptions: {
      type: [Object],
    }
  },
  data() {
    return {
      options: {
        azAnchors: true, //display a-z anchors, azGroup must also be true
        azGroup: true, //group results by a-z
        fuseSearchOptions: {
          defaultAll: false,
          keys: [
            'title',
            'desc',
          ],
          matchAllTokens: true,
          threshold: 0.1,
          tokenize: true, 
        },
        labels: {
          noResultsMsg: `Sorry, we couldn't find anything for that search. Please try different terms.`,
          searchPlaceholder: 'Search services',
          defaultCheckboxLabel: 'All Services',
          filterByText: 'Filter by service category',
        },
        searchBox: true, //display search box
        searchValue: '',
      },
      alphabet: 'abcdefghijklmnopqrstuvwxyz',
      checkedItems: [],
      defaultCheckboxChecked: true,
      resultsList: [],
    }
  },
  created() {
    deepMerge(this.options, this.propOptions)
    this.init()
  },
  computed: {
    alphabetLetters() {
      this.alphabet = this.alphabet.toUpperCase()
      return this.alphabet.split('')
    }
  },
  methods: {
    gettype(item) {
      console.log(typeof item)
    },
    init() {
      
      this.resultsList = this.list
      this.updateResultsList()

    },
    hasResults() {
      
      //test if results are not grouped
      if (Array.isArray(this.resultsList) && this.resultsList.length > 0) {
        return true
      }

      //test if results are grouped
      if (this.resultsList === Object(this.resultsList) && Object.keys(this.resultsList).length > 0) {
        return true
      }

      return false
    },
    async updateResultsList() {
     
      let filteredList = this.list

      //checkboxes filter
      filteredList = await this.filterCheckbox(filteredList)

      //search filter
      if (this.options.searchBox) {
        filteredList = await this.filterSearch(filteredList)
      }
      
      if (this.options.azGroup) {
        filteredList = await this.groupAzList(filteredList)
      } else {
        this.sortResultsListByLabel(filteredList)
      }

      this.resultsList = filteredList

    },
    sortResultsListByLabel(list) {
      return list.sort((a, b) => {
        if (a.title < b.title) {
          return -1
        }
        if (a.title > b.title) {
          return 1
        }
        return 0
      })
    },
    groupAzList(list) {

      let combinedList = {}
      let orderedCombinedList = {}
      
      list.forEach((item, index) => {
        let letter = item.title.charAt(0)
        
        if (!combinedList.hasOwnProperty(letter)) {
          combinedList[letter] = []
          combinedList[letter].push(item)
        } else {
          combinedList[letter].push(item)
        }
        
        combinedList[letter] = this.sortResultsListByLabel(combinedList[letter])

      }, this)
      
      //sorts letters
      Object.keys(combinedList).sort().forEach(function(key) {
        orderedCombinedList[key] = combinedList[key];
      });

      return orderedCombinedList
    },
    filterCheckbox(list) {
      if (this.checkedItems.length > 0) {
        this.uncheckDefaultCheckbox()
        return list.filter((listItem) => {
          return listItem.categories.some((tag) => {
            return this.checkedItems.includes(tag)
          }, this)
        })
      } else {
        this.uncheckAllCheckboxes()
        return list
      }
      
    },
    filterSearch(list) {
      if (this.options.searchValue != '') {
        return this.$search(this.options.searchValue, list, this.options.fuseSearchOptions).then(results => {
          return results
        })
      } else {
        return list
      }
    },
    uncheckAllCheckboxes() {
      this.defaultCheckboxChecked = true;
      this.checkedItems = []
    },
    uncheckDefaultCheckbox() {
      this.defaultCheckboxChecked = false;
    },
    isLetterInResults(letter) {
      if (this.options.azAnchors && this.options.azGroup) {
        return !this.resultsList.hasOwnProperty(letter)
      }
    },
  }
}
</script>

<style lang="scss">
  .checkboxes-filter {
    li {
      list-style-type: none;
    }
  }
  .az-anchors {
    ul {
      list-style-type: none;
      li {
        display: inline-block;
        margin: 0 2px;
      }
    }
    a[disabled] {
      pointer-events: none;
      color: #f0f0f0;
    }
  }
</style>
