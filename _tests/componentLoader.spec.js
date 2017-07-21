import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import {mount} from 'enzyme';
import loader, {HotComponentLoader} from '../src/index';

chai.use(chaiEnzyme());

describe('Async Component', () => {
  describe('loader', (done) => {
    it('should load component', () => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const Component = loader(() => TargetComponent);
      const wrapper = mount(<Component payload={42}/>);
      expect(wrapper.find(TargetComponent)).to.be.not.present();
      setImmediate(() => {
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain('42')
      });
    });

    it('should pass props', () => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const LoadingComponent = () => <div>loading</div>;
      const ErrorComponent = () => <div>error</div>;
      const exportPicker = (exports) => exports.component;
      const Component = loader(
        () => Promise.resolve({component: TargetComponent}), {
          LoadingComponent,
          ErrorComponent,
          exportPicker
        });
      const wrapper = mount(<Component payload={42}/>);
      expect(wrapper.find(HotComponentLoader)).to.be.present();
      expect(wrapper.find(HotComponentLoader)).to.have.prop('LoadingComponent', LoadingComponent);
      expect(wrapper.find(HotComponentLoader)).to.have.prop('ErrorComponent', ErrorComponent);
      expect(wrapper.find(HotComponentLoader)).to.have.prop('exportPicker', exportPicker);
      setImmediate(() => {
        expect(wrapper.find(TargetComponent)).to.be.present();
      });
    });
  });

  describe('HotComponentLoader', () => {
    it('component lifecycle', () => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const LoadingComponent = () => <div>loading</div>;
      const ErrorComponent = () => <div>error</div>;
      const loader = () => Promise.resolve(TargetComponent);

      const wrapper = mount(<HotComponentLoader
        loader={loader}
        LoadingComponent={LoadingComponent}
        ErrorComponent={ErrorComponent}
        payload={42}
      />);
      expect(wrapper.find(LoadingComponent)).to.be.present();
      expect(wrapper.find(TargetComponent)).to.be.not.present();

      setImmediate(() => {
        expect(wrapper.find(LoadingComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain('42')
      });
    });

    it('component error state', () => {
      const ErrorComponent = () => <div>error</div>;
      const loader = () => Promise.reject('error');

      const wrapper = mount(<HotComponentLoader
        loader={loader}
        ErrorComponent={ErrorComponent}
      />);
      setImmediate(() => {
        expect(wrapper.find(ErrorComponent)).to.be.present();
      });
    });
  });
});