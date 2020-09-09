import '@theuiteam/lib-builder/configs/setupEnzyme';
import { mount } from 'enzyme';
import * as React from 'react';

import { toLoadable } from '../src/loadable/toLoadable';
import { ImportedComponent } from '../src/ui/Component';
import loader from '../src/ui/HOC';

describe('Async Component', () => {
  describe('loader', () => {
    it('should load component', done => {
      const TargetComponent = ({ payload }: any) => <div>{payload}</div>;
      const Component = loader(() => Promise.resolve(TargetComponent));

      const wrapper = mount(<Component payload={42} />);

      expect(wrapper.find(TargetComponent)).toHaveLength(0);
      setImmediate(() => {
        wrapper.update();
        expect(wrapper.find(TargetComponent).html()).toContain('42');
        wrapper.unmount();
        done();
      });
    });

    it('forwardRef', done => {
      const TargetComponent = React.forwardRef<any, any>(({ payload }, fref) => <div ref={fref}>{payload}</div>);
      const Component = loader(() => Promise.resolve(TargetComponent));
      const ref = React.createRef();
      mount(<Component payload={42} ref={ref} />);

      setImmediate(() => {
        expect(ref.current).not.toBe(null);
        done();
      });
    });
  });

  describe('SSR', () => {
    it('should precache Components', async () => {
      const TargetComponent = ({ payload }: any) => <div>{payload}</div>;
      const LoadingComponent = () => <div>loading</div>;
      const loadable = toLoadable(() => Promise.resolve(TargetComponent));
      await loadable.load();

      const wrapper = mount(
        <ImportedComponent loadable={loadable} LoadingComponent={LoadingComponent} forwardProps={{ payload: 42 }} />
      );
      expect(wrapper.find(LoadingComponent)).toHaveLength(0);
      expect(wrapper.find(TargetComponent).html()).toContain('42');
    });
  });
});
