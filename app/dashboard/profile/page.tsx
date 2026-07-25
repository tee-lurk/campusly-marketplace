"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { User, Lock, Bell, ShieldCheck, Camera, Check, AlertCircle, RefreshCw, Trash2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { API_BASE_URL } from "@/lib/api";

const API = API_BASE_URL;

/* ── Styled input matching the established design system ──────────── */
function DashInput({
  label, disabled, hint, className, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-[#1A1A18] dark:text-[#F0F0F0]">
          {label}
        </label>
      )}
      <input
        {...props}
        disabled={disabled}
        className={`w-full rounded-lg border border-[#E5E5E0] dark:border-[#26282E] bg-white dark:bg-[#1e2028] text-[#1A1A18] dark:text-[#F0F0F0] placeholder:text-[#9a9aaa] px-4 py-3 text-sm transition-all focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 ${
          disabled ? "bg-[#F5F5F0] dark:bg-[#1a1c22] text-[#6B6B66] cursor-not-allowed opacity-75" : ""
        } ${className ?? ""}`}
      />
      {hint && <p className="text-xs text-[#6B6B66]">{hint}</p>}
    </div>
  );
}

function DashTextarea({
  label, ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-[#1A1A18] dark:text-[#F0F0F0]">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full rounded-lg border border-[#E5E5E0] dark:border-[#26282E] bg-white dark:bg-[#1e2028] text-[#1A1A18] dark:text-[#F0F0F0] placeholder:text-[#9a9aaa] px-4 py-3 text-sm transition-all focus:outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20 resize-none ${props.className ?? ""}`}
      />
    </div>
  );
}

/* ── Primary button ─────────────────────────────────────────────── */
function PrimaryBtn({
  children, loading, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white rounded-lg bg-brand-indigo hover:bg-brand-indigo-dark transition-all select-none active:scale-[0.97] disabled:opacity-50 shadow-btn hover:shadow-btn-hover text-sm ${props.className ?? ""}`}
    >
      {loading && <Spinner size="sm" className="text-white" />}
      {children}
    </button>
  );
}

/* ── Status alert boxes ─────────────────────────────────────────── */
function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-red-600 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-900/50">
      <AlertCircle size={14} className="flex-shrink-0" />
      {children}
    </div>
  );
}
function SuccessAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-emerald-600 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
      <Check size={14} className="flex-shrink-0" />
      {children}
    </div>
  );
}

/* ── Card wrapper ───────────────────────────────────────────────── */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#1e2028] border border-[#E5E5E0] dark:border-[#26282E] rounded-xl p-6 md:p-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}

/* ── Section title ──────────────────────────────────────────────── */
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-[28px] font-bold font-heading text-[#1A1A18] dark:text-[#F0F0F0] leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-[#6B6B66] mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}

export default function RedesignedProfilePage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const { user, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  const [studentIdCardUrl, setStudentIdCardUrl] = useState<string | null>(null);
  const [studentIdUploading, setStudentIdUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("unverified");
  const [verificationReason, setVerificationReason] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const studentIdFileRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("campusly_access_token");
    if (!token) { setLoading(false); return; }
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
      if (!res.ok) throw new Error(data.message || "Failed to upload Student ID image.");
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          student_id: studentId.trim(),
          student_id_card_url: studentIdCardUrl,
          verification_status: "pending",
          is_verified: false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to submit verification request.");
      setVerificationStatus("pending");
      setProfile((prev: any) => ({ ...prev, verification_status: "pending", is_verified: false }));
    } catch (err: any) {
      setSaveError(err.message || "Failed to submit verification request.");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [user]);
  useEffect(() => { setSaveError(null); setSaveSuccess(false); }, [activeTab]);

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
      if (!uploadRes.ok) throw new Error(uploadData.message || "Avatar upload failed.");
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
    e.stopPropagation();
    if (confirm("Are you sure you want to delete your profile photo?")) {
      setUploadedAvatarUrl("/default-avatar.svg");
      setAvatarPreview("/default-avatar.svg");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveError(null); setSaveSuccess(false);
    const token = localStorage.getItem("campusly_access_token") ?? "";
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    try {
      const payload: Record<string, any> = {
        name: fullName, username: username.trim(), bio: bio.trim(), phone: phone.trim(), student_id: studentId.trim(),
      };
      if (uploadedAvatarUrl) payload.avatar_url = uploadedAvatarUrl;
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save profile.");
      updateUser({ name: fullName, username: data.username ?? username, avatar: data.avatar_url ?? user?.avatar });
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
    if (newPassword !== confirmPassword) { setSaveError("New passwords do not match."); return; }
    setSaving(true); setSaveError(null); setSaveSuccess(false);
    const token = localStorage.getItem("campusly_access_token") ?? "";
    try {
      const res = await fetch(`${API}/users/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update password.");
      setSaveSuccess(true);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveError(null); setSaveSuccess(false);
    const token = localStorage.getItem("campusly_access_token") ?? "";
    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notify_email: notifyEmail, notify_push: notifyPush, notify_sms: notifySms }),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-indigo" />
      </div>
    );
  }

  const displayAvatar = avatarPreview ?? profile?.avatar_url ?? user?.avatar ?? "/default-avatar.svg";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* ── Profile Settings Tab ────────────────────────────────── */}
      {activeTab === "profile" && (
        <>
          <SectionTitle title="Your Profile" subtitle="Manage your public-facing profile information." />
          <Card>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              {/* Avatar upload zone */}
              <div className="flex items-center gap-6 pb-6 border-b border-[#E5E5E0] dark:border-[#26282E]">
                <div
                  onClick={() => setShowLightbox(true)}
                  className="relative flex-shrink-0 cursor-pointer group"
                  title="Click to view full photo"
                >
                  <img
                    src={displayAvatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#1e2028] shadow-sm hover:scale-105 transition-transform"
                  />
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {!avatarUploading && displayAvatar !== "/default-avatar.svg" && (
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-white dark:border-[#1e2028] shadow transition-transform z-10"
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
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand-indigo text-white hover:bg-brand-indigo-dark transition-all select-none disabled:opacity-50 shadow-btn"
                  >
                    Upload New
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                </div>

                {avatarError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {avatarError}
                  </p>
                )}
              </div>

              {/* Form grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DashInput label="First Name *" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <DashInput label="Last Name *" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                <DashInput label="Email" value={profile?.user?.email || ""} disabled hint="Your email is set at registration and cannot be changed here." />
                <DashInput label="Mobile Number *" placeholder="e.g. +251 912 345678" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <DashInput label="ID Number" placeholder="Student ID Card Value" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                <DashInput label="Username *" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <div className="md:col-span-2">
                  <DashTextarea label="Bio" placeholder="Describe yourself..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                </div>
              </div>

              {saveError && <ErrorAlert>{saveError}</ErrorAlert>}
              {saveSuccess && <SuccessAlert>Profile updated successfully.</SuccessAlert>}

              <div className="pt-2">
                <PrimaryBtn type="submit" disabled={saving} loading={saving}>
                  Save Changes
                </PrimaryBtn>
              </div>
            </form>
          </Card>
        </>
      )}

      {/* ── Password Tab ────────────────────────────────────────── */}
      {activeTab === "password" && (
        <>
          <SectionTitle title="Change Password" subtitle="Update your account password. Choose a strong one." />
          <Card>
            <form onSubmit={handleSavePassword} className="flex flex-col gap-5 max-w-md">
              <DashInput label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
              <DashInput label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <DashInput label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

              {saveError && <ErrorAlert>{saveError}</ErrorAlert>}
              {saveSuccess && <SuccessAlert>Password updated successfully.</SuccessAlert>}

              <div className="pt-2">
                <PrimaryBtn type="submit" disabled={saving} loading={saving}>
                  Save Password
                </PrimaryBtn>
              </div>
            </form>
          </Card>
        </>
      )}

      {/* ── Notifications Tab ───────────────────────────────────── */}
      {activeTab === "notifications" && (
        <>
          <SectionTitle title="Notification Preferences" subtitle="Choose how you want to receive updates and alerts." />
          <Card>
            <form onSubmit={handleSaveNotifications} className="flex flex-col gap-5">
              {[
                { label: "Email Notifications", desc: "Receive transaction invoices, listings updates, and review alerts via email.", checked: notifyEmail, onChange: setNotifyEmail },
                { label: "Push Notifications", desc: "Get live notifications directly inside the browser when a transaction finishes.", checked: notifyPush, onChange: setNotifyPush },
                { label: "SMS Notifications", desc: "Receive mobile SMS updates for security changes and wallet payouts.", checked: notifySms, onChange: setNotifySms },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-start gap-4 border border-[#E5E5E0] dark:border-[#26282E] p-4 rounded-xl cursor-pointer hover:border-brand-indigo transition-colors bg-[#FAFAF8] dark:bg-[#16181D] select-none"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="accent-brand-indigo mt-1 h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A18] dark:text-[#F0F0F0]">{item.label}</p>
                    <p className="text-xs text-[#6B6B66] mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}

              {saveError && <ErrorAlert>{saveError}</ErrorAlert>}
              {saveSuccess && <SuccessAlert>Preferences updated successfully.</SuccessAlert>}

              <div className="pt-2">
                <PrimaryBtn type="submit" disabled={saving} loading={saving}>
                  Save Preferences
                </PrimaryBtn>
              </div>
            </form>
          </Card>
        </>
      )}

      {/* ── Verification Tab ────────────────────────────────────── */}
      {activeTab === "verification" && (
        <>
          <SectionTitle title="Student Verification" subtitle="Verify your student identity to earn a blue badge on your profile." />
          <Card>
            {profile?.is_verified || verificationStatus === "verified" ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-6 rounded-xl flex items-start gap-4">
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
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl flex flex-col gap-4">
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
                  <div className="mt-2 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 bg-white dark:bg-[#16181D] max-w-xs">
                    <p className="text-xs text-[#6B6B66] mb-2 font-medium">Uploaded Student ID Card:</p>
                    <img src={studentIdCardUrl} alt="Student ID Document" className="w-full h-36 object-cover rounded-lg border border-[#E5E5E0]" />
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
                  <div className="bg-[#F5F5F0] dark:bg-[#1a1c22] border border-[#E5E5E0] dark:border-[#26282E] p-4 rounded-xl text-xs text-[#6B6B66] leading-relaxed flex gap-2.5">
                    <AlertCircle size={16} className="flex-shrink-0 text-brand-indigo mt-0.5" />
                    <span>
                      Upload your official university Student ID card image to request verification. Once reviewed by an admin, a blue tick badge will appear on your profile.
                    </span>
                  </div>
                )}

                <DashInput label="Student ID Number *" placeholder="e.g. ATR/8023/12" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#1A1A18] dark:text-[#F0F0F0]">Student ID Card Image *</span>
                  {studentIdCardUrl ? (
                    <div className="rounded-xl border border-[#E5E5E0] dark:border-[#26282E] p-3 bg-[#FAFAF8] dark:bg-[#16181D] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={studentIdCardUrl} alt="Uploaded Student ID" className="w-16 h-12 rounded-lg object-cover border border-[#E5E5E0]" />
                        <div className="text-xs">
                          <p className="font-semibold text-[#1A1A18] dark:text-[#F0F0F0]">ID Image Uploaded</p>
                          <p className="text-[#6B6B66] text-[11px]">Ready for submission</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => studentIdFileRef.current?.click()} className="text-xs text-brand-indigo font-medium hover:underline px-2 py-1">
                        Change
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => studentIdFileRef.current?.click()}
                      className="border-2 border-dashed border-[#E5E5E0] dark:border-[#26282E] p-6 rounded-xl hover:border-brand-indigo transition-colors cursor-pointer text-center bg-[#FAFAF8] dark:bg-[#16181D]"
                    >
                      {studentIdUploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Spinner size="md" />
                          <p className="text-xs text-[#6B6B66]">Uploading Student ID image...</p>
                        </div>
                      ) : (
                        <>
                          <Camera size={28} className="text-[#6B6B66] mx-auto mb-2" />
                          <p className="text-xs text-[#1A1A18] dark:text-[#F0F0F0] font-semibold">Click to select Student ID image</p>
                          <p className="text-[10px] text-[#6B6B66] mt-1">Supported formats: PNG, JPG, WEBP (Max 5MB)</p>
                        </>
                      )}
                    </div>
                  )}
                  <input ref={studentIdFileRef} type="file" accept="image/*" onChange={handleStudentIdSelect} className="hidden" />
                </div>

                {saveError && <ErrorAlert>{saveError}</ErrorAlert>}

                <div className="pt-2">
                  <PrimaryBtn type="submit" disabled={verifying || studentIdUploading || !studentIdCardUrl} loading={verifying}>
                    {verifying ? "Submitting Request..." : "Submit for Admin Review"}
                  </PrimaryBtn>
                </div>
              </form>
            )}
          </Card>
        </>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in cursor-zoom-out p-4"
        >
          <div className="relative max-w-xl w-full flex items-center justify-center">
            <button onClick={() => setShowLightbox(false)} className="absolute -top-10 right-0 text-white hover:text-gray-300 p-1 bg-white/10 rounded-full cursor-pointer" title="Close">
              <X size={20} />
            </button>
            <img
              src={displayAvatar}
              alt="Avatar Full Preview"
              className="max-h-[80vh] max-w-full rounded-2xl border border-white/10 shadow-2xl object-contain animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
