# Vue Example Application

> This application is created to propagate the best practices of developing and testing similar Vue applications.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

## Practices

### 1. Use Vuex
As it's very easy to integrate Vuex and it provides a clear and simple architecture to your application, it should be used for simple projects as well without too much thinking.

### 2. Create Vuex store using a Factory
It can help a lot in testing if the Vuex store is not a singleton entity in your application:

1. You can recreate a new Store with the predefined settings and extensions anytime in any test
2. You can pass dependencies into it and it can help a lot to fake or mock hard-to-test dependencies (eg. a request library).

**[Sample Vuex Store](https://github.com/emartech/vue-example-app/blob/master/src/store/store.js)**
```javascript
import Vue from 'vue'
import Vuex from 'vuex';

// A HARD-TO-TEST DEPENDENCY
import GiphyFetcher from '../libraries/giphy/fetcher';

Vue.use(Vuex);

// YOU CAN DEFINE DEPENDENCIES AND INJECT THEM IN MULTIPLE WAYS
// THIS IS JUST ONE OF THEM
// 1. SET DEFAULT DEPENDENCIES
export const DEFAULT_DEPENDENCIES = {
  giphyFetcher: GiphyFetcher.create()
};

// STORE FACTORY METHOD W/ DEPENDENCY INJECTION
export const createStore = function(libraries) {
  
  // 2. MERGE ADDITIONAL DEPS INTO THE DEFAULT ONES, USEFUL IN TESTS
  libraries = { ...DEFAULT_DEPENDENCIES, ...libraries };

  return new Vuex.Store({
    state: {
      searchTerm: '',
    },

    mutations: {
      setSearchTerm(state, searchTerm) {
        state.searchTerm = searchTerm;
      }
    },

    actions: {
      async search({ commit, state }, searchTerm) {
        commit('setSearchTerm', searchTerm);
        commit('setGifs', await libraries.giphyFetcher.searchFor(state.searchTerm));
      }
    }
  })
};
```
