import { createStore, RANDOM_SEARCH_TERMS } from '../../../../src/store/store';
import FakeGiphyFetcher from '../../fake-giphy-fetcher';

describe('Store', () => {

  describe('actions', () => {
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


    describe('search', () => {
      it('should set the @searchTerm and fetch related gifs into @gifs', async () => {
        const fakeGiphyFetcher = FakeGiphyFetcher.create();

        const store = createStore({
          giphyFetcher: fakeGiphyFetcher
        });

        fakeGiphyFetcher.searchFor.withArgs('My title').returns(Promise.resolve(SAMPLE_GIFS));
        await store.dispatch('search', 'My title');
        expect(store.state.gifs).to.eql(SAMPLE_GIFS);
      });
    });


    describe('searchRandom', () => {
      it('should dispatch a search using one random term from a predefined constant list', async () => {
        const fakeGiphyFetcher = FakeGiphyFetcher.create();

        const store = createStore({
          giphyFetcher: fakeGiphyFetcher,
          randomGenerator: () => 1
        });

        fakeGiphyFetcher.searchFor.withArgs(RANDOM_SEARCH_TERMS[1]).returns(Promise.resolve(SAMPLE_GIFS));
        await store.dispatch('searchRandom');

        expect(store.state.searchTerm).to.eql(RANDOM_SEARCH_TERMS[1]);
        expect(store.state.gifs).to.eql(SAMPLE_GIFS);
      });
    });

  });


});
