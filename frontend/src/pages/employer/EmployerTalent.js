import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

function EmployerTalent() {
  const [candidates, setCandidates] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchTalent = useCallback(async () => {
    try {
      const res = await api.get("/api/employer/talent", authHeaders);
      setCandidates(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load talent directory");
    }
  }, []);

  useEffect(() => {
    fetchTalent();
  }, [fetchTalent]);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !q ||
        candidate.name?.toLowerCase().includes(q) ||
        candidate.email?.toLowerCase().includes(q) ||
        candidate.professional_title?.toLowerCase().includes(q) ||
        candidate.skills?.toLowerCase().includes(q);

      const matchesCountry =
        !filters.country ||
        candidate.country?.toLowerCase().includes(filters.country.toLowerCase());

      return matchesSearch && matchesCountry;
    });
  }, [candidates, filters]);

  return (
    <DashboardLayout
      title="Talent Directory"
      subtitle="Browse discoverable candidate talent on the platform."
    >
      <PageHeader
        title="Talent Marketplace"
        subtitle="This is a discovery directory, separate from your applicants."
        action={<Badge variant="default">{filtered.length} candidates</Badge>}
      />

      <Card title="Search and Filter" subtitle="Refine talent by keyword or country.">
        <div className="ui-toolbar">
          <Input
            label="Search"
            placeholder="Search by name, email, title, or skills"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Input
            label="Country"
            placeholder="Nigeria, Kenya, Ghana..."
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          />
        </div>
      </Card>

      <div style={{ height: 20 }} />

      <Card title="Talent Table" subtitle="Candidates available on the platform.">
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Title</th>
                <th>Country</th>
                <th>Skills</th>
                <th>Applications</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="ui-table-empty">
                    No talent found.
                  </td>
                </tr>
              ) : (
                filtered.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.name || "N/A"}</td>
                    <td>{candidate.email || "N/A"}</td>
                    <td>{candidate.professional_title || "N/A"}</td>
                    <td>{candidate.country || "N/A"}</td>
                    <td>{candidate.skills || "N/A"}</td>
                    <td>
                      <Badge variant="default">{candidate.application_count || 0}</Badge>
                    </td>
                    <td>
                      <Button variant="secondary">View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default EmployerTalent;