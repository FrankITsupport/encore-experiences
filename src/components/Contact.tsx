import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, Phone, MapPin, Instagram, Send } from "lucide-react";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Event Inquiry from ${formData.name}`);
    const body = encodeURIComponent(formData.message);
    window.location.href = `mailto:info@venuebox.co.ke?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-32 px-6 relative">
      <div
        className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to top, hsl(240, 15%, 3%), transparent)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="font-display text-xs tracking-[0.3em] uppercase text-primary mb-4 block">
            Get In Touch
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Let's Create <span className="gradient-text">Magic</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Ready to elevate your next event? Reach out and let's bring your vision to life.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass rounded-2xl p-8 space-y-6"
          >
            <div>
              <label className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Tell Us About Your Event</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                placeholder="Describe your event, date, and what equipment you need..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full font-display text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Send Inquiry <Send size={16} />
            </button>
          </motion.form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col justify-center space-y-8"
          >
            {[
              { icon: Mail, label: "Email", value: "info@venuebox.co.ke", href: "mailto:info@venuebox.co.ke" },
              { icon: Phone, label: "Phone", value: "+254 XXX XXX XXX", href: "tel:+254000000000" },
              { icon: MapPin, label: "Location", value: "Nairobi, Kenya", href: "#" },
              { icon: Instagram, label: "Instagram", value: "@venuebox", href: "https://instagram.com/venuebox" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors"
                  >
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-display text-xs uppercase tracking-wider text-muted-foreground">{item.label}</div>
                    <div className="font-body text-foreground group-hover:text-primary transition-colors">{item.value}</div>
                  </div>
                </a>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
