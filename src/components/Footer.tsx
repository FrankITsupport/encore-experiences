import logo from "@/assets/logo.jpeg";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VenueBox" className="h-8 w-8 rounded-lg object-cover" />
          <span className="font-display text-lg font-bold gradient-text">VenueBox</span>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          © {new Date().getFullYear()} VenueBox Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
