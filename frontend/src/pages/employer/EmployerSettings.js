import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

function EmployerSettings() {
  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage employer workspace preferences."
    >
      <PageHeader
        title="Workspace Settings"
        subtitle="Company settings and future organization preferences will live here."
      />

      <Card
        title="Settings"
        subtitle="This page is reserved for company-level workspace settings."
      >
        <p style={{ color: "#64748b", marginBottom: 0 }}>
          Later, you can add team members, notification preferences, branding, and permissions here.
        </p>
      </Card>
    </DashboardLayout>
  );
}

export default EmployerSettings;