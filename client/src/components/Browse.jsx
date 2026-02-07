import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";
import axios from "axios";
import "./style.css";

function Browse() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/books")
      .then(res => {
        setBooks(res.data);
        setFilteredBooks(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    result.sort((a, b) => {
      if (sort === "PriceLow") {
        return a.price - b.price;
      }
      if (sort === "PriceHigh") {
        return b.price - a.price;
      }
      if (sort === "Rating") {
        return b.rating - a.rating;
      }
      return 0;
    });

    setFilteredBooks(result);
  }, [books, search, category, sort]);

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <>
      <div className="heading">
        <h1>Welcome to BookStore</h1>
        <p style={{ opacity: "0.5" }}>
          Discover your next favorite book from our curated collection
        </p>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="filters">
        <div className="categories">
          {["All", "Fiction", "Science Fiction", "Romance", "Fantasy", "Self-Help"].map((cat) => (
            <button
              key={cat}
              className={category === cat ? "active" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sort">
          <button
            onClick={() => setSort("Newest")}
            className={sort === "Newest" ? "active" : ""}
          >
            Newest
          </button>
          <button
            onClick={() => setSort("PriceLow")}
            className={sort === "PriceLow" ? "active" : ""}
          >
            Price: Low to High
          </button>
          <button
            onClick={() => setSort("PriceHigh")}
            className={sort === "PriceHigh" ? "active" : ""}
          >
            Price: High to Low
          </button>
          <button
            onClick={() => setSort("Rating")}
            className={sort === "Rating" ? "active" : ""}
          >
            Highest Rated
          </button>
        </div>
      </div>

      <div className="book-list">
        {filteredBooks.map((book) => (
          <div key={book.id} className="book-card-wrapper">
            <Link to={`/book/${book.id}`} className="book-link">
              <BookCard book={book} />
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export default Browse;