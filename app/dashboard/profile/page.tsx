"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Lock, Bell, ShieldCheck, Camera, Check, AlertCircle, RefreshCw, Trash2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { Input, Textarea } from "@/components/ui/Input";

const API = "http://localhost:3002";

export default function RedesignedProfilePage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications" | "verification">("profile");
  
  // Loading & State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile data state
  const [profile, setProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  // Verification state
  const [studentIdCardUrl, setStudentIdCardUrl] = useState<string | null>(null);
  const [studentIdUploading, setStudentIdUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("unverified");
  const [verificationReason, setVerificationReason] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const studentIdFileRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("campusly_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUsername(data.username || "");
        setBio(data.bio || "");
        setPhone(data.phone || "");
        setStudentId(data.student_id || "");
        setStudentIdCardUrl(data.student_id_card_url || null);
        setVerificationStatus(data.verification_status || (data.is_verified ? "verified" : "unverified"));
        setVerificationReason(data.verification_reason || null);
        setNotifyEmail(data.notify_email ?? true);
        setNotifyPush(data.notify_push ?? true);
        setNotifySms(data.notify_sms ?? false);

        // Split name into first and last
        const nameParts = (data.name || "").trim().split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
      }
    } catch (err) {
      console.error("Fetch profile details error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStudentIdUploading(true);
    setSaveError(null);

    const token = localStorage.getItem("campusly_access_token") ?? "";
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload Student ID image.");
      }

      setStudentIdCardUrl(data.url);
    } catch (err: any) {
      setSaveError(err.message || "Failed to upload Student ID image.");
    } finally {
      setStudentIdUploading(false);
      e.target.value = "";
    }
  };

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdCardUrl) {
      setSaveError("Please upload an image of your Student ID card before submitting.");
      return;
    }

    setVerifying(true);
    setSaveError(null);

    const token = localStorage.getItem("campusly_access_token") ?? "";

    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: studentId.trim(),
          student_id_card_url: studentIdCardUrl,
          verification_status: "pending",
          is_verified: false,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit verification request.");
      }

      setVerificationStatus("pending");
      setProfile((prev: any) => ({ ...prev, verification_status: "pending", is_verified: false }));
    } catch (err: any) {
      setSaveError(err.message || "Failed to submit verification request.");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setAvatarUploading(true);

    const token = localStorage.getItem("campusly_access_token") ?? "";
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch(`${API}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Avatar upload failed.");
      }

      setUploadedAvatarUrl(uploadData.url);
      setAvatarPreview(uploadData.url);
    } catch (err: any) {
      setAvatarPreview(null);
      setAvatarError(err.message || "Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening the lightbox
    if (confirm("Are you sure you want to delete your profile photo?")) {
      setUploadedAvatarUrl("/default-avatar.svg");
      setAvatarPreview("/default-avatar.svg");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const token = localStorage.getItem("campusly_access_token") ?? "";
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const payload: Record<string, any> = {
        name: fullName,
        username: username.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        student_id: studentId.trim(),
      };

      if (uploadedAvatarUrl) {
        payload.avatar_url = uploadedAvatarUrl;
      }

      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to save profile.");
      }

      updateUser({
        name: fullName,
        username: data.username ?? username,
        avatar: data.avatar_url ?? user?.avatar,
      });

      setSaveSuccess(true);
      setUploadedAvatarUrl(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSaveError("New passwords do not match.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const token = localStorage.getItem("campusly_access_token") ?? "";

    try {
      const res = await fetch(`${API}/users/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password.");
      }

      setSaveSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const token = localStorage.getItem("campusly_access_token") ?? "";

    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notify_email: notifyEmail,
          notify_push: notifyPush,
          notify_sms: notifySms,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update notification settings.");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleMockVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setSaveError(null);

    const token = localStorage.getItem("campusly_access_token") ?? "";

    setTimeout(async () => {
      try {
        const res = await fetch(`${API}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_verified: true,
            student_id: studentId || "STUDENT_VERIFIED_123",
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to verify account.");
        }

        updateUser({ isVerified: true });
        setProfile((prev: any) => ({ ...prev, is_verified: true }));
        alert("Verification completed successfully! You are now a Verified Student.");
      } catch (err: any) {
        setSaveError(err.message || "Verification request failed.");
      } finally {
        setVerifying(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  const displayAvatar = avatarPreview ?? profile?.avatar_url ?? user?.avatar ?? "/default-avatar.svg";

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-text-primary dark:text-gray-100">
          Account settings
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sub-Navigation Tabs */}
        <div className="w-full md:w-64 bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-2xl p-4 shadow-sm flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              setActiveTab("profile");
              setSaveError(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
              activeTab === "profile"
                ? "bg-brand-indigo/10 text-brand-indigo font-bold"
                : "text-text-body dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <User size={16} />
            Profile Settings
          </button>
          <button
            onClick={() => {
              setActiveTab("password");
              setSaveError(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
              activeTab === "password"
                ? "bg-brand-indigo/10 text-brand-indigo font-bold"
                : "text-text-body dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Lock size={16} />
            Password
          </button>
          <button
            onClick={() => {
              setActiveTab("notifications");
              setSaveError(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
              activeTab === "notifications"
                ? "bg-brand-indigo/10 text-brand-indigo font-bold"
                : "text-text-body dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Bell size={16} />
            Notifications
          </button>
          <button
            onClick={() => {
              setActiveTab("verification");
              setSaveError(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
              activeTab === "verification"
                ? "bg-brand-indigo/10 text-brand-indigo font-bold"
                : "text-text-body dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <ShieldCheck size={16} />
            Verification
          </button>
        </div>

        {/* Right Settings Form Container */}
        <div className="flex-1 bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-2xl p-6 md:p-8 shadow-sm w-full">
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              {/* Photo Upload Zone */}
              <div className="flex items-center gap-6 pb-6 border-b border-border-soft dark:border-border-dark">
                <div
                  onClick={() => setShowLightbox(true)}
                  className="relative flex-shrink-0 cursor-pointer group"
                  title="Click to view full photo"
                >
                  <img
                    src={displayAvatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-card-dark shadow-md hover:scale-105 transition-transform"
                  />
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {/* Delete Trash Icon overlay on bottom right */}
                  {!avatarUploading && displayAvatar !== "/default-avatar.svg" && (
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-white dark:border-card-dark shadow transition-transform z-10"
                      title="Delete profile photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarUploading}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full bg-brand-indigo text-white hover:bg-brand-indigo-dark transition-all select-none disabled:opacity-50"
                  >
                    Upload New
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </div>

                {avatarError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {avatarError}
                  </p>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="First Name *"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-xl!"
                  required
                />
                <Input
                  label="Last Name *"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-xl!"
                  required
                />
                <Input
                  label="Email"
                  value={profile?.user?.email || ""}
                  disabled
                  className="rounded-xl! opacity-75 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                />
                <Input
                  label="Mobile Number *"
                  placeholder="e.g. +251 912 345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl!"
                  required
                />
                <Input
                  label="ID Number"
                  placeholder="Student ID Card Value"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="rounded-xl!"
                />
                <Input
                  label="Username *"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl!"
                  required
                />
                
                <div className="md:col-span-2">
                  <Textarea
                    label="Bio"
                    placeholder="Describe yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="rounded-xl!"
                    rows={3}
                  />
                </div>
              </div>

              {/* Status messages */}
              {saveError && (
                <p className="text-sm text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p className="text-sm text-emerald-600 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <Check size={14} className="flex-shrink-0" />
                  Profile updated successfully.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 font-semibold text-white rounded-full bg-brand-indigo hover:bg-brand-indigo-dark transition-all select-none active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Spinner size="sm" className="text-white" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handleSavePassword} className="flex flex-col gap-6">
              <h2 className="text-base font-bold font-heading text-text-primary dark:text-gray-100 border-b border-border-soft pb-2">
                Change Password
              </h2>
              
              <div className="flex flex-col gap-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="rounded-xl!"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl!"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl!"
                  required
                />
              </div>

              {saveError && (
                <p className="text-sm text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 max-w-md">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p className="text-sm text-emerald-600 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 max-w-md">
                  <Check size={14} className="flex-shrink-0" />
                  Password updated successfully.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 font-semibold text-white rounded-full bg-brand-indigo hover:bg-brand-indigo-dark transition-all select-none active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Spinner size="sm" className="text-white" />}
                  Save Password
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <form onSubmit={handleSaveNotifications} className="flex flex-col gap-6">
              <h2 className="text-base font-bold font-heading text-text-primary dark:text-gray-100 border-b border-border-soft pb-2">
                Notification preferences
              </h2>

              <div className="flex flex-col gap-4 max-w-lg">
                <label className="flex items-start gap-4 border border-border-soft dark:border-border-dark p-4 rounded-xl cursor-pointer hover:border-brand-indigo transition-colors bg-canvas dark:bg-canvas-dark select-none">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="accent-brand-indigo mt-1 h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary dark:text-gray-100">Email Notifications</p>
                    <p className="text-xs text-text-muted mt-0.5">Receive transaction invoices, listings updates, and reviews alerts via email.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 border border-border-soft dark:border-border-dark p-4 rounded-xl cursor-pointer hover:border-brand-indigo transition-colors bg-canvas dark:bg-canvas-dark select-none">
                  <input
                    type="checkbox"
                    checked={notifyPush}
                    onChange={(e) => setNotifyPush(e.target.checked)}
                    className="accent-brand-indigo mt-1 h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary dark:text-gray-100">Push Notifications</p>
                    <p className="text-xs text-text-muted mt-0.5">Get live notifications directly inside the browser when a transaction finishes.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 border border-border-soft dark:border-border-dark p-4 rounded-xl cursor-pointer hover:border-brand-indigo transition-colors bg-canvas dark:bg-canvas-dark select-none">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={(e) => setNotifySms(e.target.checked)}
                    className="accent-brand-indigo mt-1 h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary dark:text-gray-100">SMS Notifications</p>
                    <p className="text-xs text-text-muted mt-0.5">Receive mobile SMS updates for security changes and wallet payouts.</p>
                  </div>
                </label>
              </div>

              {saveError && (
                <p className="text-sm text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50 max-w-lg">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p className="text-sm text-emerald-600 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 max-w-lg">
                  <Check size={14} className="flex-shrink-0" />
                  Preferences updated successfully.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 font-semibold text-white rounded-full bg-brand-indigo hover:bg-brand-indigo-dark transition-all select-none active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Spinner size="sm" className="text-white" />}
                  Save Preferences
                </button>
              </div>
            </form>
          )}

          {activeTab === "verification" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold font-heading text-text-primary dark:text-gray-100 border-b border-border-soft pb-2">
                Student Verification
              </h2>

              {profile?.is_verified || verificationStatus === "verified" ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-6 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-emerald-500 rounded-full text-white flex-shrink-0">
                    <Check size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Account Verified</h3>
                      <span className="inline-flex items-center gap-1 font-semibold text-sky-500 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 rounded-full text-xs">
                        <svg className="w-3.5 h-3.5 fill-sky-500 text-white" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1 leading-relaxed">
                      Congratulations! Your student identity has been verified by an admin.
                    </p>
                  </div>
                </div>
              ) : verificationStatus === "pending" ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500 rounded-full text-white flex-shrink-0 mt-0.5">
                      <RefreshCw size={18} className="animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Verification Pending Review</h3>
                      <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                        Your Student ID document has been uploaded and is currently under review by our administration team. Once approved, your profile will instantly display a blue checkmark badge.
                      </p>
                    </div>
                  </div>

                  {studentIdCardUrl && (
                    <div className="mt-2 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 bg-white dark:bg-canvas-dark max-w-xs">
                      <p className="text-xs text-text-muted mb-2 font-medium">Uploaded Student ID Card:</p>
                      <img
                        src={studentIdCardUrl}
                        alt="Student ID Document"
                        className="w-full h-36 object-cover rounded-lg border border-border-soft"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRequestVerification} className="flex flex-col gap-5 max-w-lg">
                  {verificationStatus === "rejected" ? (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-xs text-red-800 dark:text-red-300 leading-relaxed flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
                        <AlertCircle size={16} />
                        <span>Verification Request Rejected / Revoked</span>
                      </div>
                      <p>
                        <strong>Reason from Admin:</strong> {verificationReason || "No specific reason provided."}
                      </p>
                      <p className="text-[11px] text-red-600 dark:text-red-400/80">
                        Please double check your Student ID image and submit a new request below.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/40 border border-border-soft dark:border-border-dark p-4 rounded-xl text-xs text-text-muted leading-relaxed flex gap-2.5">
                      <AlertCircle size={16} className="flex-shrink-0 text-brand-indigo mt-0.5" />
                      <span>
                        Upload your official university Student ID card image to request verification. Once reviewed by an admin, a blue tick badge will appear on your profile.
                      </span>
                    </div>
                  )}

                  <Input
                    label="Student ID Number *"
                    placeholder="e.g. ATR/8023/12"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="rounded-xl!"
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-text-primary dark:text-gray-200">
                      Student ID Card Image *
                    </span>

                    {studentIdCardUrl ? (
                      <div className="relative rounded-xl border border-border-soft dark:border-border-dark p-3 bg-canvas dark:bg-canvas-dark flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={studentIdCardUrl}
                            alt="Uploaded Student ID"
                            className="w-16 h-12 rounded-lg object-cover border border-border-soft"
                          />
                          <div className="text-xs">
                            <p className="font-semibold text-text-primary dark:text-gray-200">ID Image Uploaded</p>
                            <p className="text-text-muted text-[11px]">Ready for submission</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => studentIdFileRef.current?.click()}
                          className="text-xs text-brand-indigo font-medium hover:underline px-2 py-1"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => studentIdFileRef.current?.click()}
                        className="border-2 border-dashed border-border-soft dark:border-border-dark p-6 rounded-xl hover:border-brand-indigo transition-colors cursor-pointer text-center bg-canvas dark:bg-canvas-dark"
                      >
                        {studentIdUploading ? (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <Spinner size="md" />
                            <p className="text-xs text-text-muted">Uploading Student ID image...</p>
                          </div>
                        ) : (
                          <>
                            <Camera size={28} className="text-text-muted mx-auto mb-2" />
                            <p className="text-xs text-text-primary dark:text-gray-200 font-semibold">Click to select Student ID image</p>
                            <p className="text-[10px] text-text-muted mt-1">Supported formats: PNG, JPG, WEBP (Max 5MB)</p>
                          </>
                        )}
                      </div>
                    )}

                    <input
                      ref={studentIdFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleStudentIdSelect}
                      className="hidden"
                    />
                  </div>

                  {saveError && (
                    <p className="text-sm text-red-500 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {saveError}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={verifying || studentIdUploading || !studentIdCardUrl}
                      className="px-6 py-3 font-semibold text-white rounded-full bg-brand-indigo hover:bg-brand-indigo-dark transition-all select-none active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                    >
                      {verifying ? (
                        <>
                          <RefreshCw size={15} className="animate-spin text-white" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <span>Submit for Admin Review</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal overlay for viewing full size photo */}
      {showLightbox && (
        <div
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in cursor-zoom-out p-4"
        >
          <div className="relative max-w-xl w-full flex items-center justify-center">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-1 bg-white/10 rounded-full cursor-pointer"
              title="Close"
            >
              <X size={20} />
            </button>
            <img
              src={displayAvatar}
              alt="Avatar Full Preview"
              className="max-h-[80vh] max-w-full rounded-2xl border border-white/10 shadow-2xl object-contain animate-scale-in"
              onClick={(e) => e.stopPropagation()} // Stop click from closing
            />
          </div>
        </div>
      )}
    </div>
  );
}
