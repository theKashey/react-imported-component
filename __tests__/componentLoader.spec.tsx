import * as React from 'react';
import {mount} from 'enzyme';
import loader from '../src/HOC';
import {ImportedComponent} from '../src/Component';
import toLoadable from '../src/loadable';

describe('Async Component', () => {

  describe('loader', () => {
    it('should load component', (done) => {
      const TargetComponent = ({payload}: any) => <div>{payload}</div>;
      const Component = loader(() => TargetComponent);

      const wrapper = mount(<Component payload={42}/>);

      expect(wrapper.find(TargetComponent)).toHaveLength(0)
      setImmediate(() => {
        wrapper.update();
        expect(wrapper.find(TargetComponent).html()).toContain("42");
        wrapper.unmount();
        done();
      });
    });

    it('forwardRef', (done) => {
      const TargetComponent = React.forwardRef<any, any>(({payload}, ref) => <div ref={ref}>{payload}</div>);
      const Component = loader(() => TargetComponent);
      const ref = React.createRef();
      mount(<Component payload={42} ref={ref}/>);

      setImmediate(() => {
        expect(ref.current).not.toBe(null);
        done();
      });
    });
  });

  describe("SSR", () => {

    it('should precache Components', async () => {
      const TargetComponent = ({payload}) => <div>{payload}</div>;
      const LoadingComponent = () => <div>loading</div>;
      const loader = toLoadable(() => Promise.resolve(TargetComponent));
      await loader.load();

      const wrapper = mount(
        <ImportedComponent
          loadable={loader}
          LoadingComponent={LoadingComponent}
          forwardProps={{payload: 42}}
        />
      );
      expect(wrapper.find(LoadingComponent)).toHaveLength(0);
      expect(wrapper.find(TargetComponent).html()).toContain('42');
    });
  });
});