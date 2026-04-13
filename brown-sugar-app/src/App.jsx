import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Strip from './components/Strip';
import About from './components/About';
import Menu from './components/Menu';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <Hero />
      <Strip />
      <About />
      <Menu />
      <Testimonials />
      <Contact />
      <Footer />
      <CartSidebar />
      <CheckoutModal />
      <Toast />
    </CartProvider>
  );
}
