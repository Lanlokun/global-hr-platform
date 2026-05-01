import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  Building2,
  Globe2,
  BriefcaseBusiness,
  Pencil,
  Save,
  PlusCircle,
} from "lucide-react";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useLanguage } from "../../context/LanguageContext";

function EmployerCompany() {
  const { t } = useLanguage();

  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const emptyForm = {
    name: "",
    industry: "",
    country: "",
    city: "",
    address: "",
    description: "",
    website: "",
    logo: "",
    size: "",
    founded_year: "",
  };

  const [form, setForm] = useState(emptyForm);

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
    []
  );

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowed.includes(file.type)) {
      toast.error(t("invalidImageFormat"));
      return;
    }

    try {
      setUploadingLogo(true);

      const data = new FormData();
      data.append("image", file);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/uploads/company-logo`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      handleChange("logo", res.data.url);
      toast.success(t("logoUploadSuccess"));
    } catch (error) {
      toast.error(error.response?.data?.error || t("logoUploadError"));
    } finally {
      setUploadingLogo(false);
    }
  };

  const fetchCompany = useCallback(async () => {
    try {
      const res = await api.get("/api/employer/company", authHeaders);
      const current = res.data.company;

      setCompany(current);

      if (current) {
        setForm({
          name: current.name || "",
          industry: current.industry || "",
          country: current.country || "",
          city: current.city || "",
          address: current.address || "",
          description: current.description || "",
          website: current.website || "",
          logo: current.logo || "",
          size: current.size || "",
          founded_year: current.founded_year || "",
        });
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t("loadCompanyError"));
    }
  }, [authHeaders, t]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveCompany = async () => {
    if (!form.name.trim()) {
      toast.error(t("companyNameRequired"));
      return;
    }

    try {
      setSaving(true);

      if (company) {
        const res = await api.put("/api/employer/company", form, authHeaders);
        const updatedCompany = res.data.company || res.data;

        setCompany(updatedCompany);
        setIsEditing(false);
        toast.success(t("companyUpdated"));
      } else {
        const res = await api.post("/api/employer/company", form, authHeaders);
        const createdCompany = res.data.company || res.data;

        setCompany(createdCompany);
        setIsEditing(false);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, company_id: createdCompany.id })
        );

        toast.success(t("companyCreated"));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t("saveCompanyError"));
    } finally {
      setSaving(false);
    }
  };

  const completionItems = [
    { label: t("checkCompanyName"), complete: Boolean(form.name) },
    { label: t("checkIndustry"), complete: Boolean(form.industry) },
    { label: t("checkCountry"), complete: Boolean(form.country) },
    { label: t("checkCity"), complete: Boolean(form.city) },
    { label: t("checkDescription"), complete: Boolean(form.description) },
    { label: t("checkWebsite"), complete: Boolean(form.website) },
    { label: t("checkCompanySize"), complete: Boolean(form.size) },
    { label: t("checkFoundedYear"), complete: Boolean(form.founded_year) },
  ];

  const completedCount = completionItems.filter((item) => item.complete).length;
  const completionPercent = Math.round(
    (completedCount / completionItems.length) * 100
  );

  return (
    <DashboardLayout
      title={t("companyProfile")}
      subtitle={t("companyProfileSubtitle")}
    >
      <PageHeader
        action={
          company && !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil size={16} />
              {t("updateProfile")}
            </Button>
          ) : null
        }
      />

      <div style={styles.pageGrid}>
        <div style={styles.mainColumn}>
          <Card>
            {company ? (
              <div style={styles.profileHero}>
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    style={styles.companyLogoImage}
                  />
                ) : (
                  <div style={styles.logoBox}>
                    {company.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <p style={styles.label}>{t("employerOrganization")}</p>
                  <h2 style={styles.companyName}>{company.name}</h2>

                  <div style={styles.metaRow}>
                    <span style={styles.metaItem}>
                      <BriefcaseBusiness size={16} />
                      {company.industry || t("industryNotAdded")}
                    </span>

                    <span style={styles.metaItem}>
                      <Globe2 size={16} />
                      {company.country || t("countryNotAdded")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Building2 size={28} />
                </div>
                <h2 style={styles.companyName}>
                  {t("createCompanyProfile")}
                </h2>
                <p style={styles.emptyText}>
                  {t("createCompanyProfileDesc")}
                </p>
              </div>
            )}
          </Card>

          <div style={{ height: 18 }} />

          {company && !isEditing && (
            <Card
              title={t("companyDetails")}
              subtitle={t("companyDetailsSubtitle")}
            >
              <div style={styles.detailsGrid}>
                <DetailItem
                  label={t("companyName")}
                  value={company.name || t("notProvided")}
                />
                <DetailItem
                  label={t("industry")}
                  value={company.industry || t("notProvided")}
                />
                <DetailItem
                  label={t("country")}
                  value={company.country || t("notProvided")}
                />
                <DetailItem
                  label={t("city")}
                  value={company.city || t("notProvided")}
                />
                <DetailItem
                  label={t("companySize")}
                  value={company.size || t("notProvided")}
                />
                <DetailItem
                  label={t("foundedYear")}
                  value={company.founded_year || t("notProvided")}
                />
                <DetailItem
                  label={t("website")}
                  value={company.website || t("notProvided")}
                />
                <DetailItem
                  label={t("address")}
                  value={company.address || t("notProvided")}
                />
              </div>

              <div style={{ height: 16 }} />

              <div style={styles.descriptionBox}>
                <p>{t("companyDescription")}</p>
                <strong>{company.description || t("noDescription")}</strong>
              </div>
            </Card>
          )}

          {isEditing && (
            <Card
              title={
                company
                  ? t("updateCompanyProfile")
                  : t("createCompanyProfileTitle")
              }
              subtitle={t("companyFormSubtitle")}
            >
              <div style={styles.formGrid}>
                <Input
                  label={t("companyNameLabel")}
                  placeholder="AfriTalent Solutions"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />

                <Input
                  label={t("industryLabel")}
                  placeholder="HR Technology"
                  value={form.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                />

                <Input
                  label={t("countryLabel")}
                  placeholder="Nigeria"
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />

                <Input
                  label={t("cityLabel")}
                  placeholder="Lagos"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />

                <Input
                  label={t("companySizeLabel")}
                  placeholder="11-50"
                  value={form.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                />

                <Input
                  label={t("foundedYearLabel")}
                  type="number"
                  placeholder="2022"
                  value={form.founded_year}
                  onChange={(e) =>
                    handleChange("founded_year", e.target.value)
                  }
                />

                <Input
                  label={t("websiteLabel")}
                  placeholder="https://company.com"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />

                <div>
                  <label style={styles.fieldLabel}>{t("companyLogo")}</label>

                  <div style={styles.logoUploadBox}>
                    {form.logo ? (
                      <img
                        src={form.logo}
                        alt={t("companyLogo")}
                        style={styles.logoPreview}
                      />
                    ) : (
                      <div style={styles.logoPlaceholder}>
                        {form.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                    )}

                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <p style={styles.uploadHelp}>
                        {uploadingLogo
                          ? t("uploadingLogo")
                          : t("uploadLogoHelp")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: 14 }} />

              <Input
                label={t("addressLabel")}
                placeholder={t("addressPlaceholder")}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />

              <div style={{ height: 14 }} />

              <Input
                label={t("companyDescriptionLabel")}
                as="textarea"
                rows={5}
                placeholder={t("companyDescriptionPlaceholder")}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />

              <div style={styles.formActions}>
                {company && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({
                        name: company.name || "",
                        industry: company.industry || "",
                        country: company.country || "",
                        city: company.city || "",
                        address: company.address || "",
                        description: company.description || "",
                        website: company.website || "",
                        logo: company.logo || "",
                        size: company.size || "",
                        founded_year: company.founded_year || "",
                      });
                    }}
                  >
                    {t("cancel")}
                  </Button>
                )}

                <Button onClick={saveCompany} disabled={saving || uploadingLogo}>
                  {company ? <Save size={16} /> : <PlusCircle size={16} />}
                  {saving
                    ? t("saving")
                    : company
                    ? t("saveChanges")
                    : t("createCompany")}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div style={styles.sideColumn}>
          <Card
            title={t("profileStrength")}
            subtitle={t("profileStrengthSubtitle")}
          >
            <div style={styles.progressHeader}>
              <strong>
                {completionPercent}% {t("complete")}
              </strong>
              <span>
                {completedCount}/{completionItems.length}
              </span>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${completionPercent}%`,
                }}
              />
            </div>

            <div style={styles.checkList}>
              {completionItems.map((item) => (
                <div key={item.label} style={styles.checkItem}>
                  <span
                    style={{
                      ...styles.statusDot,
                      background: item.complete ? "#16a34a" : "#d1d5db",
                    }}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </Card>

          <div style={{ height: 18 }} />

          <Card
            title={t("employerTools")}
            subtitle={t("employerToolsSubtitle")}
          >
            <div style={styles.toolList}>
              <ToolItem title={t("postJobs")} text={t("postJobsDesc")} />
              <ToolItem
                title={t("reviewCandidates")}
                text={t("reviewCandidatesDesc")}
              />
              <ToolItem
                title={t("buildVisibility")}
                text={t("buildVisibilityDesc")}
              />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={styles.detailItem}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function ToolItem({ title, text }) {
  return (
    <div style={styles.toolItem}>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

const styles = {
  pageGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 360px",
    gap: 20,
    alignItems: "start",
  },
  mainColumn: {
    minWidth: 0,
  },
  sideColumn: {
    minWidth: 0,
  },
  profileHero: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },
  descriptionBox: {
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    background: "#fafafa",
  },
  fieldLabel: {
    display: "block",
    fontWeight: 700,
    marginBottom: 8,
    color: "#111827",
  },
  logoUploadBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  logoPreview: {
    width: 72,
    height: 72,
    borderRadius: 18,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 18,
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 26,
  },
  uploadHelp: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: 13,
  },
  companyLogoImage: {
    width: 82,
    height: 82,
    borderRadius: 24,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 16px 30px rgba(15, 23, 42, 0.12)",
  },
  logoBox: {
    width: 82,
    height: 82,
    borderRadius: 24,
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    fontWeight: 800,
    boxShadow: "0 16px 30px rgba(37, 99, 235, 0.22)",
  },
  label: {
    margin: 0,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  companyName: {
    margin: "6px 0 10px",
    fontSize: 28,
    lineHeight: 1.15,
    color: "#111827",
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#374151",
    fontSize: 14,
    fontWeight: 600,
  },
  emptyState: {
    textAlign: "center",
    padding: "26px 12px",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    margin: "0 auto 14px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    maxWidth: 520,
    margin: "0 auto",
    color: "#6b7280",
    lineHeight: 1.6,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  detailItem: {
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    background: "#fafafa",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 18,
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    color: "#111827",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    background: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "#2563eb",
    transition: "width 0.3s ease",
  },
  checkList: {
    marginTop: 16,
    display: "grid",
    gap: 10,
  },
  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#374151",
    fontSize: 14,
    fontWeight: 600,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  toolList: {
    display: "grid",
    gap: 12,
  },
  toolItem: {
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
};

export default EmployerCompany;