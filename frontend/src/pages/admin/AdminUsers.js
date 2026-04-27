import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
  gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr 1.2fr",
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
  gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr 1.2fr",
  gap: "12px",
  padding: "16px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
};

const cellStyle = {
  fontSize: "14px",
  color: "#0f172a",
};

function AdminUsers() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && !user.is_deleted) ||
        (statusFilter === "inactive" && user.is_deleted);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      employer: users.filter((u) => u.role === "employer").length,
      candidate: users.filter((u) => u.role === "candidate").length,
      active: users.filter((u) => !u.is_deleted).length,
      inactive: users.filter((u) => u.is_deleted).length,
    };
  }, [users]);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin": return "danger";
      case "employer": return "default";
      case "candidate": return "success";
      default: return "warning";
    }
  };

  const getStatusBadgeVariant = (user) => {
    return user.is_deleted ? "danger" : "success";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout title="User Management" subtitle="Loading users...">
        <Card>
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading user data...
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Manage all platform users and their access levels."
    >
      <div style={pageGridStyle}>
        <Card title="Total Users" subtitle="All registered accounts">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>
            {stats.total}
          </div>
        </Card>
        <Card title="Admins" subtitle="Platform administrators">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#dc2626" }}>
            {stats.admin}
          </div>
        </Card>
        <Card title="Employers" subtitle="Company accounts">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>
            {stats.employer}
          </div>
        </Card>
        <Card title="Candidates" subtitle="Job seekers">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#16a34a" }}>
            {stats.candidate}
          </div>
        </Card>
      </div>

      <Card title="User Directory" subtitle="Search and filter all platform users.">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr 1fr", 
          gap: "12px", 
          marginBottom: "20px" 
        }}>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            as="select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: "all", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "employer", label: "Employer" },
              { value: "candidate", label: "Candidate" },
            ]}
          />
          <Input
            as="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>

        <div style={tableStyle}>
          <div style={tableHeaderStyle}>
            <span>User</span>
            <span>Role</span>
            <span>Country</span>
            <span>Registered</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          
          <div>
            {filteredUsers.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#64748b",
                gridColumn: "1 / -1"
              }}>
                No users found matching your criteria.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} style={rowStyle}>
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {user.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {user.email || "No email"}
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role || "unknown"}
                    </Badge>
                  </div>
                  
                  <div style={cellStyle}>
                    {user.country || "Not specified"}
                  </div>
                  
                  <div style={cellStyle}>
                    {formatDate(user.created_at)}
                  </div>
                  
                  <div>
                    <Badge variant={getStatusBadgeVariant(user)}>
                      {user.is_deleted ? "Inactive" : "Active"}
                    </Badge>
                  </div>
                  
                  <div>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
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

export default AdminUsers;