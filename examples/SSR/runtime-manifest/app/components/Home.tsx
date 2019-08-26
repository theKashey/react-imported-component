import * as React from "react";
import {Helmet} from "react-helmet";
import {Link} from "react-router-dom";
import imported, {lazy, LazyBoundary, remapImports} from "react-imported-component";

const LZ = lazy(() => import("./LazyTarget"));

const ND = imported(
  () => remapImports(
    import('./NotDefault'),
    ({NotDefault}) => NotDefault
  )
);

const Home = () => (
  <div>
    <Helmet>
      <title>Homepage!</title>
    </Helmet>
    <Link to="/another">Link to Another</Link>
    <div>Hello!</div>
    <LazyBoundary fallback="loading">
      <LZ/>
      <ND p1={4}/>
    </LazyBoundary>
  </div>
);
export default Home;
