import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";

const sectionTabs = [
  "basicInfo",
  "professional",
  "experience",
  "education",
  "certifications",
  "preferences",
  "links",
];

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "0.95rem",
  background: "#fff",
};

const textareaStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "0.95rem",
  resize: "vertical",
  minHeight: 120,
  fontFamily: "inherit",
  background: "#fff",
};

const tabButtonStyle = (active) => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: active ? "1px solid #111827" : "1px solid #d1d5db",
  background: active ? "#111827" : "#fff",
  color: active ? "#fff" : "#111827",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
});

const smallCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
  background: "#fafafa",
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: 8,
};

function CandidateProfile() {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const initialForm = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      address: "",
      date_of_birth: "",
      gender: "",
      profile_image: "",

      professional_title: "",
      years_of_experience: "",
      professional_summary: "",
      skills: "",
      languages: "",

      experience: [],
      education: [],
      certifications: [],

      desired_job_title: "",
      preferred_employment_type: "",
      preferred_work_mode: "",
      expected_salary: "",
      salary_currency: "USD",
      notice_period: "",
      availability: "",
      work_authorization: "",
      willing_to_relocate: false,

      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
      resume_url: "",
    }),
    []
  );

  const [form, setForm] = useState(initialForm);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          job_title: "",
          employment_type: "",
          start_date: "",
          end_date: "",
          currently_working: false,
          location: "",
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (index, key, value) => {
    const updated = [...form.experience];
    updated[index][key] = value;

    if (key === "currently_working" && value) {
      updated[index].end_date = "";
    }

    setForm((prev) => ({ ...prev, experience: updated }));
  };

  const removeExperience = (index) => {
    const updated = form.experience.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, experience: updated }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          field_of_study: "",
          start_year: "",
          end_year: "",
          grade: "",
          description: "",
        },
      ],
    }));
  };

  const updateEducation = (index, key, value) => {
    const updated = [...form.education];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, education: updated }));
  };

  const removeEducation = (index) => {
    const updated = form.education.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, education: updated }));
  };

  const addCertification = () => {
    setForm((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: "",
          issuer: "",
          issue_date: "",
          expiry_date: "",
          credential_id: "",
          credential_url: "",
        },
      ],
    }));
  };

  const updateCertification = (index, key, value) => {
    const updated = [...form.certifications];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (index) => {
    const updated = form.certifications.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, certifications: updated }));
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/profile/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data || {};

      setForm({
        ...initialForm,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        country: data.country || "",
        city: data.city || "",
        address: data.address || "",
        date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : "",
        gender: data.gender || "",
        profile_image: data.profile_image || "",
        professional_title: data.professional_title || "",
        years_of_experience: data.years_of_experience || "",
        professional_summary: data.professional_summary || "",
        skills: data.skills || "",
        languages: data.languages || "",
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        certifications: Array.isArray(data.certifications)
          ? data.certifications
          : [],
        desired_job_title: data.desired_job_title || "",
        preferred_employment_type: data.preferred_employment_type || "",
        preferred_work_mode: data.preferred_work_mode || "",
        expected_salary: data.expected_salary || "",
        salary_currency: data.salary_currency || "USD",
        notice_period: data.notice_period || "",
        availability: data.availability || "",
        work_authorization: data.work_authorization || "",
        willing_to_relocate: Boolean(data.willing_to_relocate),
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        portfolio_url: data.portfolio_url || "",
        resume_url: data.resume_url || "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || t("loadProfileError"));
    } finally {
      setLoading(false);
    }
  }, [initialForm, token, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const completion = useMemo(() => {
    const checks = [
      form.name,
      form.email,
      form.phone,
      form.country,
      form.city,
      form.professional_title,
      form.professional_summary,
      form.skills,
      form.desired_job_title,
      form.preferred_employment_type,
      form.preferred_work_mode,
      form.work_authorization,
      form.linkedin_url || form.github_url || form.portfolio_url,
      form.experience.length > 0,
      form.education.length > 0,
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [form]);

  const validateForm = () => {
    if (!form.name.trim()) return toast.error(t("fullNameRequired")), false;
    if (!form.email.trim()) return toast.error(t("emailRequired")), false;
    if (!form.phone.trim()) return toast.error(t("phoneRequired")), false;
    if (!form.country.trim()) return toast.error(t("countryRequired")), false;
    if (!form.professional_title.trim())
      return toast.error(t("professionalTitleRequired")), false;
    if (!form.professional_summary.trim())
      return toast.error(t("professionalSummaryRequired")), false;
    if (!form.skills.trim()) return toast.error(t("skillsRequired")), false;

    return true;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowed.includes(file.type)) {
      toast.error(t("invalidImageType"));
      return;
    }

    try {
      setUploadingImage(true);

      const data = new FormData();
      data.append("image", file);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/uploads/profile-image`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setForm((prev) => ({
        ...prev,
        profile_image: res.data.url,
      }));

      toast.success(t("imageUploaded"));
    } catch (error) {
      toast.error(error.response?.data?.error || t("imageUploadFailed"));
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        years_of_experience: form.years_of_experience
          ? Number(form.years_of_experience)
          : null,
        expected_salary: form.expected_salary
          ? Number(form.expected_salary)
          : null,
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/profile/me`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...existingUser, ...res.data })
      );

      toast.success(t("profileUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.error || t("saveProfileError"));
    } finally {
      setSaving(false);
    }
  };

  const nextSection = () => {
    if (activeSection < sectionTabs.length - 1) {
      setActiveSection((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevSection = () => {
    if (activeSection > 0) {
      setActiveSection((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <DashboardLayout
      title={t("candidateProfile")}
      subtitle={t("candidateProfileSubtitle")}
    >
      <Card>
        {loading ? (
          <p style={{ margin: 0, color: "#6b7280" }}>
            {t("loadingProfile")}
          </p>
        ) : (
          <>
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                borderRadius: 14,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {t("profileCompletion")}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "0.92rem" }}>
                    {t("profileCompletionHint")}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                  {completion}%
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 999,
                  background: "#e5e7eb",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${completion}%`,
                    height: "100%",
                    background: "#111827",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {sectionTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  style={tabButtonStyle(activeSection === index)}
                  onClick={() => setActiveSection(index)}
                >
                  {index + 1}. {t(tab)}
                </button>
              ))}
            </div>

            {activeSection === 0 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>{t("basicInformation")}</h3>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>{t("profileImage")}</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <img
                      src={
                        form.profile_image ||
                        "https://i.pinimg.com/736x/7e/83/0e/7e830e9c49dee63d546ba2b376523d30.jpg"
                      }
                      alt={t("profileImage")}
                      style={{
                        width: 96,
                        height: 96,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "1px solid #d1d5db",
                      }}
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <div
                        style={{
                          marginTop: 8,
                          color: "#6b7280",
                          fontSize: "0.9rem",
                        }}
                      >
                        {uploadingImage
                          ? t("uploadingImage")
                          : t("uploadProfessionalPhoto")}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={gridStyle}>
                  <Input
                    label={t("fullName")}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                  <Input
                    label={t("email")}
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                  <Input
                    label={t("phone")}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                  <Input
                    label={t("country")}
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                  />
                  <Input
                    label={t("city")}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                  <Input
                    label={t("address")}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                  <Input
                    label={t("dateOfBirth")}
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) =>
                      updateField("date_of_birth", e.target.value)
                    }
                  />
                  <div>
                    <label style={labelStyle}>{t("gender")}</label>
                    <select
                      style={selectStyle}
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                    >
                      <option value="">{t("selectGender")}</option>
                      <option value="Male">{t("male")}</option>
                      <option value="Female">{t("female")}</option>
                      <option value="Other">{t("other")}</option>
                      <option value="Prefer not to say">
                        {t("preferNotToSay")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 1 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>
                  {t("professionalInformation")}
                </h3>

                <div style={gridStyle}>
                  <Input
                    label={t("professionalTitle")}
                    placeholder={t("frontendDeveloperPlaceholder")}
                    value={form.professional_title}
                    onChange={(e) =>
                      updateField("professional_title", e.target.value)
                    }
                  />
                  <Input
                    label={t("yearsExperience")}
                    type="number"
                    placeholder="3"
                    value={form.years_of_experience}
                    onChange={(e) =>
                      updateField("years_of_experience", e.target.value)
                    }
                  />
                </div>

                <div style={{ height: 14 }} />

                <label style={labelStyle}>{t("professionalSummary")}</label>
                <textarea
                  style={textareaStyle}
                  rows={5}
                  placeholder={t("professionalSummaryPlaceholder")}
                  value={form.professional_summary}
                  onChange={(e) =>
                    updateField("professional_summary", e.target.value)
                  }
                />

                <div style={{ height: 14 }} />

                <Input
                  label={t("skills")}
                  as="textarea"
                  rows={4}
                  placeholder={t("skillsPlaceholder")}
                  value={form.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                />

                <div style={{ height: 14 }} />

                <Input
                  label={t("languages")}
                  placeholder={t("languagesPlaceholder")}
                  value={form.languages}
                  onChange={(e) => updateField("languages", e.target.value)}
                />
              </div>
            )}

            {activeSection === 2 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{t("workExperience")}</h3>
                  <Button onClick={addExperience}>{t("addExperience")}</Button>
                </div>

                {form.experience.length === 0 && (
                  <p style={{ color: "#6b7280" }}>
                    {t("noWorkExperience")}
                  </p>
                )}

                {form.experience.map((item, index) => (
                  <div key={index} style={smallCardStyle}>
                    <div style={gridStyle}>
                      <Input
                        label={t("company")}
                        value={item.company}
                        onChange={(e) =>
                          updateExperience(index, "company", e.target.value)
                        }
                      />
                      <Input
                        label={t("jobTitle")}
                        value={item.job_title}
                        onChange={(e) =>
                          updateExperience(index, "job_title", e.target.value)
                        }
                      />
                      <Input
                        label={t("employmentType")}
                        placeholder={t("fullTime")}
                        value={item.employment_type}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "employment_type",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label={t("location")}
                        value={item.location}
                        onChange={(e) =>
                          updateExperience(index, "location", e.target.value)
                        }
                      />
                      <Input
                        label={t("startDate")}
                        type="date"
                        value={item.start_date}
                        onChange={(e) =>
                          updateExperience(index, "start_date", e.target.value)
                        }
                      />
                      <Input
                        label={t("endDate")}
                        type="date"
                        value={item.end_date}
                        disabled={item.currently_working}
                        onChange={(e) =>
                          updateExperience(index, "end_date", e.target.value)
                        }
                      />
                    </div>

                    <div style={{ marginTop: 12, marginBottom: 12 }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.currently_working}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "currently_working",
                              e.target.checked
                            )
                          }
                        />
                        {t("currentlyWorkHere")}
                      </label>
                    </div>

                    <label style={labelStyle}>{t("description")}</label>
                    <textarea
                      style={textareaStyle}
                      rows={4}
                      placeholder={t("experienceDescriptionPlaceholder")}
                      value={item.description}
                      onChange={(e) =>
                        updateExperience(index, "description", e.target.value)
                      }
                    />

                    <div style={{ marginTop: 12 }}>
                      <Button onClick={() => removeExperience(index)}>
                        {t("remove")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 3 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{t("education")}</h3>
                  <Button onClick={addEducation}>{t("addEducation")}</Button>
                </div>

                {form.education.length === 0 && (
                  <p style={{ color: "#6b7280" }}>
                    {t("noEducationRecord")}
                  </p>
                )}

                {form.education.map((item, index) => (
                  <div key={index} style={smallCardStyle}>
                    <div style={gridStyle}>
                      <Input
                        label={t("institution")}
                        value={item.institution}
                        onChange={(e) =>
                          updateEducation(index, "institution", e.target.value)
                        }
                      />
                      <Input
                        label={t("degree")}
                        value={item.degree}
                        onChange={(e) =>
                          updateEducation(index, "degree", e.target.value)
                        }
                      />
                      <Input
                        label={t("fieldOfStudy")}
                        value={item.field_of_study}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "field_of_study",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label={t("startYear")}
                        type="number"
                        value={item.start_year}
                        onChange={(e) =>
                          updateEducation(index, "start_year", e.target.value)
                        }
                      />
                      <Input
                        label={t("endYear")}
                        type="number"
                        value={item.end_year}
                        onChange={(e) =>
                          updateEducation(index, "end_year", e.target.value)
                        }
                      />
                      <Input
                        label={t("gradeCgpa")}
                        value={item.grade}
                        onChange={(e) =>
                          updateEducation(index, "grade", e.target.value)
                        }
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label style={labelStyle}>{t("description")}</label>
                      <textarea
                        style={textareaStyle}
                        rows={3}
                        placeholder={t("educationDescriptionPlaceholder")}
                        value={item.description}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Button onClick={() => removeEducation(index)}>
                        {t("remove")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 4 && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{t("certifications")}</h3>
                  <Button onClick={addCertification}>
                    {t("addCertification")}
                  </Button>
                </div>

                {form.certifications.length === 0 && (
                  <p style={{ color: "#6b7280" }}>
                    {t("noCertifications")}
                  </p>
                )}

                {form.certifications.map((item, index) => (
                  <div key={index} style={smallCardStyle}>
                    <div style={gridStyle}>
                      <Input
                        label={t("certificationName")}
                        value={item.name}
                        onChange={(e) =>
                          updateCertification(index, "name", e.target.value)
                        }
                      />
                      <Input
                        label={t("issuer")}
                        value={item.issuer}
                        onChange={(e) =>
                          updateCertification(index, "issuer", e.target.value)
                        }
                      />
                      <Input
                        label={t("issueDate")}
                        type="date"
                        value={item.issue_date}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "issue_date",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label={t("expiryDate")}
                        type="date"
                        value={item.expiry_date}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "expiry_date",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label={t("credentialId")}
                        value={item.credential_id}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "credential_id",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        label={t("credentialUrl")}
                        value={item.credential_url}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "credential_url",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Button onClick={() => removeCertification(index)}>
                        {t("remove")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 5 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>{t("jobPreferences")}</h3>

                <div style={gridStyle}>
                  <Input
                    label={t("desiredJobTitle")}
                    placeholder={t("backendEngineerPlaceholder")}
                    value={form.desired_job_title}
                    onChange={(e) =>
                      updateField("desired_job_title", e.target.value)
                    }
                  />

                  <div>
                    <label style={labelStyle}>{t("employmentType")}</label>
                    <select
                      style={selectStyle}
                      value={form.preferred_employment_type}
                      onChange={(e) =>
                        updateField("preferred_employment_type", e.target.value)
                      }
                    >
                      <option value="">{t("selectEmploymentType")}</option>
                      <option value="Full-time">{t("fullTime")}</option>
                      <option value="Part-time">{t("partTime")}</option>
                      <option value="Contract">{t("contract")}</option>
                      <option value="Internship">{t("internship")}</option>
                      <option value="Freelance">{t("freelance")}</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>{t("preferredWorkMode")}</label>
                    <select
                      style={selectStyle}
                      value={form.preferred_work_mode}
                      onChange={(e) =>
                        updateField("preferred_work_mode", e.target.value)
                      }
                    >
                      <option value="">{t("selectWorkMode")}</option>
                      <option value="On-site">{t("onSite")}</option>
                      <option value="Remote">{t("remote")}</option>
                      <option value="Hybrid">{t("hybrid")}</option>
                    </select>
                  </div>

                  <Input
                    label={t("expectedSalary")}
                    type="number"
                    value={form.expected_salary}
                    onChange={(e) =>
                      updateField("expected_salary", e.target.value)
                    }
                  />

                  <div>
                    <label style={labelStyle}>{t("salaryCurrency")}</label>
                    <select
                      style={selectStyle}
                      value={form.salary_currency}
                      onChange={(e) =>
                        updateField("salary_currency", e.target.value)
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="NGN">NGN</option>
                      <option value="GMD">GMD</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>

                  <Input
                    label={t("noticePeriod")}
                    placeholder={t("noticePeriodPlaceholder")}
                    value={form.notice_period}
                    onChange={(e) =>
                      updateField("notice_period", e.target.value)
                    }
                  />

                  <Input
                    label={t("availability")}
                    placeholder={t("availabilityPlaceholder")}
                    value={form.availability}
                    onChange={(e) =>
                      updateField("availability", e.target.value)
                    }
                  />

                  <Input
                    label={t("workAuthorization")}
                    placeholder={t("workAuthorizationPlaceholder")}
                    value={form.work_authorization}
                    onChange={(e) =>
                      updateField("work_authorization", e.target.value)
                    }
                  />
                </div>

                <div style={{ marginTop: 14 }}>
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <input
                      type="checkbox"
                      checked={form.willing_to_relocate}
                      onChange={(e) =>
                        updateField("willing_to_relocate", e.target.checked)
                      }
                    />
                    {t("willingToRelocate")}
                  </label>
                </div>
              </div>
            )}

            {activeSection === 6 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>{t("professionalLinks")}</h3>

                <div style={gridStyle}>
                  <Input
                    label={t("linkedinUrl")}
                    placeholder="https://linkedin.com/in/..."
                    value={form.linkedin_url}
                    onChange={(e) =>
                      updateField("linkedin_url", e.target.value)
                    }
                  />
                  <Input
                    label={t("githubUrl")}
                    placeholder="https://github.com/..."
                    value={form.github_url}
                    onChange={(e) => updateField("github_url", e.target.value)}
                  />
                  <Input
                    label={t("portfolioUrl")}
                    placeholder="https://yourportfolio.com"
                    value={form.portfolio_url}
                    onChange={(e) =>
                      updateField("portfolio_url", e.target.value)
                    }
                  />
                  <Input
                    label={t("resumeUrl")}
                    placeholder="https://.../resume.pdf"
                    value={form.resume_url}
                    onChange={(e) => updateField("resume_url", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 28,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Button onClick={prevSection} disabled={activeSection === 0}>
                {t("previous")}
              </Button>

              <div style={{ display: "flex", gap: 12 }}>
                {activeSection < sectionTabs.length - 1 ? (
                  <Button onClick={nextSection}>{t("next")}</Button>
                ) : (
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? t("saving") : t("saveProfile")}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default CandidateProfile;