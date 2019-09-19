import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import './codeSplitAssets/NyanCat.css';
import Go from './codeSplitAssets/NyanCat.js';
import {say42} from "./codeSplitAssets/utils";

export default class Nyan extends Component {

  componentDidMount() {
    Go();
  }

  render() {
    return <div style={{position:'absolute',top:'500px'}}>
      I am async {say42()} cat
      <div className="wrapper">
        <div className="rainbow">
          <span></span>
        </div>
        <div className="nyan-cat">
          <div className="feet"></div>
          <div className="tail">
            <span></span>
          </div>
          <div className="body"></div>
          <div className="head"></div>
        </div>
        <div className="stars">

        </div>
      </div>
    </div>
  }
}
