-- Create and use database
CREATE DATABASE BookStore;
USE BookStore;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2),
    reviews INT DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    category VARCHAR(50),
    stock INT DEFAULT 10
);

-- Cart table
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    order_status ENUM('processing', 'shipped', 'delivered') DEFAULT 'processing',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
select * from users;
-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Insert sample books
INSERT INTO books (title, author, price, rating, reviews, description, category, image_url) VALUES
('To Kill a Mockingbird', 'Harper Lee', 14.99, 4.0, 3451, 'A story of racial injustice and childhood innocence in the American South.', 'Fiction', '/assets/Book.jpg'),
('The Great Gatsby', 'F. Scott Fitzgerald', 12.99, 4.0, 2834, 'A classic novel about wealth, love, and ambition in Jazz Age America.', 'Fiction', '/assets/Book.jpg'),
('1984', 'George Orwell', 13.99, 4.0, 2923, 'A dystopian novel exploring totalitarianism and government control.', 'Science Fiction', '/assets/Book.jpg'),
('Pride and Prejudice', 'Jane Austen', 11.99, 4.0, 3127, 'A romantic novel about manners, marriage, and social class in Regency England.', 'Romance', '/assets/Book.jpg'),
('The Hobbit', 'J.R.R. Tolkien', 15.99, 4.5, 4123, 'A fantasy novel about the adventures of hobbit Bilbo Baggins.', 'Fantasy', '/assets/Book.jpg'),
('Atomic Habits', 'James Clear', 18.99, 4.7, 5234, 'An easy & proven way to build good habits & break bad ones.', 'Self-Help', '/assets/Book.jpg');
