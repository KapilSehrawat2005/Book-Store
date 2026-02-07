import { FaStar, FaRegStar } from "react-icons/fa";
import "./style.css";
function BookCard({ book }) {
  const rating = Math.round(book.rating);

  return (
    <div className="product-card">
      <img 
        src={book.image_url || "/images/Book.jpg"} 
        alt={book.title} 
        className="card-image" 
      />

      <div className="card-content">
        <div className="card-header">
          <h3>{book.title}</h3>
          <span className="tag">{book.category}</span>
        </div>

        <p className="author">{book.author}</p>

        <div className="rating">
          {[...Array(5)].map((_, i) =>
            i < rating ? <FaStar key={i} /> : <FaRegStar key={i} />
          )}
          <span>({book.reviews})</span>
        </div>

        <p className="description">{book.description}</p>
        <h2 className="price">${book.price}</h2>

        <div className="card-footer">
          <button className="view-details-btn">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;