import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function EmployerCompany() {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    country: "",
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
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
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load company");
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const saveCompany = async () => {
    try {
      if (company) {
        const res = await api.put("/api/employer/company", form, authHeaders);
        setCompany(res.data);
        toast.success("Company updated");
      } else {
        const res = await api.post("/api/employer/company", form, authHeaders);
        setCompany(res.data);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, company_id: res.data.id })
        );
        toast.success("Company created");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save company");
    }
  };

  return (
    <DashboardLayout
      title="My Company"
      subtitle="Manage your organization profile."
    >
      <PageHeader
        title="Company Profile"
        subtitle="This page is limited to the company linked to your employer account."
      />

      <Card
        title={company ? "Edit Company" : "Create Company"}
        subtitle="Set up your organization before posting jobs."
      >
        <Input
          label="Company name"
          placeholder="Global HR Inc"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Industry"
          placeholder="HR Tech"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Country"
          placeholder="Nigeria"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
        <div style={{ height: 16 }} />
        <Button onClick={saveCompany}>
          {company ? "Save Changes" : "Create Company"}
        </Button>
      </Card>
    </DashboardLayout>
  );
}

export default EmployerCompany;