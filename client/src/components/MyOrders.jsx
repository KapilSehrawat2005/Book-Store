import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get('http://localhost:5000/api/orders');
      
      console.log("Orders response:", response.data);
      
      // Process the orders
      const processedOrders = response.data.map(order => {
        let items = [];
        if (order.items && typeof order.items === 'string') {
          try {
            items = JSON.parse(order.items);
          } catch (e) {
            console.error("Failed to parse items:", e);
            items = [];
          }
        } else if (Array.isArray(order.items)) {
          items = order.items;
        }
        
        let shippingAddress = {};
        if (typeof order.shipping_address === 'string') {
          try {
            shippingAddress = JSON.parse(order.shipping_address);
          } catch (e) {
            console.error("Failed to parse shipping address:", e);
            shippingAddress = {};
          }
        } else if (order.shipping_address && typeof order.shipping_address === 'object') {
          shippingAddress = order.shipping_address;
        }
        
        return {
          ...order,
          items: items,
          shipping_address: shippingAddress
        };
      });
      
      setOrders(processedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);

    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!isAuthenticated) {
    return null; 
  }

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <small>Placed on {formatDate(order.order_date)}</small>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.order_status}`}>
                    {order.order_status || 'processing'}
                  </span>
                  <span className={`payment-status ${order.payment_status}`}>
                    {order.payment_status || 'pending'}
                  </span>
                </div>
              </div>
              
              <div className="order-items">
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.title} x{item.quantity}</span>
                      <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="order-item">
                    <span>No items found in this order</span>
                  </div>
                )}
              </div>
              
              <div className="order-footer">
                <div className="shipping-address">
                  <strong>Shipping to:</strong>
                  <p>
                    {order.shipping_address && typeof order.shipping_address === 'object' 
                      ? `${order.shipping_address.name || ''} - ${order.shipping_address.address || ''}, ${order.shipping_address.city || ''}`
                      : 'No address provided'}
                  </p>
                </div>
                <div className="order-total">
                  <strong>Total: ${order.total_amount || 0}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;