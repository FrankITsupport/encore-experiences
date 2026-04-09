import { Home, Package, Sparkles, MessageCircle } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, target: "home" },
  { label: "Equipment", icon: Package, target: "products" },
  { label: "Experiences", icon: Sparkles, target: "services" },
  { label: "Contact", icon: MessageCircle, target: "contact" },
];

const BottomNav = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden px-4 pb-safe bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between rounded-3xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              onClick={() => scrollTo(item.target)}
              className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <Icon className="h-6 w-6" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
