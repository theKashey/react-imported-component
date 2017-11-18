import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import {mount} from 'enzyme';
import HotComponentLoader from '../src/Component';
import toLoadable, {done as whenDone} from '../src/loadable';
import {drainHydrateMarks, rehydrateMarks} from '../src/marks';

chai.use(chaiEnzyme());

describe('SSR Component', () => {
  const TargetComponent = ({payload}) => <div>42</div>;

  describe('marks', () => {
    it('should generate marks', () => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader = toLoadable(() => Promise.resolve(TargetComponent), false, 'mark1');
      expect(drainHydrateMarks()).to.have.length(0);
      mount(<HotComponentLoader ssrMark="mark1" loadable={loader}/>);
      mount(<HotComponentLoader ssrMark="mark2" loadable={loader}/>);
      expect(drainHydrateMarks()).to.be.deep.equal(['mark1', 'mark2']);
      expect(drainHydrateMarks()).to.have.length(0);
    });

    it('should render async', (done) => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader = toLoadable(() => Promise.resolve(TargetComponent), false, 'mark1');
      setImmediate(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        const wrapper1 = mount(<HotComponentLoader ssrMark="mark1" loadable={loader}/>);
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
      const loader = toLoadable(() => Promise.resolve(TargetComponent), false, 'mark1');
      rehydrateMarks(['mark1']);
      setImmediate(() => {
        expect(drainHydrateMarks()).to.have.length(0);
        const wrapper1 = mount(<HotComponentLoader ssrMark="mark1" loadable={loader}/>);
        expect(drainHydrateMarks()).to.be.deep.equal(['mark1']);
        expect(wrapper1.find(TargetComponent)).to.be.present();
        done();
      });
    });
  });

  describe('done markers', () => {

    it('red case', () => {
      expect(drainHydrateMarks()).to.have.length(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false, 'mark1');
      const loader2 = toLoadable(() => { loader1.load(); return Promise.resolve(TargetComponent)}, false, 'mark2');
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
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false, 'mark1');
      const loader2 = toLoadable(() => { loader1.load(); return Promise.resolve(TargetComponent)}, false, 'mark2');
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