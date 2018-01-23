import { createStore } from '../../../../src/store/store';

describe('Store', () => {

  describe('states', () => {
    let store;

    beforeEach(() => { store = createStore(); });

    describe('@searchTerm', () => {
      it('should have an empty string as initial value', () => {
        expect(store.state.searchTerm).to.eql('');
      });
    });

    describe('@gifs', () => {
      it('should have an empty array as initial value', () => {
        expect(store.state.gifs).to.eql([]);
      });
    });

    describe('@selectedGif', () => {
      it('should have an empty object as initial value', () => {
        expect(store.state.selectedGif).to.eql({});
      });
    });

  });



  describe('mutations', () => {
    let store;

    beforeEach(() => { store = createStore(); });

    describe('setSearchTerm', () => {
      it('should set the search term', () => {
        store.commit('setSearchTerm', 'test term');
        expect(store.state.searchTerm).to.eql('test term');
      });
    });

    describe('setGifs', () => {
      it('should set the gifs', () => {
        const gifs = [{ title: 'gif1' }, { title: 'gif2' }];
        store.commit('setGifs', gifs);
        expect(store.state.gifs).to.eql(gifs);
      });
    });

    describe('selectGif', () => {
      it('should set the selected gif', () => {
        const gif = { title: 'gif1' };
        store.commit('selectGif', gif);
        expect(store.state.selectedGif).to.eql(gif);
      });
    });
  });

});
