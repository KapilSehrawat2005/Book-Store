import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function NavBar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout, isAuthenticated, cartCount, fetchCartCount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated, fetchCartCount]);

  const handleBrowseClick = () => {
    navigate('/');
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  return (
    <>
      <div className="navbar">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="BookStore" />
            <span>BookStore</span>
          </div>

          <div className="nav-links">
            <button onClick={handleBrowseClick}>Browse</button>
            <button onClick={handleCartClick}>Cart</button>
            {isAuthenticated && (
              <button onClick={() => navigate('/my-orders')}>My Orders</button>
            )}
          </div>
        </div>

        <div className="nav-right">
          <div className="cart-icon" onClick={handleCartClick}>
            {cartCount > 0 && <sup>{cartCount}</sup>}
            <FaShoppingCart />
          </div>

          {isAuthenticated ? (
            <div className="profile-container">
              <button className="profile-btn" onClick={handleProfileClick}>
                <FaUser /> {user?.name}
              </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <strong>{user?.name}</strong>
                    <small>{user?.email}</small>
                  </div>
                  <button onClick={() => {
                    navigate('/my-orders');
                    setShowProfileMenu(false);
                  }}>
                    My Orders
                  </button>
                  <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <hr />
    </>
  );
}

export default NavBar;