import React from 'react'

// add bootstrap css
import 'bootstrap/dist/css/bootstrap.css'
// import { Nav, Button } from 'react-bootstrap';
import Link from 'next/link'
//import {Button} from "bootstrap";

export default function NavigationBar() {
    return (

        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link href={"./"}>
                    <a className="navbar-brand" >
                        Momint
                    </a>
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link href={"./"}>
                            <a className="nav-link active" aria-current="page" href="#">Home</a>
                        </Link>
                        <Link href={"./"}>
                            <a className="nav-link" href="#">Collection</a>
                        </Link>
                        <Link href={"./"}>
                            <a className="nav-link" href="#">About Us</a>
                        </Link>

                        <button className="btn btn-outline-success me-2" type="button">Connect Wallet</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

