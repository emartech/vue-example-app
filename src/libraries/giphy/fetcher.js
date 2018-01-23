import queryString from 'query-string';

export const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search';
export const GIPHY_API_KEY = 'MDaqTfvabAWBf0GqcLmaAHbLP3kxa3a4';

export const FETCHER_SETTINGS = {
  limit: 18,
  offset: 0,
  rating: 'R',
  lang: 'en'
};

export default class GiphyFetcher {

  constructor(apiUrl = GIPHY_API_URL, apiKey = GIPHY_API_KEY, fetcherSettings = FETCHER_SETTINGS) {
    this._apiKey = apiKey;
    this._apiUrl = apiUrl;
    this._fetcherSettings = fetcherSettings;
  }

  async searchFor(term) {
    const queryString = this._getQueryStringForSearch(term);
    const request = await fetch(`${this._apiUrl}?${queryString}`);
    const result = await request.json();

    return result.data.map(this._getGifData);
  }

  _getQueryStringForSearch(term) {
    return queryString.stringify(Object.assign({
      api_key: this._apiKey,
      q: term
    }, this._fetcherSettings));
  }

  _getGifData(gifData) {
    return {
      title: gifData.title,
      url: gifData.url,
      previewUrl: gifData.images.downsized.url,
      imageUrl: gifData.images.original.url
    };
  }

  static create(apiUrl, apiKey, fetcherSettings) {
    return new GiphyFetcher(apiUrl, apiKey, fetcherSettings);
  }
}
