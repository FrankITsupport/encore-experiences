import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import boothImg from "@/assets/hero-photobooth.jpg";
import booth360 from "@/assets/360-booth.jpg";
import ledImg from "@/assets/led-screen.jpg";
import lightingImg from "@/assets/event-lighting.jpg";

const products = [
  {
    title: "Mirror Photobooth",
    description: "An interactive, full-length mirror that captures stunning photos with custom animations, filters, and branded overlays. A showstopper at any corporate event.",
    image: boothImg,
    tag: "Most Popular",
  },
  {
    title: "360° Video Booth",
    description: "Step onto the platform and let our rotating camera capture epic slow-motion videos from every angle. Instant social media content your guests will love.",
    image: booth360,
    tag: "Trending",
  },
  {
    title: "LED Screen Displays",
    description: "High-resolution LED screens for presentations, live feeds, and dynamic brand visuals. Available in various sizes for any venue configuration.",
    image: ledImg,
    tag: "Essential",
  },
  {
    title: "Stage & Lighting",
    description: "Complete stage platforms with professional lighting rigs, LED dance floors, red carpet setups, and crowd control solutions for a polished event experience.",
    image: lightingImg,
    tag: "Premium",
  },
];

const ProductCard = ({ product, index }: { product: typeof products[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden gradient-border"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <span
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-display font-medium text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {product.tag}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">{product.title}</h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.description}</p>
      </div>
    </motion.div>
  );
};

const Products = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="products" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="font-display text-xs tracking-[0.3em] uppercase text-primary mb-4 block">
            Our Products
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Event <span className="gradient-text">Equipment</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium event technology and equipment designed to elevate every moment 
            and create lasting impressions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.title} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
