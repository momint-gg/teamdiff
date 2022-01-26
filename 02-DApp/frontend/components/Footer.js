import React from 'react'
// add bootstrap css
import 'bootstrap/dist/css/bootstrap.css'




export default function Footer() {
    return (
        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
            <div className="col-md-4 d-flex align-items-center">
                <a href="/" className="mb-3 me-2 mb-md-0 text-muted text-decoration-none lh-1">
                    <svg className="bi" width="30" height="24">
                        nub
                    </svg>
                </a>
                <span className="text-muted">© 2021 Momint LLC</span>
            </div>

            <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
                <li className="ms-3"><a className="text-muted" href="#">
                    <svg className="bi" width="24" height="24">
                        nub
                    </svg>
                </a></li>
                <li className="ms-3"><a className="text-muted" href="#">
                    <svg className="bi" width="24" height="24">
                        nub
                    </svg>
                </a></li>
                <li className="ms-3"><a className="text-muted" href="#">
                    <svg className="bi" width="24" height="24">
                        nub
                    </svg>
                </a></li>
            </ul>
        </footer>
    )
}