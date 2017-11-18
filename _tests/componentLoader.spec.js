import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import {mount} from 'enzyme';
import loader from '../src/HOC';
import HotComponentLoader from '../src/Component';
import toLoadable from '../src/loadable';

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
        expect(wrapper.find(TargetComponent)).to.contain('42');
        done();
      });
    });

    it('should pass props', (done) => {
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
        done();
      });
    });
  });

  describe("SSR", () => {

    it('should precache Components', (done) => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const LoadingComponent = () => <div>loading</div>;
      const loader = toLoadable(() => Promise.resolve(TargetComponent));

      setImmediate(() => {

        const wrapper = mount(<HotComponentLoader
          loadable={loader}
          LoadingComponent={LoadingComponent}
          payload={42}
        />);
        expect(wrapper.find(LoadingComponent)).not.to.be.present();
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain.text('42');
        done();
      });
    });

    it('should not precache Components', (done) => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const LoadingComponent = () => <div>loading</div>;
      const loader = toLoadable(() => Promise.resolve(TargetComponent), false);

      setImmediate(() => {

        const wrapper = mount(<HotComponentLoader
          loadable={loader}
          LoadingComponent={LoadingComponent}
          payload={42}
        />);
        expect(wrapper.find(LoadingComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).not.to.be.present();
        setImmediate(() => {
          expect(wrapper.find(LoadingComponent)).not.to.be.present();
          expect(wrapper.find(TargetComponent)).to.be.present();
          done();
        });
      });
    });
  });

  describe('HotComponentLoader', () => {
    it('component lifecycle', (done) => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const LoadingComponent = () => <div>loading</div>;
      const ErrorComponent = () => <div>error</div>;
      const loader = toLoadable(() => Promise.resolve(TargetComponent), false);

      const wrapper = mount(<HotComponentLoader
        loadable={loader}
        LoadingComponent={LoadingComponent}
        ErrorComponent={ErrorComponent}
        payload={42}
      />);
      expect(wrapper.find(LoadingComponent)).to.be.present();
      expect(wrapper.find(TargetComponent)).to.be.not.present();

      setImmediate(() => {
        expect(wrapper.find(LoadingComponent)).not.to.be.present();
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain.text('42');
        done();
      });
    });

    it('component error state', (done) => {
      const ErrorComponent = () => <div>error</div>;
      const loader = toLoadable(() => Promise.reject('error'));

      const wrapper = mount(<HotComponentLoader
        loadable={loader}
        ErrorComponent={ErrorComponent}
      />);
      setImmediate(() => {
        expect(wrapper.find(ErrorComponent)).to.be.present();
        done();
      });
    });
  });
});