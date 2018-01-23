import Vue from 'vue';
import { mount } from 'vue-test-utils';
import { createStore, RANDOM_SEARCH_TERMS } from '../../../../src/store/store';
import SearchPanel from '../../../../src/components/search-panel/search-panel.vue';
import FakeGiphyFetcher from '../../fake-giphy-fetcher';

describe('Search Panel Component', () => {
  let store, fakeGiphyFetcher, component;

  beforeEach(() => {
    fakeGiphyFetcher = FakeGiphyFetcher.create();

    store = createStore({
      giphyFetcher: fakeGiphyFetcher
    });

    component = mount(SearchPanel, { store });
  });


  describe('Search input', () => {

    it('should render input with empty value on init', () => {
      expect(component.find('#search-panel-search-field').element.value).to.equal('');
    });

    it('should reflect the Store changes', async () => {
      store.commit('setSearchTerm', 'wowowow');
      await Vue.nextTick(); // we must wait for UI changes (note the async!)
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



  describe('Random search term generation button', () => {

    it('should exists in the component', () => {
      expect(component.find('#search-panel-random-button').exists()).to.equal(true);
    });

    describe('clicking on it', () => {
      it('should set one of the random search term expressions to the input', async () => {
        component.find('#search-panel-random-button').trigger('click');
        let generatedSearchTerm = component.find('#search-panel-search-field').element.value;

        expect(generatedSearchTerm).to.be.oneOf(RANDOM_SEARCH_TERMS);
        expect(store.state.searchTerm).to.equal(generatedSearchTerm);
      });
    });

  });

});
