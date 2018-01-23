import sinon from 'sinon';

export default class FakeGiphyFetcher {

  static create() {
    let fakeGiphyFetcher = new FakeGiphyFetcher();
    fakeGiphyFetcher.searchFor = sinon.stub();
    return fakeGiphyFetcher;
  }

}
