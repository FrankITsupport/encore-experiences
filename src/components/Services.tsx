import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Mic2, Store, Sparkles, Heart, Layers } from "lucide-react";

const services = [
  { icon: Building2, title: "Corporate Events", desc: "End-to-end event equipment for conferences, galas, and team-building experiences." },
  { icon: Mic2, title: "Conferences & Seminars", desc: "Professional AV setups, staging, and LED displays for impactful presentations." },
  { icon: Store, title: "Exhibitions & Trade Shows", desc: "Eye-catching display counters, branded booths, and interactive installations." },
  { icon: Sparkles, title: "Brand Activations", desc: "Immersive brand experiences with photobooths, 360 booths, and custom setups." },
  { icon: Heart, title: "Weddings & Private Events", desc: "Elegant setups with lighting, red carpets, and entertainment equipment." },
  { icon: Layers, title: "Experience Installations", desc: "Cutting-edge event technology that transforms spaces into interactive worlds." },
];

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="services" className="py-32 px-6 relative">
      {/* Subtle bg glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-10 pointer-events-none"
        style={{ background: "hsl(325, 85%, 50%)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="font-display text-xs tracking-[0.3em] uppercase text-secondary mb-4 block">
            What We Do
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            From concept to execution, we deliver professional event solutions 
            tailored to your brand and audience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group glass rounded-2xl p-8 hover:glow-pink transition-all duration-500 cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Icon size={22} className="text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:gradient-text transition-all">
                  {service.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
