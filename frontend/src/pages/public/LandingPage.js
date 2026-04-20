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

const geoNameToSlug = {
  Morocco: "morocco",
  Algeria: "algeria",
  Egypt: "egypt",
  Senegal: "senegal",
  Ghana: "ghana",
  Nigeria: "nigeria",
  Cameroon: "cameroon",
  Ethiopia: "ethiopia",
  Uganda: "uganda",
  Kenya: "kenya",
  Tanzania: "tanzania",
  "United Republic of Tanzania": "tanzania",
  "DR Congo": "dr-congo",
  "Democratic Republic of the Congo": "dr-congo",
  "Congo, The Democratic Republic of the": "dr-congo",
  Angola: "angola",
  "South Africa": "south-africa",
  Madagascar: "madagascar",
};

function LandingPage() {
  const navigate = useNavigate();

  const handleCountryClick = (countrySlug) => {
    navigate(`/country/${countrySlug}`);
  };

  const handleGeoClick = (geoName) => {
    const slug = geoNameToSlug[geoName];
    if (slug) {
      navigate(`/country/${slug}`);
    }
  };

  return (
    <>
      <div className="itss-page">
        <nav className="itss-nav">
          <div className="itss-brand">International Talent Space Station</div>

          <div className="itss-nav-actions">
            <Link className="itss-link" to="/login">
              Sign in
            </Link>
            <Link className="itss-btn" to="/signup">
              Get Started
            </Link>
          </div>
        </nav>

        <motion.section
          className="itss-hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="itss-hero-copy">
            <div className="itss-badge">Pan-African talent access</div>
            <h1 className="itss-title">
              Connecting companies to talent across Africa
            </h1>
            <p className="itss-subtitle">
              Discover skilled professionals across key African markets through
              one interactive hiring platform built for cross-border talent
              discovery.
            </p>

            <div className="itss-hero-actions">
              <Link className="itss-btn" to="/signup">
                Get Started
              </Link>
              <Link className="itss-btn-secondary" to="/login">
                Sign in
              </Link>
            </div>
          </div>

          <div className="itss-map-wrap">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [20, 1],
                scale: 420,
              }}
              className="itss-map"
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              <Geographies geography={africaGeo}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const geoName = geo.properties?.name;
                    const isSupported = Boolean(geoNameToSlug[geoName]);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          if (geoName) {
                            handleGeoClick(geoName);
                          }
                        }}
                        style={{
                          default: {
                            fill: "#2f5be7",
                            stroke: "#8eb7ff",
                            strokeWidth: 0.7,
                            outline: "none",
                          },
                          hover: {
                            fill: isSupported ? "#4471f2" : "#2f5be7",
                            stroke: isSupported ? "#d5e5ff" : "#8eb7ff",
                            strokeWidth: isSupported ? 1 : 0.7,
                            outline: "none",
                            cursor: isSupported ? "pointer" : "default",
                          },
                          pressed: {
                            fill: "#5680ff",
                            stroke: "#ffffff",
                            strokeWidth: 1,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {countries.map((country) => (
                <Marker
                  key={country.slug}
                  coordinates={country.coordinates}
                  onClick={() => handleCountryClick(country.slug)}
                >
                  <g className="itss-marker" style={{ cursor: "pointer" }}>
                    <circle
                      r={10}
                      fill="#ffffff"
                      stroke="#dbeafe"
                      strokeWidth={1.8}
                      className="itss-marker-circle"
                    />
                    <text
                      textAnchor="middle"
                      y={4}
                      fontSize={11}
                      className="itss-marker-emoji"
                    >
                      {country.flag}
                    </text>
                  </g>
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </motion.section>
      </div>

      <footer className="itss-footer">
        <div className="itss-footer-bottom">
          © {new Date().getFullYear()} International Talent Space Station. All rights reserved.
        </div>
      </footer>
    </>
  );
}

export default LandingPage;