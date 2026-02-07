import { useState, useEffect } from "react";
import {
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Award,
  FileText,
  Calendar,
  CheckCircle,
  Navigation,
  GraduationCap,
  Building2
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { getData, ADMIN_API } from "../../api/client";
import type { TrainerApprovalDetailApi } from "../../api/types";

interface TrainerDetailModalProps {
  trainerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrainerDetailModal({ trainerId, isOpen, onClose }: TrainerDetailModalProps) {
  const [detail, setDetail] = useState<TrainerApprovalDetailApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainerId) {
      setDetail(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getData<TrainerApprovalDetailApi>(
      `${ADMIN_API}/trainers/approvals/${trainerId}?includeProfile=true`
    )
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load trainer details");
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  const name = detail?.profile?.fullName ?? detail?.username ?? detail?.email ?? "Trainer";
  const app = detail?.application;
  const profile = detail?.profile as { fullName?: string | null; gender?: string; address?: string | null; expertise?: string | null; experienceYears?: number | null; [key: string]: unknown } | null | undefined;
  const hasApplicationData = app || (detail?.courses && detail.courses.length > 0) || (detail?.skills && detail.skills.length > 0) || (detail?.documents && detail.documents.length > 0) || (detail?.availability && detail.availability.length > 0);
  const addresses = detail?.addresses ?? [];
  const baseLocations = detail?.baseLocations ?? [];
  const showMissingApplicationNotice = !app;
  const formatLatLng = (value: number | null | undefined) => (typeof value === "number" ? value.toFixed(4) : "—");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trainer application details">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-[#4D2B8C]">
          <RefreshCw size={20} className="animate-spin" />
          <span>Loading…</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {!loading && !error && detail && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#4D2B8C]/10 flex items-center justify-center">
              <User size={28} className="text-[#4D2B8C]" />
            </div>
            <div>
              <p className="font-bold text-[#4D2B8C] text-lg">{name}</p>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  detail.approvalStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : detail.approvalStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {detail.approvalStatus ?? "—"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#4D2B8C]/10 bg-[#F5F7FA] p-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <Mail size={18} className="text-[#4D2B8C]" />
              </div>
              <div>
                <p className="text-xs uppercase text-[#4D2B8C]/70 font-semibold tracking-wide">Email</p>
                <p className="text-sm font-medium text-[#4D2B8C] break-all">{detail.email ?? "—"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#4D2B8C]/10 bg-[#F5F7FA] p-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <Phone size={18} className="text-[#4D2B8C]" />
              </div>
              <div>
                <p className="text-xs uppercase text-[#4D2B8C]/70 font-semibold tracking-wide">Phone</p>
                <p className="text-sm font-medium text-[#4D2B8C] break-all">{detail.phone ?? "—"}</p>
              </div>
            </div>
          </div>

          {hasApplicationData && (
            <div className="border-t border-[#F5F7FA] pt-4">
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-3">Application (as entered)</p>
              <div className="space-y-3 text-sm text-[#4D2B8C]">
                {(app?.addressText ?? profile?.address) && (
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#4D2B8C] shrink-0 mt-0.5" />
                    <span>{app?.addressText ?? profile?.address}{app?.pincode ? `, ${app.pincode}` : ""}</span>
                  </div>
                )}
                {(app?.dateOfBirth || app?.applicationGender) && (
                  <div className="grid grid-cols-2 gap-4">
                    {app?.dateOfBirth && (
                      <p><span className="text-[#4D2B8C]/70">DOB:</span> {typeof app.dateOfBirth === "string" ? new Date(app.dateOfBirth).toLocaleDateString() : app.dateOfBirth}</p>
                    )}
                    {(app?.applicationGender ?? profile?.gender) && (
                      <p><span className="text-[#4D2B8C]/70">Gender:</span> {app?.applicationGender ?? profile?.gender}</p>
                    )}
                  </div>
                )}
                {(app?.education || app?.preferredCity) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {app?.education && (
                      <div className="rounded-2xl border border-[#4D2B8C]/10 bg-white shadow-sm p-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4D2B8C]/10 flex items-center justify-center">
                          <GraduationCap size={16} className="text-[#4D2B8C]" />
                        </div>
                        <div>
                          <p className="text-xs uppercase text-[#4D2B8C]/70 font-semibold tracking-wide">Education</p>
                          <p className="text-sm font-semibold text-[#4D2B8C]">{app.education}</p>
                        </div>
                      </div>
                    )}
                    {app?.preferredCity && (
                      <div className="rounded-2xl border border-[#4D2B8C]/10 bg-white shadow-sm p-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4D2B8C]/10 flex items-center justify-center">
                          <Building2 size={16} className="text-[#4D2B8C]" />
                        </div>
                        <div>
                          <p className="text-xs uppercase text-[#4D2B8C]/70 font-semibold tracking-wide">Preferred city</p>
                          <p className="text-sm font-semibold text-[#4D2B8C]">{app.preferredCity}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {(app?.applicationStage || app?.submittedAt) && (
                  <div className="grid grid-cols-2 gap-4">
                    {app?.applicationStage && (
                      <p><span className="text-[#4D2B8C]/70">Stage:</span> {app.applicationStage}</p>
                    )}
                    {app?.submittedAt && (
                      <p className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span className="text-[#4D2B8C]/70">Submitted:</span> {new Date(app.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                {(app?.reviewStatus || app?.reviewedBy || app?.reviewedAt || app?.reviewNotes) && (
                  <div className="rounded-lg bg-[#F5F7FA] p-3 space-y-1">
                    {app?.reviewStatus && <p><span className="text-[#4D2B8C]/70">Review:</span> {app.reviewStatus}</p>}
                    {app?.reviewedBy && <p><span className="text-[#4D2B8C]/70">Reviewed by:</span> {app.reviewedBy}</p>}
                    {app?.reviewedAt && <p><span className="text-[#4D2B8C]/70">Reviewed at:</span> {new Date(app.reviewedAt).toLocaleString()}</p>}
                    {app?.reviewNotes && <p><span className="text-[#4D2B8C]/70">Notes:</span> {app.reviewNotes}</p>}
                  </div>
                )}
                {(app?.createdAt || app?.updatedAt) && (
                  <div className="grid grid-cols-2 gap-4 text-xs text-[#4D2B8C]/80">
                    {app?.createdAt && <p><span className="text-[#4D2B8C]/70">Application created:</span> {new Date(app.createdAt as string).toLocaleString()}</p>}
                    {app?.updatedAt && <p><span className="text-[#4D2B8C]/70">Application updated:</span> {new Date(app.updatedAt as string).toLocaleString()}</p>}
                  </div>
                )}
                {(app?.consentInfoCorrect != null || app?.consentBackgroundVerification != null || app?.consentTravelToStudents != null) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[#4D2B8C]/70 text-xs">Consents:</span>
                    {app?.consentInfoCorrect != null && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#4D2B8C]/10">
                        <CheckCircle size={12} /> Info correct
                      </span>
                    )}
                    {app?.consentBackgroundVerification != null && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#4D2B8C]/10">
                        <CheckCircle size={12} /> Background check
                      </span>
                    )}
                    {app?.consentTravelToStudents != null && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#4D2B8C]/10">
                        <CheckCircle size={12} /> Travel to students
                      </span>
                    )}
                  </div>
                )}
                {(profile?.expertise || profile?.experienceYears != null) && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {profile?.expertise && <p><span className="text-[#4D2B8C]/70">Expertise:</span> {profile.expertise}</p>}
                    {profile?.experienceYears != null && <p><span className="text-[#4D2B8C]/70">Experience:</span> {profile.experienceYears} years</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {detail.courses && detail.courses.length > 0 && (
            <div className="border-t border-[#F5F7FA] pt-4">
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-3 flex items-center gap-1">
                <BookOpen size={14} /> Courses & capabilities
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {detail.courses.map((c, i) => {
                  const courseKey = c.id ?? c.courseId ?? c.courseCode ?? `course-${i}`;
                  const displayName = c.courseName ?? c.courseCode ?? `Course ${i + 1}`;
                  return (
                    <div
                      key={courseKey}
                      className="rounded-2xl border border-[#4D2B8C]/15 bg-white shadow-sm p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#4D2B8C]/10 text-[#4D2B8C]">
                            #{c.preferenceOrder ?? i + 1}
                          </span>
                          <p className="font-semibold text-[#4D2B8C]">{displayName}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#4D2B8C]/70">
                          {c.courseCode && <span>Code: {c.courseCode}</span>}
                          {c.courseCategory && (
                            <span className="px-2 py-0.5 rounded-full bg-[#4D2B8C]/5 text-[#4D2B8C] font-medium">
                              {c.courseCategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {detail.skills && detail.skills.length > 0 && (
            <div className="border-t border-[#F5F7FA] pt-4">
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-2 flex items-center gap-1">
                <Award size={14} /> Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {detail.skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#4D2B8C]/10 text-[#4D2B8C]"
                    title={s.skillCategory ? `${s.skillName ?? ""} (${s.skillCategory})` : undefined}
                  >
                    {s.skillName ?? `Skill ${i + 1}`}
                    {s.skillCategory && <span className="text-[#4D2B8C]/70"> · {s.skillCategory}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {detail.availability && detail.availability.length > 0 && (
            <div className="border-t border-[#F5F7FA] pt-4">
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-2">Availability slots</p>
              <ul className="text-sm text-[#4D2B8C] space-y-1">
                {detail.availability.slice(0, 12).map((a, i) => (
                  <li key={i}>
                    {a.slotStart ?? ""} – {a.slotEnd ?? ""}
                    {a.employmentType ? ` (${a.employmentType})` : ""}
                  </li>
                ))}
                {detail.availability.length > 12 && (
                  <li className="text-[#4D2B8C]/70">+{detail.availability.length - 12} more</li>
                )}
              </ul>
            </div>
          )}

          {detail.documents && detail.documents.length > 0 && (
            <div className="border-t border-[#F5F7FA] pt-4">
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-2 flex items-center gap-1">
                <FileText size={14} /> Documents
              </p>
              <ul className="text-sm text-[#4D2B8C] space-y-2">
                {detail.documents.map((d, i) => (
                  <li key={i}>
                    <span className="font-medium">{d.documentType ?? "Document"}</span>
                    {d.fileName && <span className="text-[#4D2B8C]/80"> – {d.fileName}</span>}
                    {d.fileUrl ? (
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#4D2B8C] underline">View</a>
                    ) : (
                      <span className="ml-2 text-[#4D2B8C]/60">—</span>
                    )}
                    {d.verificationStatus && (
                      <span className="ml-2 text-xs text-[#4D2B8C]/70">({d.verificationStatus})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showMissingApplicationNotice && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              <p className="font-medium">No application form record found for this trainer.</p>
              <p className="mt-1 text-amber-800/90 text-xs">
                Application data is not deleted when a trainer is approved. Common causes:
              </p>
              <ul className="mt-1.5 text-amber-800/90 text-xs list-disc list-inside space-y-0.5">
                <li>Admin and trainer-auth services use different databases (same DATABASE_URL required).</li>
                <li>Trainer was approved before the application system or without submitting the form.</li>
              </ul>
              <p className="mt-2 text-amber-800/90 text-xs">
                We&apos;re still showing profile, addresses, availability, documents, courses, and skills below if they exist.
              </p>
              <p className="mt-2 text-amber-800/80 text-xs">
                Trainer ID: <code className="bg-amber-100/80 px-1 rounded">{detail.id}</code> — use this to check <code className="bg-amber-100/80 px-1 rounded">trainer_applications</code> in the DB that admin-service uses.
              </p>
            </div>
          )}

          {addresses.length > 0 && (
            <div className="border-t border-[#F5F7FA] pt-4">
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-2 flex items-center gap-1">
                <MapPin size={14} /> Addresses on file
              </p>
              <div className="space-y-2">
                {addresses.map((addr, idx) => (
                  <div key={`${addr.id ?? idx}`} className="rounded-xl border border-[#4D2B8C]/10 bg-[#F5F7FA] p-3 text-sm text-[#4D2B8C] space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 text-[#4D2B8C]" />
                        <div>
                          <p className="font-medium">{addr.addressText ?? "—"}</p>
                          <p className="text-xs text-[#4D2B8C]/70">
                            {[addr.district, addr.state, addr.country ?? "India"].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {addr.isPrimary && <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#4D2B8C]/10 text-[#4D2B8C] font-semibold">Primary</span>}
                        {addr.isVerified && <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-semibold">Verified</span>}
                      </div>
                    </div>
                    <div className="text-xs flex flex-wrap gap-4 text-[#4D2B8C]/80">
                      <span>Pincode: {addr.pincode ?? "—"}</span>
                      <span>City ID: {addr.cityId ?? "—"}</span>
                    </div>
                    {addr.verifiedAt && (
                      <p className="text-[11px] text-[#4D2B8C]/60">Verified at: {new Date(addr.verifiedAt).toLocaleString()}</p>
                    )}
                    {addr.verificationNotes && (
                      <p className="text-[11px] text-[#4D2B8C]/70">Notes: {addr.verificationNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {baseLocations.length > 0 && (
            <div className="border-t border-[#F5F7FA] pt-4">
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-2 flex items-center gap-1">
                <Navigation size={14} /> Operational base locations
              </p>
              <div className="space-y-2 text-sm text-[#4D2B8C]">
                {baseLocations.map((loc, idx) => (
                  <div key={`${loc.id ?? idx}`} className="rounded-xl border border-[#4D2B8C]/10 p-3 bg-white shadow-sm space-y-1">
                    <p className="font-semibold">
                      Lat {formatLatLng(loc.latitude)} / Lng {formatLatLng(loc.longitude)}
                    </p>
                    <div className="text-xs text-[#4D2B8C]/70 flex flex-wrap gap-3">
                      <span>Source: {loc.source ?? "—"}</span>
                      {loc.confidenceScore != null && (
                        <span>Confidence: {(Number(loc.confidenceScore) * 100).toFixed(0)}%</span>
                      )}
                      {loc.addressId && <span>Address Ref: {loc.addressId}</span>}
                    </div>
                    {loc.geocodedAt && (
                      <p className="text-[11px] text-[#4D2B8C]/60">Geocoded: {new Date(loc.geocodedAt).toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-[#4D2B8C]/60 pt-2 border-t border-[#F5F7FA]">
            Created: {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}
          </p>
        </div>
      )}
    </Modal>
  );
}
