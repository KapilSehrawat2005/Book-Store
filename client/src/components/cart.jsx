import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import "./style.css";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { fetchCartCount } = useAuth();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    axios.get('http://localhost:5000/api/cart')
      .then(res => {
        setCartItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  const tax = +(subtotal * 0.1).toFixed(2);
  const total = (subtotal + tax).toFixed(2);

  const increaseQty = async (id, currentQty) => {
    try {
      await axios.put(`http://localhost:5000/api/cart/${id}`, {
        quantity: currentQty + 1
      });
      loadCart();
      fetchCartCount(); // Update cart count
    } catch (error) {
      console.error(error);
    }
  };

  const decreaseQty = async (id, currentQty) => {
    if (currentQty <= 1) {
      // If quantity is 1, remove the item instead
      removeItem(id);
      return;
    }
    
    try {
      await axios.put(`http://localhost:5000/api/cart/${id}`, {
        quantity: currentQty - 1
      });
      loadCart();
      fetchCartCount(); // Update cart count
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${id}`);
      loadCart();
      fetchCartCount(); // Update cart count
    } catch (error) {
      console.error(error);
    }
  };

  const clearCart = async () => {
    try {
      // Delete all cart items
      await Promise.all(
        cartItems.map(item => 
          axios.delete(`http://localhost:5000/api/cart/${item.id}`)
        )
      );
      setCartItems([]);
      fetchCartCount(); // Update cart count
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="cart-details single">
        <h1>Shopping Cart</h1>
        <div className="cart-card">
          <p>Your Cart is Empty</p>
          <button onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      <div className="cart-details">
        <div className="cart-left">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img 
                src={item.image_url || "/assets/Book.jpg"} 
                alt={item.title} 
                className="cart-img" 
              />

              <div className="cart-info">
                <h3>{item.title}</h3>
                <p>{item.author}</p>

                <div className="qty-controls">
                  <button onClick={() => decreaseQty(item.id, item.quantity)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id, item.quantity)}>
                    +
                  </button>
                </div>
              </div>

              <div className="cart-price">
                <small>${item.price} each</small>
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              </div>

              <FaTrash
                className="delete-icon"
                onClick={() => removeItem(item.id)}
              />
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>$0.00</span>
          </div>

          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>${tax}</span>
          </div>

          <hr />

          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total}</span>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          
          <button className="continue-btn" onClick={() => navigate("/")}>
            Continue Shopping
          </button>

          <p className="clear-cart" onClick={clearCart}>
            Clear Cart
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cart;