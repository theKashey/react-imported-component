import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import {mount} from 'enzyme';
import HotComponentLoader from '../src/Component';
import toLoadable, {done as whenDone} from '../src/loadable';
import {drainHydrateMarks, rehydrateMarks} from '../src/marks';

chai.use(chaiEnzyme());

describe('SSR Component', () => {
  const TargetComponent = ({payload}) => <div>42 - payload</div>;

  function importedWrapper(marker, name, realImport) {
    return realImport;
  }

  describe('marks', (done) => {
    it('should generate marks', () => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => importedWrapper('imported-component', 'mark1', Promise.resolve(TargetComponent)), true);
      const loader2 = toLoadable(() => importedWrapper('imported-component', 'mark2', Promise.resolve(TargetComponent)), true);
      const loader3 = toLoadable(() => Promise.resolve(TargetComponent), true);

      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        const w1 = mount(<HotComponentLoader loadable={loader1}/>);
        expect(w1.find(TargetComponent)).to.contain.text(42);
        expect(mount(<HotComponentLoader loadable={loader2}/>)).to.contain.text(42);
        expect(mount(<HotComponentLoader loadable={loader3}/>)).to.contain.text(42);

        expect(drainHydrateMarks()).to.be.deep.equal(['mark1', 'mark2']);
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
  });

  describe('done markers', () => {

    it('red case', () => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false);
      const loader2 = toLoadable(() => { loader1.load(); return importedWrapper('imported-component', 'mark2', Promise.resolve(TargetComponent))}, false);
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
      const loader2 = toLoadable(() => { loader1.load(); return importedWrapper('imported-component', 'mark2', Promise.resolve(TargetComponent))}, false);
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

});