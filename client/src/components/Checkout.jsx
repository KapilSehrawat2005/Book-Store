import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./style.css";

function Checkout() {
  const { user, fetchCartCount, resetCartCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState([]);
  const [shipping, setShipping] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    zipCode: "",
    phone: ""
  });
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    if (location.state?.book) {
      setCartItems([{
        ...location.state.book,
        quantity: location.state.quantity
      }]);
    } else {
      axios.get('http://localhost:5000/api/cart')
        .then(res => setCartItems(res.data))
        .catch(console.error);
    }
  }, [location]);

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0);
  const tax = +(subtotal * 0.1).toFixed(2);
  const total = (subtotal + tax).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          book_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: total,
        shipping_address: shipping
      };

      await axios.post('http://localhost:5000/api/orders', orderData);
      
      alert('Order placed successfully!');
      resetCartCount(); // Reset cart count after successful order
      navigate('/my-orders');
    } catch (error) {
      alert('Order failed. Please try again.');
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-checkout">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">
          <div className="checkout-section">
            <h2>Customer Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={shipping.name}
                onChange={handleInputChange(setShipping)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={shipping.email}
                onChange={handleInputChange(setShipping)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={shipping.phone}
                onChange={handleInputChange(setShipping)}
                required
              />
            </div>
          </div>

          <div className="checkout-section">
            <h2>Shipping Address</h2>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={shipping.address}
                onChange={handleInputChange(setShipping)}
                required
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={shipping.city}
                  onChange={handleInputChange(setShipping)}
                  required
                />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shipping.zipCode}
                  onChange={handleInputChange(setShipping)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>Payment Information</h2>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="cardName"
                value={payment.cardName}
                onChange={handleInputChange(setPayment)}
                required
              />
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={payment.cardNumber}
                onChange={handleInputChange(setPayment)}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiry"
                  value={payment.expiry}
                  onChange={handleInputChange(setPayment)}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={payment.cvv}
                  onChange={handleInputChange(setPayment)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.title} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>${tax}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total}</span>
            </div>
            
            <button type="submit" className="pay-btn">
              Pay ${total}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;