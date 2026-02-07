import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user profile
      axios.get('http://localhost:5000/api/users/profile')
        .then(res => {
          setUser(res.data);
          // Fetch cart count after user is set
          fetchCartCount();
        })
        .catch((error) => {
          console.error('Failed to fetch user profile:', error);
          logout();
        });
    } else {
      setCartCount(0);
    }
  }, [token]);

  const fetchCartCount = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get('http://localhost:5000/api/cart');
      const totalItems = response.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartCount(0);
    }
  };

  const updateCartCount = (change) => {
    setCartCount(prev => Math.max(0, prev + change));
  };

  const resetCartCount = () => {
    setCartCount(0);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set token in state and axios headers
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing token on failed login
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.message || 
               'Login failed. Please check your credentials.' 
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        name,
        email,
        password
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.message || 
               'Signup failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCartCount(0);
    delete axios.defaults.headers.common['Authorization'];
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('http://localhost:5000/api/users/password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password change failed' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      cartCount,
      updateCartCount,
      resetCartCount,
      fetchCartCount,
      login,
      signup,
      logout,
      changePassword,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};