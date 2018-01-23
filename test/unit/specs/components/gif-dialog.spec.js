import {mount} from 'vue-test-utils';
import GifDialog from '../../../../src/components/gif-dialog/gif-dialog.vue';

describe('Gif Dialog Component', () => {

  const SAMPLE_GIF = {
    imageUrl: "https://domain.com/some_image_url.gif",
    previewUrl: "https://domain.com/some_preview_url.gif",
    title: "My title",
    url: "https://url.com"
  };

  context('with a @gif', () => {
    let component;

    beforeEach(() => {
      component = mount(GifDialog, {
        propsData: {
          gif: SAMPLE_GIF
        }
      });
    });

    it('should have a headline with the gif\'s title', () => {
      expect(component.find('e-dialog').attributes().headline).to.eql(SAMPLE_GIF.title);
    });

    it('should have a link targeted to the gif\'s url', () => {
      expect(component.find('a').attributes().href).to.eql(SAMPLE_GIF.url);
    });

    it('should have an image with the gif itself', () => {
      expect(component.find('img').attributes().src).to.eql(SAMPLE_GIF.imageUrl);
    });
  });

});
