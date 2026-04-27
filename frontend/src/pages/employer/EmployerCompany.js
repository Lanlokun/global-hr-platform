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

function EmployerCompany() {
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
    toast.error("Please upload a JPG, PNG, or WEBP image");
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
    toast.success("Company logo uploaded");
  } catch (error) {
    toast.error(error.response?.data?.error || "Failed to upload logo");
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
      toast.error(error.response?.data?.error || "Failed to load company");
    }
  }, [authHeaders]);

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
      toast.error("Company name is required");
      return;
    }

    try {
      setSaving(true);

      if (company) {
        const res = await api.put("/api/employer/company", form, authHeaders);
        const updatedCompany = res.data.company || res.data;

        setCompany(updatedCompany);
        setIsEditing(false);
        toast.success("Company profile updated");
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

        toast.success("Company profile created");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save company");
    } finally {
      setSaving(false);
    }
  };

const completionItems = [
  { label: "Company name", complete: Boolean(form.name) },
  { label: "Industry", complete: Boolean(form.industry) },
  { label: "Country", complete: Boolean(form.country) },
  { label: "City", complete: Boolean(form.city) },
  { label: "Description", complete: Boolean(form.description) },
  { label: "Website", complete: Boolean(form.website) },
  { label: "Company size", complete: Boolean(form.size) },
  { label: "Founded year", complete: Boolean(form.founded_year) },
];

  const completedCount = completionItems.filter((item) => item.complete).length;
  const completionPercent = Math.round(
    (completedCount / completionItems.length) * 100
  );

  return (
    <DashboardLayout
      title="Company Profile"
      subtitle="Manage your organization identity, hiring presence, and employer information."
    >
      <PageHeader
        action={
          company && !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil size={16} />
              Update Profile
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
                  <img src={company.logo} alt={company.name} style={styles.companyLogoImage} />
                  ) : (
                    <div style={styles.logoBox}>
                      {company.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}

                <div style={{ flex: 1 }}>
                  <p style={styles.label}>Employer Organization</p>
                  <h2 style={styles.companyName}>{company.name}</h2>

                  <div style={styles.metaRow}>
                    <span style={styles.metaItem}>
                      <BriefcaseBusiness size={16} />
                      {company.industry || "Industry not added"}
                    </span>

                    <span style={styles.metaItem}>
                      <Globe2 size={16} />
                      {company.country || "Country not added"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Building2 size={28} />
                </div>
                <h2 style={styles.companyName}>Create your company profile</h2>
                <p style={styles.emptyText}>
                  Add your company details so you can publish jobs, review
                  candidates, and build a trusted employer presence.
                </p>
              </div>
            )}
          </Card>

          <div style={{ height: 18 }} />

          {company && !isEditing && (
            <Card title="Company Details" subtitle="Full employer profile information.">
              <div style={styles.detailsGrid}>
                <DetailItem label="Company Name" value={company.name || "Not provided"} />
                <DetailItem label="Industry" value={company.industry || "Not provided"} />
                <DetailItem label="Country" value={company.country || "Not provided"} />
                <DetailItem label="City" value={company.city || "Not provided"} />
                <DetailItem label="Company Size" value={company.size || "Not provided"} />
                <DetailItem label="Founded Year" value={company.founded_year || "Not provided"} />
                <DetailItem label="Website" value={company.website || "Not provided"} />
                <DetailItem label="Address" value={company.address || "Not provided"} />
              </div>

              <div style={{ height: 16 }} />

              <div style={styles.descriptionBox}>
                <p>Company Description</p>
                <strong>{company.description || "No description provided."}</strong>
              </div>
            </Card>
          )}

          {isEditing && (
            <Card
              title={company ? "Update Company Profile" : "Create Company Profile"}
              subtitle="Keep this information accurate. It helps candidates understand your organization."
            >
              <div style={styles.formGrid}>
                <Input
                  label="Company name"
                  placeholder="AfriTalent Solutions"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />

                <Input
                  label="Industry"
                  placeholder="HR Technology"
                  value={form.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                />

                <Input
                  label="Country"
                  placeholder="Nigeria"
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />

                <Input
                  label="City"
                  placeholder="Lagos"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />

                <Input
                  label="Company size"
                  placeholder="11-50"
                  value={form.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                />

                <Input
                  label="Founded year"
                  type="number"
                  placeholder="2022"
                  value={form.founded_year}
                  onChange={(e) => handleChange("founded_year", e.target.value)}
                />

                <Input
                  label="Website"
                  placeholder="https://company.com"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />

                <div>
                <label style={styles.fieldLabel}>Company logo</label>

                <div style={styles.logoUploadBox}>
                  {form.logo ? (
                    <img src={form.logo} alt="Company logo" style={styles.logoPreview} />
                  ) : (
                    <div style={styles.logoPlaceholder}>
                      {form.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}

                  <div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} />
                    <p style={styles.uploadHelp}>
                      {uploadingLogo
                        ? "Uploading logo..."
                        : "Upload JPG, PNG, or WEBP company logo"}
                    </p>
                  </div>
                </div>
              </div>
              </div>

              <div style={{ height: 14 }} />

              <Input
                label="Address"
                placeholder="Office address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />

              <div style={{ height: 14 }} />

              <Input
                label="Company description"
                as="textarea"
                rows={5}
                placeholder="Describe your company, mission, services, and hiring culture."
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
                  Cancel
                </Button>
              )}

        <Button onClick={saveCompany} disabled={saving || uploadingLogo}>
          {company ? <Save size={16} /> : <PlusCircle size={16} />}
          {saving
            ? "Saving..."
            : company
            ? "Save Changes"
            : "Create Company"}
        </Button>
      </div>
            </Card>
          )}
        </div>

        <div style={styles.sideColumn}>
          <Card title="Profile Strength" subtitle="Improve your employer profile.">
            <div style={styles.progressHeader}>
              <strong>{completionPercent}% complete</strong>
              <span>{completedCount}/{completionItems.length}</span>
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

          <Card title="Employer Tools" subtitle="Next steps after setup.">
            <div style={styles.toolList}>
              <ToolItem title="Post jobs" text="Create job openings for this company." />
              <ToolItem title="Review candidates" text="Manage applications and shortlisted talent." />
              <ToolItem title="Build visibility" text="Keep your company details clear and trusted." />
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