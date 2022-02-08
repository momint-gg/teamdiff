import React from 'react'

import 'bootstrap/dist/css/bootstrap.css'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from "react-router-dom";
import About from '../pages/About';
import Home from '../pages';
import Collection from '../pages/Collection';
import ConnectWallet from '../pages/ConnectWallet';

export default function NavigationBar() {
    return (
            <Router>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link to="/">
                        <a className="navbar-brand" >
                            Team Diff
                        </a>
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                        <div className="navbar-nav">
                            <Link to="/">
                                <a className="nav-link active" aria-current="page" href="#">Home</a>
                            </Link>
                            <Link to="/collection">
                                <a className="nav-link" href="#">Collection</a>
                            </Link>
                            <Link to="/about">
                                <a className="nav-link" href="#">About Us</a>
                            </Link>
                            <Link to="/connect">
                                <button className="btn btn-outline-success me-2" type="button">Connect Wallet</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="collection" element={<Collection />} />
                <Route path="connect" element={<ConnectWallet />} />
            </Routes>
        </Router>   
    );
}
