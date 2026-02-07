import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./style.css";

function BookDetail() {
  const { id } = useParams();
  const { isAuthenticated, fetchCartCount } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/books/${id}`)
      .then(res => {
        setBook(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/cart', {
        book_id: book.id,
        quantity: quantity
      });
      // Refresh cart count after adding item
      fetchCartCount();
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        book: book,
        quantity: quantity 
      } 
    });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return <div className="not-found">Book not found</div>;

  const rating = Math.round(book.rating);

  return (
    <div className="book-detail-container">
      <div className="book-detail">
        <div className="book-image">
          <img src={book.image_url || "/images/Book.jpg"} alt={book.title} />
        </div>
        
        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          
          <div className="rating">
            {[...Array(5)].map((_, i) =>
              i < rating ? <FaStar key={i} /> : <FaRegStar key={i} />
            )}
            <span>({book.reviews} reviews)</span>
          </div>
          
          <p className="category">Category: <strong>{book.category}</strong></p>
          
          <div className="price-section">
            <h2>${book.price}</h2>
            <p className="stock">In Stock: {book.stock} units</p>
          </div>
          
          <div className="quantity-control">
            <label>Quantity:</label>
            <div className="qty-buttons">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="add-cart-btn" onClick={handleAddToCart}>
              <FaShoppingCart /> Add to Cart (${(book.price * quantity).toFixed(2)})
            </button>
            <button className="buy-now-btn" onClick={handlePurchase}>
              Buy Now (${(book.price * quantity).toFixed(2)})
            </button>
          </div>
          
          <div className="description">
            <h3>Description</h3>
            <p>{book.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;