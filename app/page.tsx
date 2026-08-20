import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

// Categories and FeaturedProducts read from MongoDB. Rendering this page
// dynamically (per request) means the DB only needs to be reachable when a
// visitor loads the page — not during `next build` / deploy.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Footer />
    </>
  );
}