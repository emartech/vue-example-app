import Vue from 'vue';
import Vuex from 'vuex';
import GiphyFetcher from '../libraries/giphy/fetcher';

Vue.use(Vuex);

export const DEFAULT_DEPENDENCIES = {
  giphyFetcher: GiphyFetcher.create(),
  randomGenerator: (max) => Math.floor(Math.random() * max)
};

export const RANDOM_SEARCH_TERMS = ['cats in boots', 'simons cat', 'westie in panic', 'nooooo', 'yesss'];


export const createStore = function(libraries) {
  libraries = { ...DEFAULT_DEPENDENCIES, ...libraries };

  return new Vuex.Store({
    state: {
      searchTerm: '',
      gifs: [],
      selectedGif: {}
    },


    mutations: {
      setSearchTerm(state, searchTerm) {
        state.searchTerm = searchTerm;
      },

      setGifs(state, gifs) {
        state.gifs = gifs;
      },

      selectGif(state, gif) {
        state.selectedGif = gif;
      }
    },


    actions: {
      async search({ commit, state }, searchTerm) {
        commit('setSearchTerm', searchTerm);
        commit('setGifs', await libraries.giphyFetcher.searchFor(state.searchTerm));
      },

      async searchRandom({ dispatch }) {
        const randomIndex = libraries.randomGenerator(5);
        await dispatch('search', RANDOM_SEARCH_TERMS[randomIndex]);
      }
    }
  })
};
