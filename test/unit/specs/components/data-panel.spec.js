import Vue from 'vue';
import {mount} from 'vue-test-utils';
import {createStore} from '../../../../src/store/store';
import DataPanel from '../../../../src/components/data-panel/data-panel.vue';
import FakeGiphyFetcher from '../../fake-giphy-fetcher';

describe('Data Panel Component', () => {
  let store, fakeGiphyFetcher, component;

  const SAMPLE_GIFS = [{
    imageUrl: "https://domain.com/some_image_url.gif",
    previewUrl: "https://domain.com/some_preview_url.gif",
    title: "My title",
    url: "https://url.com"
  }, {
    imageUrl: "https://domain.com/some_image_url_2.gif",
    previewUrl: "https://domain.com/some_preview_url_2.gif",
    title: "My title 2",
    url: "https://url_2.com"
  }];


  beforeEach(() => {
    fakeGiphyFetcher = FakeGiphyFetcher.create();

    store = createStore({
      giphyFetcher: fakeGiphyFetcher
    });

    component = mount(DataPanel, { store });
  });

  it('should contain a header', () => {
    expect(component.find('h2').text()).to.eql('Found items');
  });


  describe('Subtitle', () => {
    const GENERAL_TEXT = 'If you\'ve searched for something, here you can see some related gifs!';

    it('should be a general informative text initially', () => {
      expect(component.find('#data-panel-subtitle').text()).to.eql(GENERAL_TEXT);
    });

    it('should be a general informative text if there is no search term in the store', async () => {
      store.commit('setSearchTerm', '');
      await Vue.nextTick();
      expect(component.find('#data-panel-subtitle').text()).to.eql(GENERAL_TEXT);
    });

    it('should show the search term if there is any', async () => {
      store.commit('setSearchTerm', 'MYSEARCH');
      await Vue.nextTick();
      expect(component.find('#data-panel-subtitle').text()).to.eql('Search results for "MYSEARCH"');
    });
  });


  describe('Cards', () => {
    it('should have no cards initially', () => {
      expect(component.find('.e-card').exists()).to.eql(false);
    });

    context('if gifs set in the Store', () => {
      beforeEach(async () => {
        store.commit('setGifs', SAMPLE_GIFS);
        await Vue.nextTick();
      });

      it('should be shown', async () => {
        expect(component.findAll('.e-card').length).to.eql(2);

        const firstCard = component.findAll('.e-card').at(0);
        const secondCard = component.findAll('.e-card').at(1);

        expect(firstCard.find('.e-card__preview').element.src).to.eql(SAMPLE_GIFS[0].previewUrl);
        expect(secondCard.find('.e-card__preview').element.src).to.eql(SAMPLE_GIFS[1].previewUrl);
      });

      it('should set a dialog to the selected gif when clicking on one', async () => {
        component.findAll('.e-card').at(0).trigger('click');
        await Vue.nextTick();
        expect(component.find({ name: 'GifDialog' }).props().gif).to.eql(SAMPLE_GIFS[0]);
      });
    });

  });

});
