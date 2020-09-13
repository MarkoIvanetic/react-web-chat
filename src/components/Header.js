import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebase';
import { logout } from '../helpers/auth';
import logo from '../we-chat-logo.png';

function Header() {
  return (
    <header>
      <nav>
        <Link className="navbar-logo" to={auth().currentUser ? "/chat" : "/"}>
          <img src={logo} alt="Logo" />
          Web Chat
        </Link>
        <div className="navbar-user" id="navbarNavAltMarkup">
          {auth().currentUser ? (
            <div className="navbar-nav">
              <Link className="nav-item nav-link mr-3" to="/chat">
                Profile
              </Link>
              <a
                onClick={e => {
                  e.preventDefault();
                  logout();
                }}
              >
                Logout
              </a>
            </div>
          ) : (
            <div className="navbar-nav">
              <Link className="nav-item nav-link mr-3" to="/login">
                Sign In
              </Link>
              <Link className="nav-item nav-link mr-3" to="/signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
export default Header;
