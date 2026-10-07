import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const navItems = [
  { label: "Events", href: `${import.meta.env.BASE_URL}events` },
  { label: "Products", href: `${import.meta.env.BASE_URL}#products` },
  { label: "Services", href: `${import.meta.env.BASE_URL}#services` },
  { label: "About", href: `${import.meta.env.BASE_URL}#about` },
  { label: "Contact", href: `${import.meta.env.BASE_URL}#contact` },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href={import.meta.env.BASE_URL} className="flex items-center gap-3">
          <img src={logo} alt="VenueBox" className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-display text-xl font-bold gradient-text">VenueBox</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide uppercase"
            >
              {item.label}
            </a>
          ))}
          <a
            href={`${import.meta.env.BASE_URL}#contact`}
            className="px-6 py-2.5 rounded-full font-display text-sm font-medium text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            Get a Quote
          </a>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
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
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="font-body text-left text-muted-foreground hover:text-foreground transition-colors py-2 uppercase text-sm tracking-wide"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`${import.meta.env.BASE_URL}#contact`}
                onClick={() => setIsOpen(false)}
                className="mt-2 px-6 py-3 rounded-full font-display text-sm font-medium text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Get a Quote
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
