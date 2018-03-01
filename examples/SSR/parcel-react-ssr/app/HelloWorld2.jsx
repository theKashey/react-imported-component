import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './codeSplitAssets/NyanCat.css';
import Go from './codeSplitAssets/NyanCat.js';

export default class Nyan extends Component {

    componentDidMount() {
        Go();
    }

    render() {
        return <div>
            <h1 className="hello-world">Hello world 2!</h1>
            <p style={{ textAlign: 'center' }}>
                This is a code-split component.
                <br />
                <Link to="/">Click here</Link> to see an ordinary component.
            </p>
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
