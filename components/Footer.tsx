import { navLinks } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">

        {/* Shop Info */}
        <div>
          <h2 className="text-2xl font-bold">
            Haq Brothers Sports & Toy Shop
          </h2>

          <p className="mt-4 text-gray-400">
            Your trusted destination for sports equipment,
            toys, fitness accessories and board games.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Quick Links
          </h3>

          <ul className="space-y-2 text-gray-400">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Contact
          </h3>

          <ul className="space-y-3 text-gray-400">
            <li>
              📍 Zohair Awan Plaza, near Qazi Saddique Book Depot,
              Thana Gali, Choa Saiden Shah, Chakwal
            </li>

            <li>
              📞{" "}
              <a
                href="tel:03465788341"
                className="transition hover:text-white"
              >
                03465788341
              </a>
            </li>

            <li>
              ✉️{" "}
              <a
                href="mailto:haqbrothers@gmail.com"
                className="transition hover:text-white"
              >
                haqbrothers@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Follow Us
          </h3>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.tiktok.com/@haq_brothers_sport_toy?_r=1&_t=ZS-9919OGjZiPH"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-pink-600 px-4 py-2 transition hover:bg-pink-700"
            >
              TikTok
            </a>

            <a
              href="https://www.instagram.com/haq_sports_toys?igsh=djJoNXVvdmRnMjR2"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-purple-600 px-4 py-2 transition hover:bg-purple-700"
            >
              Instagram
            </a>
          </div>
        </div>

      </div>

      <div className="border-t border-slate-700 py-6 text-center text-gray-400">
        © 2026 Haq Brothers Sports & Toy Shop. All Rights Reserved.
      </div>
    </footer>
  );
}