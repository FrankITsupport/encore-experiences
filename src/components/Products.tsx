import { useQuery } from "@tanstack/react-query";
import { getEquipment, starterEquipment } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

const Products = () => {
  const { data, isError } = useQuery({ queryKey: ["equipment"], queryFn: getEquipment });
  const products = isError ? starterEquipment : data ?? starterEquipment;

  return (
    <section id="products" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="mb-4 block font-display text-xs uppercase tracking-[0.3em] text-primary">Our Products</span>
          <h2 className="mb-6 font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">Event <span className="gradient-text">Equipment</span></h2>
          <p className="mx-auto max-w-2xl font-body text-lg text-muted-foreground">Premium event technology and equipment designed to elevate every moment and create lasting impressions.</p>
        </div>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">Equipment details are coming soon.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-2xl gradient-border">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={mediaUrl(product.image_path)} alt={product.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {product.tag && <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 font-display text-xs font-medium text-primary-foreground">{product.tag}</span>}
                </div>
                <div className="p-6">
                  <h3 className="mb-2 font-display text-xl font-semibold text-foreground">{product.title}</h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
