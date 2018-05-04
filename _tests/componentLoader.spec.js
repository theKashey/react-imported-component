import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';
import deepForceUpdate from 'react-deep-force-update';
import loader from '../src/HOC';
import HotComponentLoader, {settings} from '../src/Component';
import toLoadable from '../src/loadable';

Enzyme.configure({adapter: new Adapter()});
chai.use(chaiEnzyme());

describe('Async Component', () => {
  describe('loader', () => {
    it('should load component', (done) => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const Component = loader(() => TargetComponent);
      const wrapper = mount(<Component payload={42}/>);
      expect(wrapper.find(TargetComponent)).to.be.not.present();
      setImmediate(() => {
        wrapper.update();
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain.text('42');
        done();
      });
    });

    it('should re-load component', (done) => {
      const spy = sinon.spy();
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const Component = loader(() => {
        spy();
        return TargetComponent
      }, {noAutoImport: true});
      settings.hot = true;
      const wrapper = mount(<Component payload={42}/>);
      setImmediate(() => {
        sinon.assert.calledOnce(spy);
        wrapper.setProps({payload: 42});
        setImmediate(() => {
          sinon.assert.calledOnce(spy);
          wrapper.setProps({payload: 43});
          setImmediate(() => {
            sinon.assert.calledOnce(spy);
            wrapper.update();
            const Hot = wrapper.find(HotComponentLoader).instance();
            deepForceUpdate(Hot);
            setImmediate(() => {
              setImmediate(() => {
                sinon.assert.calledTwice(spy);
                settings.hot = false;
                done();
              });
            });
          });
        });
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
        wrapper.update();
        expect(wrapper.find(TargetComponent)).to.be.present();
        done();
      });
    });
  });

  describe('Component API', () => {
    it('should provide the same API via React Component', () => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const importStatement = () => Promise.resolve(TargetComponent);
      const wrapper = mount(<HotComponentLoader loadable={importStatement} payload={42}/>);
      expect(wrapper.find(TargetComponent)).to.be.not.present();
      setImmediate(() => {
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain.text('42');
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
          wrapper.update();
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
        wrapper.update();
        expect(wrapper.find(LoadingComponent)).not.to.be.present();
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain.text('42');
        done();
      });
    });

    it('component error state', (done) => {
      const ErrorComponent = () => <div>error</div>;
      const loader = toLoadable(() => Promise.reject('component error'));
      const onException = sinon.stub();
      process.on('unhandledRejection', onException);

      const wrapper = mount(<HotComponentLoader
        loadable={loader}
        ErrorComponent={ErrorComponent}
      />);
      setImmediate(() => {
        wrapper.update();
        expect(wrapper.find(ErrorComponent)).to.be.present();
        sinon.assert.calledWith(onException, 'component error');
        process.removeListener('unhandledRejection', onException);
        done();
      });
    });

    it('component error state catched', (done) => {
      const ErrorComponent = () => <div>error</div>;
      const loader = toLoadable(() => Promise.reject('component error'));
      const onError = sinon.stub();
      const onException = sinon.stub();
      process.on('unhandledRejection', onException);

      const wrapper = mount(<HotComponentLoader
        loadable={loader}
        ErrorComponent={ErrorComponent}
        onError={onError}
      />);
      setImmediate(() => {
        wrapper.update();
        expect(wrapper.find(ErrorComponent)).to.be.present();
        sinon.assert.notCalled(onException);
        sinon.assert.calledWith(onError, 'component error');
        process.removeListener('unhandledRejection', onException);
        done();
      });
    });
  });
});