import { useLanguage } from "../../context/LanguageContext";

function LanguageSwitcher() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "10px 12px",
        background: "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <option value="en">{t("english")}</option>
      <option value="zh">{t("chinese")}</option>
    </select>
  );
}

export default LanguageSwitcher;