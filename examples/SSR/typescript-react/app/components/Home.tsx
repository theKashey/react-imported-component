import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const Home = () => (
  <div>
    <Helmet>
      <title>Homepage!</title>
    </Helmet>
    <Link to="/another">Link to Another</Link>
    <div>Hello!</div>
  </div>
);
export default Home;
