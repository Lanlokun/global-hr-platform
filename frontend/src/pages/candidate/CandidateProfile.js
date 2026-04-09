import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { toast } from "react-hot-toast";
import axios from "axios";

function CandidateProfile() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    professional_title: "",
    skills: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        country: res.data.country || "",
        professional_title: res.data.professional_title || "",
        skills: res.data.skills || "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/me",
        form,
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

      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save profile");
    }
  };

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your personal and professional details."
    >

      <Card
      >
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Professional title"
          placeholder="Software Engineer"
          value={form.professional_title}
          onChange={(e) =>
            setForm({ ...form, professional_title: e.target.value })
          }
        />
        <div style={{ height: 14 }} />
        <Input
          label="Skills"
          as="textarea"
          rows={5}
          placeholder="React, Node.js, PostgreSQL..."
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />
        <div style={{ height: 16 }} />
        <Button onClick={saveProfile}>
          Save Profile
        </Button>
      </Card>
    </DashboardLayout>
  );
}

export default CandidateProfile;