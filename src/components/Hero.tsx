import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroImg from "@/assets/hero-photobooth.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Corporate event" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-background/80" />
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(325, 85%, 50%, 0.3), transparent 60%), radial-gradient(ellipse at 70% 50%, hsl(186, 70%, 55%, 0.2), transparent 60%)" }}
        />
      </div>

      {/* Animated orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[100px] opacity-20"
        style={{ background: "hsl(325, 85%, 50%)" }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15"
        style={{ background: "hsl(186, 70%, 55%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-display font-medium tracking-widest uppercase border border-border text-muted-foreground">
            Kenya's Premier Event Experience Company
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8"
        >
          <span className="text-foreground">We Create</span>
          <br />
          <span className="gradient-text">Unforgettable</span>
          <br />
          <span className="text-foreground">Experiences</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-body text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          From mirror photobooths to 360° video experiences, we transform corporate events 
          into immersive moments that captivate and engage.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-full font-display text-sm font-semibold tracking-wide text-primary-foreground transition-transform hover:scale-105"
            style={{ background: "var(--gradient-primary)" }}
          >
            Explore Our Products
          </button>
          <button
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-full font-display text-sm font-semibold tracking-wide text-foreground border border-border hover:border-primary/50 transition-all hover:glow-pink"
          >
            Our Services
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="text-muted-foreground" size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
