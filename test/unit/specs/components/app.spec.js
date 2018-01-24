import { shallow } from 'vue-test-utils';
import { createStore } from '../../../../src/store/store';
import App from '../../../../src/components/app/app';

describe('App Component', () => {

  it('should render header', () => {
    const component = shallow(App, { store: createStore() });
    expect(component.find('h1').text()).to.equal('EmaGif, a Vue Example App');
  });

});
