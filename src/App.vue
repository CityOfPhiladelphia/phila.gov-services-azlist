<template>
  <div id="app">
    <div class="search-filter" v-if="searchBox">
      <input type="text" v-model="searchValue" :placeholder="searchPlaceholder" @keyup="updateResultsList()">
    </div>
    <div v-if="azAnchors && azGroup" class="az-anchors">
      <ul>
        <li v-for="letter in alphabetLetters" :key="letter">
          <a href="#" v-scroll-to="'#l-' + letter" :disabled="isLetterInResults(letter)">{{ letter }}</a>
        </li>
      </ul>
    </div>
    <div class="checkboxes-filter">
      <ul>
        <li>
          <input id="all" type="checkbox" @change="uncheckAllCheckboxes();updateResultsList()" :checked="defaultCheckboxChecked">
          <label for="all">{{ defaultCheckboxLabel }}</label>
        </li>
        <li v-for="listItem in checkboxList" :key="listItem" >
          <input type="checkbox" :value="listItem" :id="listItem" v-model="checkedItems" @change="updateResultsList()">
          <label :for="listItem">{{ listItem }}</label>
        </li>
      </ul>
    </div>
    <div class="results">
      <h2>Results</h2>
      <template v-if="hasResults()">
        <template v-if="azGroup">
          <div v-for="(list, letter) in resultsList" :key="letter">
            <div class="letter-block" :id="'l-' + letter">
              <div class="letter">
                {{ letter }}
              </div>
              <div v-for="(listItem, index) in list" :key="'g-' + letter + index">
                <a :href="listItem.link">{{ listItem.label }}</a>
                <p>{{ listItem.desc }}</p>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-for="(listItem, lIndex) in resultsList" :key="'l-' + lIndex">
            <a :href="listItem.link">{{ listItem.label }}</a>
            <p>{{ listItem.desc }}</p>
          </div>
        </template>  
      </template>
      <template v-else>
        {{ noResultsMsg }}
      </template>
    </div>
  </div>
</template>

<script>
import VueFuse from 'vue-fuse'
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'

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
    list: {
      type: Array,
      default: () => {
        return [{
          label: 'Sample Entry Label',
          desc: 'Sample Entry Desc... you have no data',
          link: 'http://www.google.com',
          tags:['Tag1', 'Tag2'],
        }]
      }
    }
  },
  data() {
    return {
      searchBox: true, //display search box
      searchValue: '',
      searchPlaceholder: 'Search services',
      fuseSearchOptions: {
        keys: [
          'label',
          'desc',
        ],
        defaultAll: false,
        tokenize: true, 
        matchAllTokens: true,
        threshold: 0.1,
      },
      azAnchors: true, //display a-z anchors, azGroup must also be true
      azGroup: true, //group results by a-z
      alphabet: 'abcdefghijklmnopqrstuvwxyz',
      resultsList: [],
      noResultsMsg: `Sorry, we couldn't find anything for that search. Please try different terms.`,
      defaultCheckboxChecked: true,
      defaultCheckboxLabel: 'All Services',
      checkedItems: [],
      checkboxList: [
        'Crime, law & justice',
        'Birth, marriage & life events',
        'Business & self-employment',
        'Cars, parking & transportation',
        'Culture & recreation',
        'Diversity, inclusion & immigration',
        'Education & learning',
        'Mental & physical health',
        'Payments, assistance & taxes'
      ],
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    alphabetLetters() {
      this.alphabet = this.alphabet.toUpperCase()
      return this.alphabet.split('')
    }
  },
  methods: {
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
      if (this.searchBox) {
        filteredList = await this.filterSearch(filteredList)
      }
      
      if (this.azGroup) {
        filteredList = await this.groupAzList(filteredList)
      } else {
        this.sortResultsListByLabel(filteredList)
      }

      this.resultsList = filteredList

    },
    sortResultsListByLabel(list) {
      return list.sort((a, b) => {
        if (a.label < b.label) {
          return -1
        }
        if (a.label > b.label) {
          return 1
        }
        return 0
      })
    },
    groupAzList(list) {

      let combinedList = {}
      let orderedCombinedList = {}
      
      list.forEach((item, index) => {
        let letter = item.label.charAt(0)

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
          return listItem.tags.some((tag) => {
            return this.checkedItems.includes(tag)
          }, this)
        })
      } else {
        this.uncheckAllCheckboxes()
        return list
      }
      
    },
    filterSearch(list) {
      if (this.searchValue != '') {
        return this.$search(this.searchValue, list, this.fuseSearchOptions).then(results => {
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
      if (this.azAnchors && this.azGroup) {
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
