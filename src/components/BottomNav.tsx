import { Home, LayoutGrid, Images, MessageCircle } from "lucide-react";

const items = [
  { href: import.meta.env.BASE_URL, label: "Home", icon: Home },
  { href: `${import.meta.env.BASE_URL}events`, label: "Events", icon: Images },
  { href: `${import.meta.env.BASE_URL}#products`, label: "Equipment", icon: LayoutGrid },
  { href: `${import.meta.env.BASE_URL}#contact`, label: "Contact", icon: MessageCircle },
];

const BottomNav = () => (
  <nav aria-label="Mobile navigation" className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
    <div className="grid grid-cols-4 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
      {items.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Icon aria-hidden="true" size={20} />
          <span>{label}</span>
        </a>
      ))}
    </div>
  </nav>
);

export default BottomNav;
