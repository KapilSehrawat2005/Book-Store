const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// User Registration
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        if (results.length > 0) {
          return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.query(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (err, result) => {
            if (err) return res.status(500).json({ error: "Registration failed" });
            
            res.status(201).json({ 
              message: "User registered successfully",
              userId: result.insertId 
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// User Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    }
  );
});

// Get all books
app.get("/api/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Get single book
app.get("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
  
  db.query("SELECT * FROM books WHERE id = ?", [bookId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Book not found" });
    res.json(results[0]);
  });
});

// Add to cart (Protected)
app.post("/api/cart", authenticateToken, (req, res) => {
  const { book_id, quantity } = req.body;
  const user_id = req.user.userId;

  // Check if item already in cart
  db.query(
    "SELECT * FROM cart WHERE user_id = ? AND book_id = ?",
    [user_id, book_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        // Update quantity if exists
        const newQty = results[0].quantity + quantity;
        db.query(
          "UPDATE cart SET quantity = ? WHERE id = ?",
          [newQty, results[0].id],
          (err) => {
            if (err) return res.status(500).json({ error: "Update failed" });
            res.json({ message: "Cart updated" });
          }
        );
      } else {
        // Insert new item
        db.query(
          "INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)",
          [user_id, book_id, quantity],
          (err) => {
            if (err) return res.status(500).json({ error: "Add to cart failed" });
            res.json({ message: "Added to cart" });
          }
        );
      }
    }
  );
});

// Get user cart (Protected)
app.get("/api/cart", authenticateToken, (req, res) => {
  const user_id = req.user.userId;

  db.query(
    `SELECT c.*, b.title, b.author, b.price, b.image_url 
     FROM cart c 
     JOIN books b ON c.book_id = b.id 
     WHERE c.user_id = ?`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// Update cart item (Protected)
app.put("/api/cart/:id", authenticateToken, (req, res) => {
  const { quantity } = req.body;
  const cartId = req.params.id;

  db.query(
    "UPDATE cart SET quantity = ? WHERE id = ?",
    [quantity, cartId],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Cart updated" });
    }
  );
});

// Remove from cart (Protected)
app.delete("/api/cart/:id", authenticateToken, (req, res) => {
  const cartId = req.params.id;

  db.query("DELETE FROM cart WHERE id = ?", [cartId], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Item removed from cart" });
  });
});

// Create order (Protected)
app.post("/api/orders", authenticateToken, (req, res) => {
  const { items, total_amount, shipping_address } = req.body;
  const user_id = req.user.userId;

  // Start transaction
  db.beginTransaction(async (err) => {
    if (err) return res.status(500).json({ error: "Transaction failed" });

    try {
      // Create order
      db.query(
        "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)",
        [user_id, total_amount, JSON.stringify(shipping_address)],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Order creation failed" });
            });
          }

          const orderId = result.insertId;
          
          // Insert order items
          const orderItems = items.map(item => [
            orderId,
            item.book_id,
            item.quantity,
            item.price
          ]);

          db.query(
            "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ?",
            [orderItems],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: "Order items failed" });
                });
              }

              // Clear cart after order
              db.query(
                "DELETE FROM cart WHERE user_id = ?",
                [user_id],
                (err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ error: "Cart clear failed" });
                    });
                  }

                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ error: "Commit failed" });
                      });
                    }

                    res.json({ 
                      message: "Order placed successfully", 
                      orderId 
                    });
                  });
                }
              );
            }
          );
        }
      );
    } catch (error) {
      db.rollback(() => {
        res.status(500).json({ error: "Order processing failed" });
      });
    }
  });
});

// Get user orders (Protected)
app.get("/api/orders", authenticateToken, (req, res) => {
  const user_id = req.user.userId;

  db.query(
    `SELECT o.*, 
     JSON_ARRAYAGG(
       JSON_OBJECT(
         'title', b.title,
         'quantity', oi.quantity,
         'price', oi.price
       )
     ) as items
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN books b ON oi.book_id = b.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.order_date DESC`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// Update user password (Protected)
app.put("/api/users/password", authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user_id = req.user.userId;

  // Get current password
  db.query(
    "SELECT password FROM users WHERE id = ?",
    [user_id],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      
      const validPassword = await bcrypt.compare(currentPassword, results[0].password);
      
      if (!validPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, user_id],
        (err) => {
          if (err) return res.status(500).json({ error: "Password update failed" });
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
});

// Get user profile (Protected)
app.get("/api/users/profile", authenticateToken, (req, res) => {
  const user_id = req.user.userId;
  
  db.query(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results[0]);
    }
  );
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});