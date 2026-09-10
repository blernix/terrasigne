import { Merriweather } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientOnlyParallaxProvider from '@/components/ClientOnlyParallaxProvider';

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Terrasigne",
  image: "https://terrasigne.fr/images/logoterra.png",
  description: "Cindy Guillaume, praticienne en soins holistiques à Terre de Bas, Guadeloupe. Accompagnement bien-être, soins énergétiques et relation d'aide.",
  url: "https://terrasigne.fr",
  telephone: "+590 690 51 68 51",
  email: "terrasigne971@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Terre de Bas",
    addressRegion: "Guadeloupe",
    addressCountry: "FR",
  },
  sameAs: [
    "https://www.facebook.com",
    "https://www.instagram.com",
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  priceRange: "€€",
};

export const metadata = {
  metadataBase: new URL("https://terrasigne.fr"),
  title: {
    default: "Terrasigne",
    template: "%s | Terrasigne",
  },
  description: "Cindy Guillaume, praticienne en soins holistiques à Terre de Bas en Guadeloupe. Accompagnement bien-être, soins énergétiques, relation d'aide et développement personnel.",
  openGraph: {
    title: "Terrasigne",
    description: "Explore ton équilibre intérieur avec Terrasigne. Soins holistiques, accompagnement personnalisé et bien-être en Guadeloupe.",
    type: "website",
    siteName: "Terrasigne",
    images: [{ url: "https://terrasigne.fr/images/logoterra.png", width: 500, height: 500, alt: "Terrasigne" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrasigne",
    description: "Accompagnement bien-être et développement personnel en Guadeloupe.",
    images: ["https://terrasigne.fr/images/logoterra.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${merriweather.className} antialiased`}>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script defer src="https://analytique.killian-lecrut.com/script.js" data-website-id="5f56f35e-097a-4dab-966a-19a0deb6afb3"></script>
        <script defer src="https://analytique.killian-lecrut.com/recorder.js" data-website-id="5f56f35e-097a-4dab-966a-19a0deb6afb3" data-sample-rate="1" data-mask-level="moderate" data-max-duration="300000"></script>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:p-4 focus:shadow-lg focus:rounded-lg">
          Aller au contenu principal
        </a>
        <ClientOnlyParallaxProvider>
          {children}
        </ClientOnlyParallaxProvider>
      </body>
    </html>
  );
}
