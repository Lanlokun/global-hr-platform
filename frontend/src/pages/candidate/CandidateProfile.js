import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { toast } from "react-hot-toast";
import axios from "axios";

const sectionTabs = [
  "Basic Info",
  "Professional",
  "Experience",
  "Education",
  "Certifications",
  "Preferences",
  "Links",
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
  const token = localStorage.getItem("token");
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const initialForm = useMemo(
    () => ({
      // basic
      name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      address: "",
      date_of_birth: "",
      gender: "",
      profile_image: "",

      // professional
      professional_title: "",
      years_of_experience: "",
      professional_summary: "",
      skills: "",
      languages: "",

      // arrays
      experience: [],
      education: [],
      certifications: [],

      // preferences
      desired_job_title: "",
      preferred_employment_type: "",
      preferred_work_mode: "",
      expected_salary: "",
      salary_currency: "USD",
      notice_period: "",
      availability: "",
      work_authorization: "",
      willing_to_relocate: false,

      // links
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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
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
      toast.error(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [initialForm, token]);

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
    if (!form.name.trim()) return toast.error("Full name is required"), false;
    if (!form.email.trim()) return toast.error("Email is required"), false;
    if (!form.phone.trim()) return toast.error("Phone number is required"), false;
    if (!form.country.trim()) return toast.error("Country is required"), false;
    if (!form.professional_title.trim()) return toast.error("Professional title is required"), false;
    if (!form.professional_summary.trim()) return toast.error("Professional summary is required"), false;
    if (!form.skills.trim()) return toast.error("Skills are required"), false;
    return true;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image");
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

      toast.success("Profile image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to upload image");
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
      localStorage.setItem("user", JSON.stringify({ ...existingUser, ...res.data }));

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save profile");
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
      title="Candidate Profile"
      subtitle="Build a complete, recruiter-ready profile without filling everything at once."
    >
      <Card
      >
        {loading ? (
          <p style={{ margin: 0, color: "#6b7280" }}>Loading profile...</p>
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
                    Profile completion
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "0.92rem" }}>
                    A stronger profile helps employers evaluate your fit faster.
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
                  {index + 1}. {tab}
                </button>
              ))}
            </div>

            {activeSection === 0 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>Basic Information</h3>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Profile image</label>
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
                      alt="Profile"
                      style={{
                        width: 96,
                        height: 96,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "1px solid #d1d5db",
                      }}
                    />
                    <div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} />
                      <div style={{ marginTop: 8, color: "#6b7280", fontSize: "0.9rem" }}>
                        {uploadingImage ? "Uploading image..." : "Upload a professional profile photo"}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={gridStyle}>
                  <Input
                    label="Full name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                  <Input
                    label="Phone number"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                  <Input
                    label="Country"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                  />
                  <Input
                    label="City"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                  <Input
                    label="Address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                  <Input
                    label="Date of birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => updateField("date_of_birth", e.target.value)}
                  />
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select
                      style={selectStyle}
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 1 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>Professional Information</h3>

                <div style={gridStyle}>
                  <Input
                    label="Professional title"
                    placeholder="Frontend Developer"
                    value={form.professional_title}
                    onChange={(e) => updateField("professional_title", e.target.value)}
                  />
                  <Input
                    label="Years of experience"
                    type="number"
                    placeholder="3"
                    value={form.years_of_experience}
                    onChange={(e) => updateField("years_of_experience", e.target.value)}
                  />
                </div>

                <div style={{ height: 14 }} />

                <label style={labelStyle}>Professional summary</label>
                <textarea
                  style={textareaStyle}
                  rows={5}
                  placeholder="Summarize your background, strengths, and the kind of value you bring."
                  value={form.professional_summary}
                  onChange={(e) => updateField("professional_summary", e.target.value)}
                />

                <div style={{ height: 14 }} />

                <Input
                  label="Skills"
                  as="textarea"
                  rows={4}
                  placeholder="React, Node.js, Python, SQL, Communication, Leadership..."
                  value={form.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                />

                <div style={{ height: 14 }} />

                <Input
                  label="Languages"
                  placeholder="English, French, Arabic"
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
                  <h3 style={{ margin: 0 }}>Work Experience</h3>
                  <Button onClick={addExperience}>Add Experience</Button>
                </div>

                {form.experience.length === 0 && (
                  <p style={{ color: "#6b7280" }}>
                    No work experience added yet.
                  </p>
                )}

                {form.experience.map((item, index) => (
                  <div key={index} style={smallCardStyle}>
                    <div style={gridStyle}>
                      <Input
                        label="Company"
                        value={item.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                      />
                      <Input
                        label="Job title"
                        value={item.job_title}
                        onChange={(e) => updateExperience(index, "job_title", e.target.value)}
                      />
                      <Input
                        label="Employment type"
                        placeholder="Full-time"
                        value={item.employment_type}
                        onChange={(e) =>
                          updateExperience(index, "employment_type", e.target.value)
                        }
                      />
                      <Input
                        label="Location"
                        value={item.location}
                        onChange={(e) => updateExperience(index, "location", e.target.value)}
                      />
                      <Input
                        label="Start date"
                        type="date"
                        value={item.start_date}
                        onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                      />
                      <Input
                        label="End date"
                        type="date"
                        value={item.end_date}
                        disabled={item.currently_working}
                        onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                      />
                    </div>

                    <div style={{ marginTop: 12, marginBottom: 12 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={item.currently_working}
                          onChange={(e) =>
                            updateExperience(index, "currently_working", e.target.checked)
                          }
                        />
                        I currently work here
                      </label>
                    </div>

                    <label style={labelStyle}>Description</label>
                    <textarea
                      style={textareaStyle}
                      rows={4}
                      placeholder="Describe responsibilities, achievements, tools, and impact."
                      value={item.description}
                      onChange={(e) =>
                        updateExperience(index, "description", e.target.value)
                      }
                    />

                    <div style={{ marginTop: 12 }}>
                      <Button onClick={() => removeExperience(index)}>
                        Remove
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
                  <h3 style={{ margin: 0 }}>Education</h3>
                  <Button onClick={addEducation}>Add Education</Button>
                </div>

                {form.education.length === 0 && (
                  <p style={{ color: "#6b7280" }}>No education record added yet.</p>
                )}

                {form.education.map((item, index) => (
                  <div key={index} style={smallCardStyle}>
                    <div style={gridStyle}>
                      <Input
                        label="Institution"
                        value={item.institution}
                        onChange={(e) =>
                          updateEducation(index, "institution", e.target.value)
                        }
                      />
                      <Input
                        label="Degree"
                        value={item.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      />
                      <Input
                        label="Field of study"
                        value={item.field_of_study}
                        onChange={(e) =>
                          updateEducation(index, "field_of_study", e.target.value)
                        }
                      />
                      <Input
                        label="Start year"
                        type="number"
                        value={item.start_year}
                        onChange={(e) =>
                          updateEducation(index, "start_year", e.target.value)
                        }
                      />
                      <Input
                        label="End year"
                        type="number"
                        value={item.end_year}
                        onChange={(e) =>
                          updateEducation(index, "end_year", e.target.value)
                        }
                      />
                      <Input
                        label="Grade / CGPA"
                        value={item.grade}
                        onChange={(e) => updateEducation(index, "grade", e.target.value)}
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        style={textareaStyle}
                        rows={3}
                        placeholder="Optional details such as projects, honors, thesis, or distinctions."
                        value={item.description}
                        onChange={(e) =>
                          updateEducation(index, "description", e.target.value)
                        }
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Button onClick={() => removeEducation(index)}>Remove</Button>
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
                  <h3 style={{ margin: 0 }}>Certifications</h3>
                  <Button onClick={addCertification}>Add Certification</Button>
                </div>

                {form.certifications.length === 0 && (
                  <p style={{ color: "#6b7280" }}>
                    No certifications added yet.
                  </p>
                )}

                {form.certifications.map((item, index) => (
                  <div key={index} style={smallCardStyle}>
                    <div style={gridStyle}>
                      <Input
                        label="Certification name"
                        value={item.name}
                        onChange={(e) =>
                          updateCertification(index, "name", e.target.value)
                        }
                      />
                      <Input
                        label="Issuer"
                        value={item.issuer}
                        onChange={(e) =>
                          updateCertification(index, "issuer", e.target.value)
                        }
                      />
                      <Input
                        label="Issue date"
                        type="date"
                        value={item.issue_date}
                        onChange={(e) =>
                          updateCertification(index, "issue_date", e.target.value)
                        }
                      />
                      <Input
                        label="Expiry date"
                        type="date"
                        value={item.expiry_date}
                        onChange={(e) =>
                          updateCertification(index, "expiry_date", e.target.value)
                        }
                      />
                      <Input
                        label="Credential ID"
                        value={item.credential_id}
                        onChange={(e) =>
                          updateCertification(index, "credential_id", e.target.value)
                        }
                      />
                      <Input
                        label="Credential URL"
                        value={item.credential_url}
                        onChange={(e) =>
                          updateCertification(index, "credential_url", e.target.value)
                        }
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <Button onClick={() => removeCertification(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 5 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>Job Preferences</h3>

                <div style={gridStyle}>
                  <Input
                    label="Desired job title"
                    placeholder="Backend Engineer"
                    value={form.desired_job_title}
                    onChange={(e) => updateField("desired_job_title", e.target.value)}
                  />

                  <div>
                    <label style={labelStyle}>Employment type</label>
                    <select
                      style={selectStyle}
                      value={form.preferred_employment_type}
                      onChange={(e) =>
                        updateField("preferred_employment_type", e.target.value)
                      }
                    >
                      <option value="">Select employment type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Preferred work mode</label>
                    <select
                      style={selectStyle}
                      value={form.preferred_work_mode}
                      onChange={(e) =>
                        updateField("preferred_work_mode", e.target.value)
                      }
                    >
                      <option value="">Select work mode</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <Input
                    label="Expected salary"
                    type="number"
                    value={form.expected_salary}
                    onChange={(e) => updateField("expected_salary", e.target.value)}
                  />

                  <div>
                    <label style={labelStyle}>Salary currency</label>
                    <select
                      style={selectStyle}
                      value={form.salary_currency}
                      onChange={(e) => updateField("salary_currency", e.target.value)}
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
                    label="Notice period"
                    placeholder="Immediate / 2 weeks / 1 month"
                    value={form.notice_period}
                    onChange={(e) => updateField("notice_period", e.target.value)}
                  />

                  <Input
                    label="Availability"
                    placeholder="Immediately available"
                    value={form.availability}
                    onChange={(e) => updateField("availability", e.target.value)}
                  />

                  <Input
                    label="Work authorization"
                    placeholder="Authorized to work in Nigeria"
                    value={form.work_authorization}
                    onChange={(e) => updateField("work_authorization", e.target.value)}
                  />
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.willing_to_relocate}
                      onChange={(e) =>
                        updateField("willing_to_relocate", e.target.checked)
                      }
                    />
                    Willing to relocate
                  </label>
                </div>
              </div>
            )}

            {activeSection === 6 && (
              <div>
                <h3 style={{ marginBottom: 16 }}>Professional Links</h3>

                <div style={gridStyle}>
                  <Input
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/in/..."
                    value={form.linkedin_url}
                    onChange={(e) => updateField("linkedin_url", e.target.value)}
                  />
                  <Input
                    label="GitHub URL"
                    placeholder="https://github.com/..."
                    value={form.github_url}
                    onChange={(e) => updateField("github_url", e.target.value)}
                  />
                  <Input
                    label="Portfolio URL"
                    placeholder="https://yourportfolio.com"
                    value={form.portfolio_url}
                    onChange={(e) => updateField("portfolio_url", e.target.value)}
                  />
                  <Input
                    label="Resume URL"
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
                Previous
              </Button>

              <div style={{ display: "flex", gap: 12 }}>
                {activeSection < sectionTabs.length - 1 ? (
                  <Button onClick={nextSection}>Next</Button>
                ) : (
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
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