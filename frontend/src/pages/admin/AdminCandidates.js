import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const tableStyle = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  background: "#ffffff",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1.2fr",
  gap: "12px",
  padding: "16px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#64748b",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1.2fr",
  gap: "12px",
  padding: "16px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
};

const cellStyle = {
  fontSize: "14px",
  color: "#0f172a",
};

function AdminCandidates() {
  const token = localStorage.getItem("token");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/candidates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCandidates(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [token]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        !search ||
        candidate.name?.toLowerCase().includes(search.toLowerCase()) ||
        candidate.professional_title?.toLowerCase().includes(search.toLowerCase()) ||
        candidate.skills?.toLowerCase().includes(search.toLowerCase());

      const matchesCountry = countryFilter === "all" || candidate.country === countryFilter;
      const matchesAvailability = availabilityFilter === "all" || 
        candidate.availability === availabilityFilter;

      return matchesSearch && matchesCountry && matchesAvailability;
    });
  }, [candidates, search, countryFilter, availabilityFilter]);

  const stats = useMemo(() => {
    return {
      total: candidates.length,
      withProfile: candidates.filter((c) => c.professional_title).length,
      withExperience: candidates.filter((c) => c.years_of_experience).length,
      withApplications: candidates.filter((c) => c.application_count > 0).length,
      totalApplications: candidates.reduce((sum, c) => sum + (c.application_count || 0), 0),
    };
  }, [candidates]);

  const countries = useMemo(() => {
    const countrySet = new Set(candidates.map((c) => c.country).filter(Boolean));
    return Array.from(countrySet).sort();
  }, [candidates]);

  const getAvailabilityBadgeVariant = (availability) => {
    switch (availability) {
      case "Immediately available": return "success";
      case "Available within 2 weeks": return "default";
      case "Available within 1 month": return "warning";
      case "Not available": return "danger";
      default: return "secondary";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout title="Candidate Management" subtitle="Loading candidates...">
        <Card>
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading candidate data...
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Candidate Management"
      subtitle="Manage all candidate profiles and their activities."
    >
      <div style={pageGridStyle}>
        <Card title="Total Candidates" subtitle="All registered candidates">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>
            {stats.total}
          </div>
        </Card>
        <Card title="With Profiles" subtitle="Candidates with professional titles">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#16a34a" }}>
            {stats.withProfile}
          </div>
        </Card>
        <Card title="With Experience" subtitle="Candidates showing experience">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>
            {stats.withExperience}
          </div>
        </Card>
        <Card title="Total Applications" subtitle="Applications submitted by candidates">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#7c3aed" }}>
            {stats.totalApplications}
          </div>
        </Card>
      </div>

      <Card title="Candidate Directory" subtitle="Search and filter all candidate profiles.">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr 1fr", 
          gap: "12px", 
          marginBottom: "20px" 
        }}>
          <Input
            placeholder="Search by name, title, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            as="select"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            options={[
              { value: "all", label: "All Countries" },
              ...countries.map((country) => ({ value: country, label: country })),
            ]}
          />
          <Input
            as="select"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            options={[
              { value: "all", label: "All Availability" },
              { value: "Immediately available", label: "Immediately" },
              { value: "Available within 2 weeks", label: "2 weeks" },
              { value: "Available within 1 month", label: "1 month" },
              { value: "Not available", label: "Not available" },
            ]}
          />
        </div>

        <div style={tableStyle}>
          <div style={tableHeaderStyle}>
            <span>Candidate</span>
            <span>Location</span>
            <span>Experience</span>
            <span>Applications</span>
            <span>Actions</span>
          </div>
          
          <div>
            {filteredCandidates.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#64748b",
                gridColumn: "1 / -1"
              }}>
                No candidates found matching your criteria.
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <div key={candidate.id} style={rowStyle}>
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {candidate.name || "Unknown Candidate"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {candidate.professional_title || "No title"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {candidate.skills ? 
                        (candidate.skills.length > 80 ? 
                          candidate.skills.substring(0, 80) + "..." : 
                          candidate.skills
                        ) : "No skills listed"
                      }
                    </div>
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {candidate.country || "Not specified"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {candidate.city || "City not specified"}
                    </div>
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {candidate.years_of_experience ? 
                        `${candidate.years_of_experience} years` : 
                        "Not specified"
                      }
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {candidate.availability || "Availability not specified"}
                    </div>
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {candidate.application_count || 0}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      applications
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {candidate.availability && (
                        <Badge variant={getAvailabilityBadgeVariant(candidate.availability)}>
                          {candidate.availability}
                        </Badge>
                      )}
                      <Button variant="secondary" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default AdminCandidates;
