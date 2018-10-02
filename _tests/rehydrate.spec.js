import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import ReactDOM from "react-dom/server";
import HotComponentLoader, {settings} from '../src/Component';
import toLoadable, {done as whenDone} from '../src/loadable';
import {drainHydrateMarks, rehydrateMarks} from '../src/marks';
import imported from '../src/HOC';

import {importMatch} from "../src/loadable";
import Adapter from "./ReactSixteenAdapter";
import Enzyme from "enzyme/build/index";
import {ImportedStream} from "../src/context";

Enzyme.configure({adapter: new Adapter()});
chai.use(chaiEnzyme());

describe('SSR Component', () => {
  const TargetComponent = ({payload}) => <div>42 - payload</div>;

  function importedWrapper(marker, name, realImport) {
    return realImport;
  }

  describe('match', () => {

    beforeEach(() => {
      settings.SSR = true
    });
    afterEach(() => {
      settings.SSR = true
    });

    it('standard', () => {
      expect(importMatch(`() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)), true)`)).to.be.deep.equal(['mark1']);
    });

    it('webpack', () => {
      expect(importMatch(`() => importedWrapper('imported-component', 'mark1', __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./components/Another */ "./app/components/Another.tsx")))`)).to.be.deep.equal(['mark1']);
    })

    it('parcel', () => {
      expect(importMatch(`function _() {
        return importedWrapper('imported-component', 'mark1', require("_bundle_loader")(require.resolve('./HelloWorld3')));
    }`)).to.be.deep.equal(['mark1']);
    })
  });

  describe('client-rehydrate', () => {
    beforeEach(() => {
      settings.SSR = false
    });
    afterEach(() => {
      settings.SSR = true
    });
    it('green case', () => {
      const renderSpy1 = sinon.stub().callsFake(A => <div>{A && <A/>}</div>);
      const renderSpy2 = sinon.stub().callsFake(A => <div>{A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));

      const wrapper1 = mount(<div><HotComponentLoader loadable={loader} render={renderSpy1}/></div>);
      expect(wrapper1).not.to.contain.text('loaded!');

      sinon.assert.calledWith(renderSpy1, undefined);
      return loader.load().then(() => {
        const wrapper2 = mount(<div><HotComponentLoader loadable={loader} render={renderSpy2}/></div>);
        expect(wrapper2).to.contain.text('loaded!');
        sinon.assert.calledWith(renderSpy1, Component);
        sinon.assert.calledWith(renderSpy2, Component);
        sinon.assert.calledThrice(renderSpy1);
        sinon.assert.calledOnce(renderSpy2);
      })
    });

    it('with precache', () => {
      const renderSpy1 = sinon.stub().callsFake(A => <div>{A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const HotComponent = imported(() => Promise.resolve(Component), {noAutoImport: true})
      return HotComponent.preload().then(() => {
        const wrapper2 = mount(<div><HotComponent importedProps={{render: renderSpy1}}/></div>);
        expect(wrapper2).to.contain.text('loaded!');
        sinon.assert.calledWith(renderSpy1, Component);
        sinon.assert.calledOnce(renderSpy1);
      })
    })

    it('without precache', () => {
      const renderSpy2 = sinon.stub().callsFake(A => <div>{A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const HotComponent = imported(() => Promise.resolve(Component), {noAutoImport: true})
      //HotComponent.preload();
      return Promise.resolve().then(() => {
        const wrapper2 = mount(<div><HotComponent render={renderSpy2}/></div>);
        expect(wrapper2).not.to.contain.text('loaded!');
      })
    })
  });

  describe('server-rehydrate', () => {
    beforeEach(() => {
      settings.SSR = true
    });
    afterEach(() => {
      settings.SSR = true
    });
    it('green case', () => {
      const renderSpy2 = sinon.stub().callsFake(A => <div>{A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));
      return loader.load().then(() => {
        const wrapper2 = ReactDOM.renderToString(<div>so it<HotComponentLoader loadable={loader} render={renderSpy2}/>
        </div>);
        expect(wrapper2).to.be.equal('<div data-reactroot="">so it<div><div>loaded!</div></div></div>');
        sinon.assert.calledWith(renderSpy2, Component);
      })
    })
  });

  describe('marks', () => {
    it('SSR Marks without stream', (done) => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)), true);
      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        ReactDOM.renderToString(<HotComponentLoader loadable={loader1}/>);

        expect(drainHydrateMarks()).to.be.deep.equal(['mark1']);
        expect(drainHydrateMarks()).to.have.length(0);

        done();
      }, 32);
    });

    it('SSR Marks with stream', (done) => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)), true);
      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        let stream = 0;
        ReactDOM.renderToString(
          <ImportedStream takeUID={st => stream = st}>
            <HotComponentLoader loadable={loader1}/>
          </ImportedStream>
        );

        expect(stream).not.to.equal(0);
        expect(drainHydrateMarks(stream)).to.be.deep.equal(['mark1']);
        expect(drainHydrateMarks(stream)).to.have.length(0);

        done();
      }, 32);
    });

    it('should generate marks', (done) => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)), true);
      const loader2 = toLoadable(() => {
        importedWrapper('imported-component', 'mark2-1', Promise.resolve(TargetComponent))
        return importedWrapper('imported-component', 'mark2-2', Promise.resolve(TargetComponent));
      }, true);
      const loader3 = toLoadable(() => Promise.resolve(TargetComponent), true);

      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        const w1 = mount(<HotComponentLoader loadable={loader1}/>);
        expect(w1.find(TargetComponent)).to.contain.text(42);
        expect(mount(<HotComponentLoader loadable={loader2}/>)).to.contain.text(42);
        expect(mount(<HotComponentLoader loadable={loader3}/>)).to.contain.text(42);

        expect(drainHydrateMarks()).to.be.deep.equal(['mark1', 'mark2-1', 'mark2-2']);
        expect(drainHydrateMarks()).to.have.length(0);

        done();
      }, 32);
    });

    it('should render async', (done) => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader = toLoadable(() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)), false);
      setImmediate(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        const wrapper1 = mount(<HotComponentLoader loadable={loader}/>);
        expect(drainHydrateMarks()).to.be.deep.equal(['mark1']);
        expect(wrapper1.find(TargetComponent)).not.to.be.present();
        setImmediate(() => {
          wrapper1.update();
          expect(wrapper1.find(TargetComponent)).to.contain.text('42');
          done();
        })
      });
    });

    it('should render sync', (done) => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader = toLoadable(() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)));
      rehydrateMarks(['mark1']);
      setImmediate(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        const wrapper1 = mount(<HotComponentLoader loadable={loader}/>);
        expect(drainHydrateMarks()).to.be.deep.equal(['mark1']);
        expect(wrapper1.find(TargetComponent)).to.be.present();
        done();
      });
    });

    describe('stream marks', () => {
      it('multy stream render', () => {
        expect(drainHydrateMarks()).to.have.length(0);
        const loader1 = toLoadable(() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)));
        const loader2 = toLoadable(() => importedWrapper('imported-component', 'mark2', Promise.resolve(TargetComponent)));
        const loader3 = toLoadable(() => importedWrapper('imported-component', 'mark3', Promise.resolve(TargetComponent)));

        let uid2 = 0;
        let uid3 = 0;

        const w1 = mount(<HotComponentLoader loadable={loader1}/>);
        const w2 = mount(
          <ImportedStream takeUID={uid => {
            uid2 = uid
          }}>
            <HotComponentLoader
              loadable={loader2}/>
          </ImportedStream>
        );
        const w3 = mount(
          <ImportedStream takeUID={uid => {
            uid3 = uid
          }}>
            <HotComponentLoader
              loadable={loader3}/>
            <HotComponentLoader
              loadable={loader2}/>
          </ImportedStream>
        );

        expect(drainHydrateMarks()).to.be.deep.equal(['mark1']);
        expect(drainHydrateMarks(uid2)).to.be.deep.equal(['mark2']);
        expect(drainHydrateMarks(uid3)).to.be.deep.equal(['mark3', 'mark2']);
      });
    })
  });

  describe('done markers', () => {

    it('red case', () => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false);
      const loader2 = toLoadable(() => {
        loader1.load();
        return importedWrapper('imported-component', 'mark2', Promise.resolve(TargetComponent))
      }, false);
      expect(loader1.done).to.be.equal(false);
      expect(loader2.done).to.be.equal(false);
      return whenDone()
        .then(() => {
          expect(loader1.done).to.be.equal(false);
          expect(loader2.done).to.be.equal(false)
        })
        .then(() => rehydrateMarks(['mark2']))
        .then(a => a)
        .then(() => {
          expect(loader1.done).to.be.equal(false);
          expect(loader2.done).to.be.equal(true)
        })
    });

    it('should report loading complete', () => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false);
      const loader2 = toLoadable(() => {
        loader1.load();
        return importedWrapper('imported-component', 'mark2', Promise.resolve(TargetComponent))
      }, false);
      expect(loader1.done).to.be.equal(false);
      expect(loader2.done).to.be.equal(false);
      return whenDone()
        .then(() => {
          expect(loader1.done).to.be.equal(false);
          expect(loader2.done).to.be.equal(false)
        })
        .then(() => rehydrateMarks(['mark2']))
        .then(whenDone)
        .then(() => {
          expect(loader1.done).to.be.equal(true);
          expect(loader2.done).to.be.equal(true)
        })
    });
  });

})
;