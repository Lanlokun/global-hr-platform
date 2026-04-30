import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";

import africaGeo from "../../data/africa.geo.json";
import "../../components/marketing/landing.css";

import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";

const countries = [
  { name: "Morocco", slug: "morocco", flag: "🇲🇦", coordinates: [-7.5, 31.5] },
  { name: "Algeria", slug: "algeria", flag: "🇩🇿", coordinates: [3.5, 28.2] },
  { name: "Egypt", slug: "egypt", flag: "🇪🇬", coordinates: [30.5, 26.5] },
  { name: "Senegal", slug: "senegal", flag: "🇸🇳", coordinates: [-14.7, 14.7] },
  { name: "Ghana", slug: "ghana", flag: "🇬🇭", coordinates: [-1.8, 7.8] },
  { name: "Nigeria", slug: "nigeria", flag: "🇳🇬", coordinates: [8.6, 9.2] },
  { name: "Cameroon", slug: "cameroon", flag: "🇨🇲", coordinates: [13.8, 5.1] },
  { name: "Ethiopia", slug: "ethiopia", flag: "🇪🇹", coordinates: [40.2, 9.5] },
  { name: "Uganda", slug: "uganda", flag: "🇺🇬", coordinates: [31.2, 1.7] },
  { name: "Kenya", slug: "kenya", flag: "🇰🇪", coordinates: [37.8, 0.3] },
  { name: "Tanzania", slug: "tanzania", flag: "🇹🇿", coordinates: [35.6, -6.8] },
  { name: "DR Congo", slug: "dr-congo", flag: "🇨🇩", coordinates: [22.7, -2.7] },
  { name: "Angola", slug: "angola", flag: "🇦🇴", coordinates: [17.3, -12.4] },
  { name: "South Africa", slug: "south-africa", flag: "🇿🇦", coordinates: [24.2, -29.0] },
  { name: "Madagascar", slug: "madagascar", flag: "🇲🇬", coordinates: [47.2, -19.1] },
];

function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleCountryClick = (slug) => {
    if (!slug) return;
    navigate(`/country/${slug}`);
  };

  return (
    <>
      <div className="itss-page">

        {/* ================= NAV ================= */}
        <nav className="itss-nav">
          <div className="itss-brand">
            SGET International Talent Space Station
          </div>

          <div className="itss-nav-actions">
            <LanguageSwitcher />

            <Link className="itss-link" to="/login">
              {t("signIn")}
            </Link>

            <Link className="itss-btn" to="/signup">
              {t("getStarted")}
            </Link>
          </div>
        </nav>

        {/* ================= HERO ================= */}
        <motion.section
          className="itss-hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="itss-hero-copy">
            <div className="itss-badge">
              {t("panAfricanAccess")}
            </div>

            <h1 className="itss-title">
              {t("heroTitle")}
            </h1>

            <p className="itss-subtitle">
              {t("heroSubtitle")}
            </p>

            <div className="itss-hero-actions">
              <Link className="itss-btn" to="/signup">
                {t("getStarted")}
              </Link>

              <Link className="itss-btn-secondary" to="/login">
                {t("signIn")}
              </Link>
            </div>
          </div>

          {/* ================= MAP ================= */}
          <div className="itss-map-wrap">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [20, 2],
                scale: 420,
              }}
              className="itss-map"
            >
              <Geographies geography={africaGeo}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const slug = geo.properties?.name
                      ?.toLowerCase()
                      .replace(/\s+/g, "-");

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(slug)}
                        style={{
                          default: {
                            fill: "#2f5be7",
                            stroke: "#8eb7ff",
                            outline: "none",
                          },
                          hover: {
                            fill: "#4471f2",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#1f3fb3",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {countries.map((c) => (
                <Marker
                  key={c.slug}
                  coordinates={c.coordinates}
                  onClick={() => handleCountryClick(c.slug)}
                >
                  <g style={{ cursor: "pointer" }}>
                    <circle r={10} fill="#fff" />
                    <text textAnchor="middle" y={4} fontSize={11}>
                      {c.flag}
                    </text>
                  </g>
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </motion.section>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="itss-footer">
        <div className="itss-footer-bottom">
          © {new Date().getFullYear()} SGET International Talent Space Station
        </div>
      </footer>
    </>
  );
}

export default LandingPage;