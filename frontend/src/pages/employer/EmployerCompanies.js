import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";

function EmployerCompanies() {
  const token = localStorage.getItem("token");

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [editForm, setEditForm] = useState({
    name: "",
    industry: "",
    country: "",
  });

  const [form, setForm] = useState({
    name: "",
    industry: "",
    country: "",
  });

  const resetCreateForm = () => {
    setForm({
      name: "",
      industry: "",
      country: "",
    });
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies");
      setCompanies(res.data);
    } catch {
      toast.error("Failed to load companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const createCompany = async () => {
    try {
      await axios.post("http://localhost:5000/api/companies", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Company created");
      resetCreateForm();
      setShowCreateModal(false);
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create company");
    }
  };

  const confirmDeleteCompany = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/companies/${deleteTarget.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Company deleted");
      setDeleteTarget(null);
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete company");
    }
  };

  const startEdit = (company) => {
    setEditingId(company.id);
    setEditForm({
      name: company.name || "",
      industry: company.industry || "",
      country: company.country || "",
    });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/companies/${id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Company updated");
      setEditingId(null);
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update company");
    }
  };

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();

    return companies.filter((company) => {
      if (!q) return true;

      return (
        company.name?.toLowerCase().includes(q) ||
        company.industry?.toLowerCase().includes(q) ||
        company.country?.toLowerCase().includes(q)
      );
    });
  }, [companies, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout
      title="Companies"
      subtitle="Manage employer organizations in a clean standard table."
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
          <div style={{ flex: "1 1 420px", minWidth: "280px" }}>
            <Input
              label="Search companies"
              placeholder="Search by company name, industry, or country"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            + Create Company
          </Button>
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>#</th>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Country</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="ui-table-empty">
                    No companies found.
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((company, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={company.id}>
                      <td>{rowNumber}</td>

                      <td>
                        {editingId === company.id ? (
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          company.name
                        )}
                      </td>

                      <td>
                        {editingId === company.id ? (
                          <Input
                            value={editForm.industry}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                industry: e.target.value,
                              })
                            }
                          />
                        ) : (
                          company.industry || "Not set"
                        )}
                      </td>

                      <td>
                        {editingId === company.id ? (
                          <Input
                            value={editForm.country}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                country: e.target.value,
                              })
                            }
                          />
                        ) : (
                          company.country || "Not set"
                        )}
                      </td>

                      <td>
                        <div className="ui-table-actions">
                          {editingId === company.id ? (
                            <>
                              <Button onClick={() => saveEdit(company.id)}>
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                onClick={() => startEdit(company)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => setDeleteTarget(company)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
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
            {filteredCompanies.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredCompanies.length)} of{" "}
            {filteredCompanies.length} companies
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

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "640px",
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Create Company</h3>
                <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                  Add a new company to your workspace.
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </Button>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              <Input
                label="Company name"
                placeholder="Global HR Inc"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <Input
                label="Industry"
                placeholder="HR Tech"
                value={form.industry}
                onChange={(e) =>
                  setForm({ ...form, industry: e.target.value })
                }
              />

              <Input
                label="Country"
                placeholder="Japan"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetCreateForm();
                    setShowCreateModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={createCompany}>Create Company</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete company?"
        message={`Are you sure you want to delete "${deleteTarget?.name || ""}"? This may also affect related jobs.`}
        confirmText="Delete company"
        onConfirm={confirmDeleteCompany}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default EmployerCompanies;