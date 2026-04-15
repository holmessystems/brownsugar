import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import SitewideBanner from './components/SitewideBanner';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ProductSection from './components/ProductSection';
import PickupInstructions from './components/PickupInstructions';
import PopUpCalendar from './components/PopUpCalendar';
import SocialProof from './components/SocialProof';
import About from './components/About';
import CateringEvents from './components/CateringEvents';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmation from './components/OrderConfirmation';
import Toast from './components/Toast';

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <SitewideBanner />
      <Hero />
      <HowItWorks />
      <ProductSection />
      <PickupInstructions />
      <PopUpCalendar />
      <SocialProof />
      <About />
      <CateringEvents />
      <Footer />
      <CartSidebar />
      <CheckoutModal />
      <OrderConfirmation />
      <Toast />
    </CartProvider>
  );
}
