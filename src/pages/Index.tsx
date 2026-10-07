import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Products from "@/components/Products";
import EventsPreview from "@/components/EventsPreview";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-background">
      <Navbar />
      <Hero />
      <Marquee />
      <Products />
      <EventsPreview />
      <Services />
      <WhyUs />
      <Contact />
      <BottomNav />
      <Footer />
    </div>
  );
};

export default Index;
