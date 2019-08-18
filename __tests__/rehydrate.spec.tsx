import * as React from 'react';
import * as ReactDOM from "react-dom/server";
import {mount} from 'enzyme';
import {ImportedComponent} from '../src/Component';
import {settings} from '../src/config';
import toLoadable, {done as whenDone} from '../src/loadable';
import {drainHydrateMarks, rehydrateMarks} from '../src/marks';
import imported from '../src/HOC';

import {importMatch} from "../src/loadable";
import {ImportedStream} from "../src/context";
import {act} from "react-dom/test-utils";

describe('SSR Component', () => {
  const TargetComponent = ({payload}: any) => <div>42 - {payload}</div>;

  function importedWrapper(_: any, realImport: any) {
    return realImport;
  }

  describe('client-rehydrate', () => {
    beforeEach(() => {
      settings.SSR = false
    });
    afterEach(() => {
      settings.SSR = true
    });

    it('SSR green case', async () => {
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));
      let wrapper1: any;

      await loader.load();

      act(() => {
        wrapper1 = mount(<ImportedComponent loadable={loader}/>);
      });
      expect(wrapper1.html()).toContain('loaded!');
    });

    it('green case', async () => {
      const renderSpy1 = jest.fn().mockImplementation(A => <div>1 {A && <A/>}</div>);
      const renderSpy2 = jest.fn().mockImplementation(A => <div>2 {A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));
      let wrapper1: any;

      act(() => {
        wrapper1 = mount(<div><ImportedComponent loadable={loader} render={renderSpy1}/></div>);
      });
      expect(wrapper1.html()).not.toContain('loaded!');

      expect(renderSpy1).toHaveBeenCalledWith(undefined, {error: undefined, loading: true}, undefined);

      await loader.load();
      const wrapper2 = mount(<div><ImportedComponent loadable={loader} render={renderSpy2}/></div>);
      expect(wrapper2.html()).toContain('loaded!');
      expect(renderSpy1).toHaveBeenCalledWith(Component, {"error": undefined, "loading": undefined}, undefined);
      expect(renderSpy2).toHaveBeenCalledWith(Component, {"error": undefined, "loading": undefined}, undefined);
      expect(renderSpy1).toHaveBeenCalledTimes(2);
      expect(renderSpy2).toHaveBeenCalledTimes(1);
    });

    it('with precache', async () => {
      const renderSpy1 = jest.fn().mockImplementation(A => <div>{A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const HotComponent = imported(() => Promise.resolve(Component), {noAutoImport: true})
      await HotComponent.preload();

      const wrapper2 = mount(<div><HotComponent importedProps={{render: renderSpy1}}/></div>);
      expect(wrapper2.html()).toContain('loaded!');
      expect(renderSpy1).toHaveBeenCalledWith(Component, {"error": undefined, "loading": undefined}, {});
      expect(renderSpy1).toHaveBeenCalledTimes(1);
    });

    it('without precache', () => {
      const renderSpy2 = jest.fn().mockImplementation(A => <div>{A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const HotComponent = imported(() => Promise.resolve(Component), {noAutoImport: true})
      //HotComponent.preload();
      return Promise.resolve().then(() => {
        const wrapper2 = mount(<div><HotComponent render={renderSpy2}/></div>);
        expect(wrapper2).not.toContain('loaded!');
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
      const renderSpy2 = jest.fn().mockImplementation(A => <div>{A && <A/>}</div>);
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));
      return loader.load().then(() => {
        const wrapper2 = ReactDOM.renderToString(<div>so it<ImportedComponent loadable={loader} render={renderSpy2}/>
        </div>);
        expect(wrapper2).toBe('<div data-reactroot="">so it<div><div>loaded!</div></div></div>');
        expect(renderSpy2).toHaveBeenCalledWith(Component);
      })
    })
  });

  describe('marks', () => {
    it('SSR Marks without stream', (done) => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)), true);
      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        ReactDOM.renderToString(<ImportedComponent loadable={loader1}/>);

        expect(drainHydrateMarks()).toEqual(['mark1']);
        expect(drainHydrateMarks()).toHaveLength(0)

        done();
      }, 32);
    });

    it('SSR Marks with stream', (done) => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)), true);
      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        let stream = 0;
        ReactDOM.renderToString(
          <ImportedStream takeUID={st => stream = st}>
            <ImportedComponent loadable={loader1}/>
          </ImportedStream>
        );

        expect(stream).not.to.equal(0);
        expect(drainHydrateMarks(stream)).toEqual(['mark1']);
        expect(drainHydrateMarks(stream)).toHaveLength(0);

        done();
      }, 32);
    });

    it('should generate marks', (done) => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)), true);
      const loader2 = toLoadable(() => {
        importedWrapper('imported_mark2-1_component', Promise.resolve(TargetComponent))
        return importedWrapper('imported_mark2-2_component', Promise.resolve(TargetComponent));
      }, true);
      const loader3 = toLoadable(() => Promise.resolve(TargetComponent), true);

      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const w1 = mount(<ImportedComponent loadable={loader1}/>);
        expect(w1.find(TargetComponent)).toContain(42);
        expect(mount(<ImportedComponent loadable={loader2}/>)).toContain(42);
        expect(mount(<ImportedComponent loadable={loader3}/>)).toContain(42);

        expect(drainHydrateMarks()).toEqual(['mark1', 'mark2-1', 'mark2-2']);
        expect(drainHydrateMarks()).toHaveLength(0);

        done();
      }, 32);
    });

    it('should render async', (done) => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)), false);
      setImmediate(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const wrapper1 = mount(<ImportedComponent loadable={loader}/>);
        expect(drainHydrateMarks()).toEqual(['mark1']);
        expect(wrapper1.find(TargetComponent)).not.to.be.present();
        setImmediate(() => {
          wrapper1.update();
          expect(wrapper1.find(TargetComponent)).toContain('42');
          done();
        })
      });
    });

    it('should render sync', (done) => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)));
      rehydrateMarks(['mark1']);
      setImmediate(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const wrapper1 = mount(<ImportedComponent loadable={loader}/>);
        expect(drainHydrateMarks()).toEqual(['mark1']);
        expect(wrapper1.find(TargetComponent)).to.be.present();
        done();
      });
    });

    describe('stream marks', () => {
      it('multy stream render', () => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const loader1 = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)));
        const loader2 = toLoadable(() => importedWrapper('imported_mark2_component', Promise.resolve(TargetComponent)));
        const loader3 = toLoadable(() => importedWrapper('imported_mark3_component', Promise.resolve(TargetComponent)));

        let uid2 = 0;
        let uid3 = 0;

        const w1 = mount(<ImportedComponent loadable={loader1}/>);
        const w2 = mount(
          <ImportedStream takeUID={uid => {
            uid2 = uid
          }}>
            <ImportedComponent loadable={loader2}/>
          </ImportedStream>
        );
        const w3 = mount(
          <ImportedStream takeUID={uid => {
            uid3 = uid
          }}>
            <ImportedComponent loadable={loader3}/>
            <ImportedComponent loadable={loader2}/>
          </ImportedStream>
        );

        expect(drainHydrateMarks()).toEqual(['mark1']);
        expect(drainHydrateMarks(uid2)).toEqual(['mark2']);
        expect(drainHydrateMarks(uid3)).toEqual(['mark3', 'mark2']);
      });
    })
  });

  describe('done markers', () => {

    it('red case', () => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false);
      const loader2 = toLoadable(() => {
        loader1.load();
        return importedWrapper('imported_mark2_component', Promise.resolve(TargetComponent))
      }, false);
      expect(loader1.done).toBe(false);
      expect(loader2.done).toBe(false);
      return whenDone()
        .then(() => {
          expect(loader1.done).toBe(false);
          expect(loader2.done).toBe(false)
        })
        .then(() => rehydrateMarks(['mark2']))
        .then(a => a)
        .then(() => {
          expect(loader1.done).toBe(false);
          expect(loader2.done).toBe(true)
        })
    });

    it('should report loading complete', () => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false);
      const loader2 = toLoadable(() => {
        loader1.load();
        return importedWrapper('imported_mark2_component', Promise.resolve(TargetComponent))
      }, false);
      expect(loader1.done).toBe(false);
      expect(loader2.done).toBe(false);
      return whenDone()
        .then(() => {
          expect(loader1.done).toBe(false);
          expect(loader2.done).toBe(false)
        })
        .then(() => rehydrateMarks(['mark2']))
        .then(whenDone)
        .then(() => {
          expect(loader1.done).toBe(true);
          expect(loader2.done).toBe(true)
        })
    });
  });

})
;