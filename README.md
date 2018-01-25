# EmaGif, a Vue Example Application

> This application is created to propagate the best practices of developing and testing Vue applications. It implements a simple gif searcher where you can fetch gifs from Giphy based on your criteria and also you can get images for random terms.

<p align="center">
  <br>
  <img src="https://www.dropbox.com/s/8hp8d8fczqnz6e7/emagif2.gif?raw=1" width="600" />
  <br>
</p>

# Table of Contents
  * [Build Setup](#build-setup)
  * [Practices](#practices)
    * [General guidelines](#general-guidelines)
    * [1. Use Vuex](#1-use-vuex)
    * [2. Create Vuex store using a Factory](#2-create-vuex-store-using-a-factory)
    * [3. Test Vuex as you use it](#3-test-vuex-as-you-use-it)
    * [4. Use the vue-test-utils library to test components easier](#4-use-the-vue-test-utils-library-to-test-components-easier)
    * [5. Don't mock Vuex store in the component tests](#5-dont-mock-vuex-store-in-the-component-tests)
    * [6. Use Vuex helpers](#6-use-vuex-helpers)
    * [7. Dumb components](#7-dumb-components)
    * [8. Separate template and implementation code](#8-separate-template-and-implementation-code)
    * [9. Do not use Router unless you really need it](#9-do-not-use-router-unless-you-really-need-it)
    * [+1 Use async-await](#1-use-async-await)
  * [Todo](#todo)

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
- Always keep tests and code simple. Use idiomatic solutions (eg. Vuex test helpers, map functions, etc.) where you can. 
- Less code means that you have to read and understand less. Of course, it's only true if you keep your code readable! Do not satisfy readable code in favor of "so-called" elegant, short but hard to understand one.

### 1. Use Vuex
As it's very easy to integrate and it provides a clear and simple architecture to your application, Vuex should be used for simple projects as well without thinking too much.

### 2. Create Vuex store using a Factory
It can help a lot in testing if the Vuex store is not a singleton entity in your application:

1. You can recreate a new Store with the predefined settings and extensions anytime in any test
2. You can pass dependencies into it and it can help a lot to fake or mock hard-to-test dependencies (eg. a request library).

**[Sample Vuex Store with Factory Method and Dependency Injection](https://github.com/emartech/vue-example-app/blob/master/src/store/store.js)**
```javascript
import Vue from 'vue';
import Vuex from 'vuex';

// A HARD-TO-TEST DEPENDENCY
import GiphyFetcher from '../libraries/giphy/fetcher';

Vue.use(Vuex);

// YOU CAN DEFINE DEPENDENCIES AND INJECT THEM IN MULTIPLE WAYS
// THIS IS JUST ONE OF THEM
// DI1: SET DEFAULT DEPENDENCIES
export const DEFAULT_DEPENDENCIES = {
  giphyFetcher: GiphyFetcher.create()
};

// STORE FACTORY METHOD W/ DEPENDENCY INJECTION
export const createStore = function(libraries) {
  
  // DI2: MERGE ADDITIONAL DEPS INTO THE DEFAULT ONES, USEFUL IN TESTS
  libraries = { ...DEFAULT_DEPENDENCIES, ...libraries };

  return new Vuex.Store({
    state: {
      searchTerm: '',
      gifs: []
    },

    mutations: {
      setSearchTerm(state, searchTerm) {
        state.searchTerm = searchTerm;
      },
      setGifs(state, gifs) {
        state.gifs = gifs;
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

You can make [fake implementations](https://github.com/emartech/vue-example-app/blob/master/test/unit/fake-giphy-fetcher.js) for testing purposes of a class by using the same interface.

### 3. Test Vuex as you use it
One golden rule in testing is to test an entity as close as possible to its real usage pattern. If you expose a Vuex internal, such as a mutation or action function and test the behaviour by calling it explicitly then you will lose the context what you have in the implementation where you are using a real Store. 

To make it worse, an action can use other actions and mutations and very likely it uses the others through a `commit` or `dispatch` call. In this case, why don't you use these methods in the first place? **Test Vuex states, mutations, getters and actions through the Store instance using `store.state`, `store.getters`, `store.commit('...')` and `store.dispatch('...'')`**. Check the [general store](https://github.com/emartech/vue-example-app/blob/master/test/unit/specs/store/store.spec.js) and [action](https://github.com/emartech/vue-example-app/blob/master/test/unit/specs/store/actions.spec.js) spec files.
 
 
### 4. Use the vue-test-utils library to test components easier
It can make your code more simple and maintainable if you don't write everything by yourself. [Vue-test-utils](https://vue-test-utils.vuejs.org/en/) helps you bootstrap components in the tests and make it easier to do expectations to its content.

```bash
npm install vue-test-utils
```

A simple example can be found in the [Search Panel Component tests](https://github.com/emartech/vue-example-app/blob/master/test/unit/specs/components/search-panel.spec.js):

```javascript
import SearchPanel from '../../../../src/components/search-panel/search-panel.vue';
// ...

it('should render input with empty value on init', () => {
  const component = mount(SearchPanel);
  expect(component.find('#search-panel-search-field').element.value).to.equal('');
});
```

There are two ways how you can initialize a component:
- `mount` creates the component and all of its child components
- `shallow` creates only the component and doesn't initialize the childs.

It's better to use `mount` if you can and if it's not slow due to the fact that it's closer to the real usage.

Read through the [documentation](https://vue-test-utils.vuejs.org/en/) as it's not that intuitive as other parts of Vue. 

Some interesting examples of component testing used in this app:

- to [simulate writing something to an input](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/search-panel.spec.js#L35), you should modify its `element.value` and then trigger an `input` event.
- to [check if something exists](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/data-panel.spec.js#L61) or not, use the `exists` method.
- note that `find` and `findAll` is different, the former always returns the first result, the [second](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/data-panel.spec.js#L71) returns a `WrapperArray`. Both have slightly different methods.
- if you do something which [changes the state of another component](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/data-panel.spec.js#L82) or the Store then you should use `await Vue.nextTick()` to make the operation done.
- you can get a child component using `component.find({ name: 'ChildComponentName' })`. It's useful when you'd like to [test that you've passed a property to a child component](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/data-panel.spec.js#L83).
- to bootstrap a component with initial properties [you can drop `propsData` to it](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/gif-dialog.spec.js#L17).
- you can [drop a Vuex store](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/data-panel.spec.js#L30) to the component and [use its methods](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/data-panel.spec.js#L46) to alter the states. Do not forget that [you must use `await Vue.nextTick()` to make changes](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/data-panel.spec.js#L53) in the component if you change the store's state after component initialization. 


### 5. Don't mock Vuex store in the component tests
If you mock Vuex in the component tests then you will have a totally separate presentational and data layer and the tests won't guarantee their integrations. Furthermore, Vuex make it very easy to lose the connection between the store and the components as the store commands uses string identifiers. It's not hard to forget to rename the related `dispatch` identifiers after modifying an action. 

You can prevent these problems by [extracting the string identifiers to constants](https://vuex.vuejs.org/en/mutations.html#using-constants-for-mutation-types) and use them in the store definition and also where you'd like to use in the component. Note that it will create a tighter bound between the store and the component code.

Of course you could also check the integrations in separate integration tests but why don't you omit the mocking in the first place? It's [very easy to use your real Vuex store and test the state modifications](https://github.com/emartech/vue-example-app/blob/master/test/unit/specs/components/search-panel.spec.js) which affects the component under test.

```javascript
describe('Search input', () => {
  let store, component;
  
  beforeEach(() => {
    store = createStore();
    component = mount(SearchPanel, { store });    
  });
  
  it('should reflect the Store changes', async () => {
    store.commit('setSearchTerm', 'wowowow');
    await Vue.nextTick(); // we must wait for UI changes
    expect(component.find('#search-panel-search-field').element.value).to.equal('wowowow');
  });
  
  describe('typing into it', () => {
    it('should set the searchTerm in the store', () => {
      const input = component.find('#search-panel-search-field');
      input.element.value = 'my cats';
      input.trigger('input');

      expect(store.state.searchTerm).to.equal('my cats');
    });
  });  
});
```

### 6. Use Vuex helpers
To keep the code simple it would be wise to use the Vuex helpers. There are helpers for [states](https://vuex.vuejs.org/en/state.html#the-mapstate-helper), [mutations](https://vuex.vuejs.org/en/mutations.html#committing-mutations-in-components) and also [actions](https://vuex.vuejs.org/en/actions.html#dispatching-actions-in-components).

**[Data Panel Component](https://github.com/emartech/vue-example-app/blob/master/src/components/data-panel/data-panel.vue)**
```javascript
import { mapState, mapMutations } from 'vuex';
  
export default {
  name: 'DataPanel',
  computed: {
      ...mapState(['searchTerm', 'gifs', 'selectedGif'])
  },
  methods: {
    ...mapMutations(['selectGif'])
  }
```
 
You can mix multiple helpers of the same type in one component and also modify them slightly by using their object form. It's advised to modify action and mutation behaviour through these helpers as they provide access to the Store, instead of revealing it from the component internals (`this.$store.dispatch('xxx')`):

```javascript
export default {
  name: 'SearchPanel',
  computed: {
    ...mapState(['searchTerm']),
  },
  methods: {
    ...mapActions(['search']),
    
    ...mapActions({
        searchCustomRandom: (dispatch) => {
          const randomIndex = Math.floor(Math.random() * 2);
          const thingies = ['dogs in bed', 'cat apocalypse'];
          dispatch('search', [thingies][randomIndex]);
        } 
    })
  }
}
```
 

### 7. Dumb components
There are two main building block of a well-structured frontend application:
- [smart components](https://preact.gitbooks.io/react-book/content/jsx/smart.html) handle application specific business logic and they sticks together other components to form a custom application
- [dumb components](https://preact.gitbooks.io/react-book/content/jsx/dumb.html) are just simple UI elements without using any external data or service. In opposite to the smart components, the dumb ones are heavily reusable and we can share them between applications. UI Frameworks usually provide dumb components.

Try to maximize the number of the dumb components as it's easier to manage and replace them. Do not use external dependencies (eg. Vuex store) in them, always communicate with them through event handlers and properties. Dumb components can transform the properties and other values they got and they can have their own state - but do not store it in the Vuex store!

In this example application we are using one dumb component, the [`GifDialog`](https://github.com/emartech/vue-example-app/blob/master/src/components/gif-dialog/gif-dialog.vue). Note that [you have to define the properties](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/test/unit/specs/components/gif-dialog.spec.js#L19) before bootstrapping it in the tests.

### 8. Separate template and implementation code
If you'd like to follow the Separation of Concerns principle then it's good to know that you can easily [move the template and style codes](https://github.com/emartech/vue-example-app/blob/5c38259780510872743505e88538a1aa5414ba81/src/components/data-panel/data-panel.vue#L2) out of the `vue` files to separate ones.

**[Data Panel Component](https://github.com/emartech/vue-example-app/blob/master/src/components/data-panel/data-panel.vue)**
```vuejs
<style scoped src="./data-panel.css"></style>
<template src="./data-panel.html"></template>

<script>
  import { mapState, mapMutations } from 'vuex';
  // ...
</script>
```

Unfortunately you should prepare your test stack to support HTML template files as Vue has problems loading it (at least if you'd like to use Karma and Mocha/Chai):

**1. install vue-template-loader**
```bash
npm install vue-template-loader --save-dev
```

**2. Modify the modules part of the build/webpack.test.conf.js to use template loader**
```javascript
module: {
  rules: [
    { test: /\.html$/, use: 'vue-template-loader' },
    ...utils.styleLoaders()
  ]
},
```

### 9. Do not use Router unless you really need it
It seems to be a good idea at first to use the Vue router but think it twice. It can make your application more complex as it's not straightforward to implement the two-way integration with the Vuex store and you have to make workarounds. It's not likely that your project needs the actual page linkable, especially if it is rendered in an iframe. You can easily replace the "page" handling with multiple high level components and a simple property in the Vuex store which tells what main component is active.


### +1 Use async-await
Instead of using Promises, you can always use `async` functions and `await` for async operations including Promise executions. It applies to the tests as well:

```javascript
// NOTE THE ASYNC FUNCTION PARAMETER!
it('should reflect the Store changes', async () => {
  store.commit('setSearchTerm', 'wowowow');
  await Vue.nextTick();
  expect(component.find('#search-panel-search-field').element.value).to.equal('wowowow');
});
```


## TODO

- [ ] `localVue` usage instead of polluting the original `Vue` instance
- [ ] E2E Tests, eg. Cypress or Testcafe
- [ ] Vue Router and Vuex integration and testing
- [ ] JWT token and authentication
- [ ] Keep test files with the original files and omit .spec.js files from coverage report
