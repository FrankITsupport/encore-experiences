import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Wrench, Cpu, Maximize2, Users } from "lucide-react";

const reasons = [
  { icon: ShieldCheck, title: "Reliable Equipment", desc: "Well-maintained, premium-grade event technology you can count on." },
  { icon: Wrench, title: "Professional Setup", desc: "Our expert team handles installation, testing, and on-site technical support." },
  { icon: Cpu, title: "Modern Technology", desc: "Stay ahead with the latest interactive event experiences and installations." },
  { icon: Maximize2, title: "Flexible Solutions", desc: "Scalable packages for events of all sizes — from intimate gatherings to mega conferences." },
  { icon: Users, title: "Trusted Partner", desc: "Relied on by Kenya's top event planners, brands, and corporate teams." },
];

const WhyUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="font-display text-xs tracking-[0.3em] uppercase text-secondary mb-4 block">
              Why VenueBox
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              The <span className="gradient-text">Difference</span> Is In The Details
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
              At VenueBox, we don't just provide equipment — we craft experiences. 
              Every setup is meticulously planned and executed to ensure your event 
              runs flawlessly and leaves a lasting impression.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { number: "200+", label: "Events Delivered" },
                { number: "50+", label: "Corporate Clients" },
                { number: "99%", label: "Satisfaction Rate" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-bold gradient-text">{stat.number}</div>
                  <div className="font-body text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            {reasons.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex gap-4 p-5 rounded-xl glass hover:glow-cyan transition-all duration-500 group"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border border-border group-hover:border-secondary/50 transition-colors">
                    <Icon size={18} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-semibold text-foreground mb-1">{reason.title}</h4>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{reason.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
