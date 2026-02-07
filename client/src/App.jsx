import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/navbar";
import Footer from "./components/Footer";
import Browse from "./components/Browse";
import Cart from "./components/cart";
import Login from "./components/login";
import Signup from "./components/signup";
import BookDetail from "./components/BookDetail";
import Checkout from "./components/Checkout";
import MyOrders from "./components/MyOrders";
import PrivateRoute from "./components/PrivateRoute";
import "./components/style.css"
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />
          <main style={{ minHeight: "80vh" }}>
            <Routes>
              <Route path="/" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/book/:id" element={<BookDetail />} />
               
              <Route path="/cart" element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              } />
              <Route path="/checkout" element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              } />
              <Route path="/my-orders" element={
                <PrivateRoute>
                  <MyOrders />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;