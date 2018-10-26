import React, { Suspense } from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';
import TestRenderer from 'react-test-renderer';
import loader from '../src/HOC';
import HotComponentLoader from '../src/Component';
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
        wrapper.unmount();
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
        wrapper.update();
        expect(wrapper.find(TargetComponent)).to.be.present();
        done();
      });
    });

    it('forwardRef', (done) => {
      const TargetComponent = React.forwardRef(({payload}, ref) => <div ref={ref}>{payload}</div>);
      const Component = loader(() => TargetComponent);
      const ref = React.createRef();
      mount(<Component payload={42} ref={ref}/>);
      setImmediate(() => {
        expect(ref.current).not.to.equal(null);
        done();
      });
    });
  });

  describe('Component API', () => {
    it('should provide the same API via React Component', (done) => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const importStatement = () => Promise.resolve(TargetComponent);
      const wrapper = mount(<HotComponentLoader loadable={importStatement} forwardProps={{payload:42}}/>);
      expect(wrapper.find(TargetComponent)).to.be.not.present();
      setImmediate(() => {
        wrapper.update();
        expect(wrapper.find(TargetComponent)).to.be.present();
        expect(wrapper.find(TargetComponent)).to.contain.text('42');
        done();
      });
    });

    it('forwardRef', (done) => {
      class TargetClass extends React.Component {
        render() {
          return <div>42</div>
        }
      }
      const ref = React.createRef();
      const importStatement = () => Promise.resolve(TargetClass);
      mount(<HotComponentLoader loadable={importStatement} forwardProps={{payload: 42}} forwardRef={ref}/>);
      setImmediate(() => {
        expect(ref.current.constructor.name).to.equal('TargetClass');
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
          forwardProps={{payload: 42}}
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
        forwardProps={{payload: 42}}
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

  describe('async loader', () => {

    const spy = sinon.spy();

    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = {hasError: false};
      }

      componentDidCatch(error, info) {
        spy(error, info);
      }

      render() {
        return this.props.children;
      }
    }

    it('suspence loader, not to be called without flag', () => {
      const loader = toLoadable(() => Promise.resolve(() => <div>42</div>));
      const wrapper = mount(
        <ErrorBoundary>
          <HotComponentLoader
            loadable={loader}
          />
        </ErrorBoundary>
      );
      sinon.assert.notCalled(spy);
    });

    it('suspence loader, be called', () => {
      const promise = Promise.resolve(() => <div>42</div>);
      const loader = toLoadable(() => promise);

      TestRenderer.create(
        <Suspense fallback="not loaded">
          <HotComponentLoader
            loadable={loader}
            async
          />
        </Suspense>
      );

    });
  });
});