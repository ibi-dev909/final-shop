import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="mx-auto flex min-h-[85vh] max-w-7xl items-center px-6">

        <div className="max-w-2xl">

          <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold">
            Welcome to Haq Brothers
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-7xl">
            Premium Sports &
            <br />
            Toy Store
          </h1>

          <p className="mt-6 text-lg text-gray-300">
            Discover quality sports equipment, fitness accessories,
            board games, boxing gear, and toys — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              href="/shop"
              className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition hover:bg-blue-700"
            >
              Shop Now
            </Link>

            <Link
              href="/#categories"
              className="rounded-xl border border-white px-8 py-4 text-lg font-semibold transition hover:bg-white hover:text-slate-900"
            >
              Explore Categories
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}
