import { useCallback , useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

function EmployerCandidates() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/candidates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCandidates(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load candidates");
    }
}, [token]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredCandidates = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const countryQuery = filters.country.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !q ||
        candidate.name?.toLowerCase().includes(q) ||
        candidate.email?.toLowerCase().includes(q) ||
        candidate.professional_title?.toLowerCase().includes(q) ||
        candidate.skills?.toLowerCase().includes(q);

      const matchesCountry =
        !countryQuery ||
        candidate.country?.toLowerCase().includes(countryQuery);

      return matchesSearch && matchesCountry;
    });
  }, [candidates, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout
      title="Candidates"
      subtitle="Browse and manage all candidates on the platform."
    >
      <Card
      >
        <div
          className="ui-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "end",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div style={{ flex: "1 1 360px", minWidth: "260px" }}>
            <Input
              label="Search"
              placeholder="Search by name, email, title, or skills"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div style={{ flex: "0 1 220px", minWidth: "180px" }}>
            <Input
              label="Country"
              placeholder="Japan, Nigeria, UK..."
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            />
          </div>

          {(filters.search || filters.country) && (
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  search: "",
                  country: "",
                })
              }
            >
              Clear
            </Button>
          )}
        </div>

        <div
          style={{
            fontSize: "14px",
            opacity: 0.8,
            marginBottom: "12px",
          }}
        >
          {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? "" : "s"} found
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Title</th>
                <th>Country</th>
                <th>Applications</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ui-table-empty">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((candidate, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={candidate.id}>
                      <td>{rowNumber}</td>
                      <td>{candidate.name || "N/A"}</td>
                      <td>{candidate.email || "N/A"}</td>
                      <td>{candidate.professional_title || "Not set"}</td>
                      <td>{candidate.country || "Not set"}</td>

                      <td>
                        <Badge variant="default">
                          {candidate.application_count || 0}
                        </Badge>
                      </td>

                      <td>
                        <div className="ui-table-actions">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              navigate(`/dashboard/candidates/${candidate.id}`)
                            }
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginTop: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Showing{" "}
            {filteredCandidates.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredCandidates.length)} of{" "}
            {filteredCandidates.length} candidates
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span
              style={{
                fontSize: "14px",
                minWidth: "90px",
                textAlign: "center",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default EmployerCandidates;