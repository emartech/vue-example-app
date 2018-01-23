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
#### General guidelines
- Do not use test doubles (mocks, stubs, spies, etc.) unless there is no other way or very hard to test the related entity. The danger of mocking is that you lose the connection between the real usage and the test context and you can make hard-to-find bugs without breaking any tests after a simple refactoring. "Mock objects can give you a deceptive sense of confidence, and that's why you should avoid them unless there is really no alternative.", said Cedric Beust.  
- Always keep tests and code simple. Use idiomatic solutions (eg. Vuex test helpers, map functions, etc.)

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

Now it's [easy to fake dependencies](https://github.com/emartech/vue-example-app/blob/master/test/unit/specs/store/actions.spec.js) which are hard to test, eg. request libraries or random-generators.

```javascript
describe('setSearchTerm', () => {
  it('should set the search term', () => {
    // CREATE STORE WITH DEFAULT DEPENDENCIES
    const store = createStore();
    store.commit('setSearchTerm', 'test term');
    expect(store.state.searchTerm).to.eql('test term');
  });
});

describe('search', () => {
  it('should set the @searchTerm and fetch related gifs into @gifs', async () => {
    const fakeGiphyFetcher = { searchFor: sinon.stub() }

    // CREATE STORE WITH A FAKE REQUEST LIBRARY
    const store = createStore({
      giphyFetcher: fakeGiphyFetcher
    });

    fakeGiphyFetcher.searchFor.withArgs('My title').returns(Promise.resolve(SAMPLE_GIFS));
    await store.dispatch('search', 'My title');
    
    expect(store.state.gifs).to.eql(SAMPLE_GIFS);
  });
});
```

### 3. Test Vuex as you use it!
One golden rule in testing is to test an entity as close as possible to it's real usage pattern. If you expose a Vuex internal, such as a mutation or action function and test the behaviour by calling it explicitly then you will lose the context what you have in the implementation where you are using a real Store. 

To make it worse, an action can use other actions and mutations and very likely it uses the others through a `commit` or `dispatch` call. In this case, why don't you use these methods in the first place? **Test Vuex states, mutations, getters and actions through the Store instance using `store.state`, `store.getters`, `store.commit('...')` and `store.dispatch('...'')`**. Check the [general store](https://github.com/emartech/vue-example-app/blob/master/test/unit/specs/store/store.spec.js) and [action](https://github.com/emartech/vue-example-app/blob/master/test/unit/specs/store/actions.spec.js) spec files.
 
