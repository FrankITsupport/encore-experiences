import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const navItems = ["Products", "Services", "About", "Contact"];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VenueBox" className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-display text-xl font-bold gradient-text">VenueBox</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide uppercase"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => scrollTo("contact")}
            className="px-6 py-2.5 rounded-full font-display text-sm font-medium text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            Get a Quote
          </button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item)}
                  className="font-body text-left text-muted-foreground hover:text-foreground transition-colors py-2 uppercase text-sm tracking-wide"
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => scrollTo("contact")}
                className="mt-2 px-6 py-3 rounded-full font-display text-sm font-medium text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Get a Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
