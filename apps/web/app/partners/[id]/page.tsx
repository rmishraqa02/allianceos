"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";

type Partner = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;

  partnerTypeId?: string | null;
  tierId?: string | null;
  statusId?: string | null;
  industryId?: string | null;
  regionId?: string | null;

  status?: string | null;

  capabilityIds?: string[];

  createdAt?: string;
  updatedAt?: string;
};

type SettingItem = {
  id: string;
  name: string;
  label?: string;
  value?: string;
};

type SettingsData = {
  partnerTypes: SettingItem[];
  tiers: SettingItem[];
  statuses: SettingItem[];
  industries: SettingItem[];
  regions: SettingItem[];
  capabilities: SettingItem[];
};

function getSettingName(
  items: SettingItem[],
  id?: string | null,
): string {
  if (!id) {
    return "—";
  }

  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return "—";
  }

  return item.name || item.label || item.value || "—";
}

function getInitials(name?: string): string {
  if (!name) {
    return "P";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "P";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "active") {
    return "active";
  }

  if (normalizedStatus === "onboarding") {
    return "onboarding";
  }

  if (normalizedStatus === "suspended") {
    return "suspended";
  }

  if (normalizedStatus === "inactive") {
    return "inactive";
  }

  if (normalizedStatus === "pending") {
    return "pending";
  }

  return "";
}

function getTierClass(tier: string): string {
  return tier
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function PartnerDetailsPage() {
  const params = useParams();

  const partnerId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [partner, setPartner] =
    useState<Partner | null>(null);

  const [settings, setSettings] =
    useState<SettingsData>({
      partnerTypes: [],
      tiers: [],
      statuses: [],
      industries: [],
      regions: [],
      capabilities: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!partnerId) {
      setLoading(false);
      setError("Partner ID is missing.");
      return;
    }

    async function loadPartner() {
      try {
        setLoading(true);
        setError("");

        const [
          partnerResponse,
          partnerTypes,
          tiers,
          statuses,
          industries,
          regions,
          capabilities,
        ] = await Promise.all([
          apiRequest<Partner>(
            `/partners/${partnerId}`,
          ),

          apiRequest<SettingItem[]>(
            "/settings/partner-types",
          ),

          apiRequest<SettingItem[]>(
            "/settings/partner-tiers",
          ),

          apiRequest<SettingItem[]>(
            "/settings/partner-statuses",
          ),

          apiRequest<SettingItem[]>(
            "/settings/industries",
          ),

          apiRequest<SettingItem[]>(
            "/settings/regions",
          ),

          apiRequest<SettingItem[]>(
            "/settings/capabilities",
          ),
        ]);

        setPartner(partnerResponse);

        setSettings({
          partnerTypes: Array.isArray(partnerTypes)
            ? partnerTypes
            : [],

          tiers: Array.isArray(tiers)
            ? tiers
            : [],

          statuses: Array.isArray(statuses)
            ? statuses
            : [],

          industries: Array.isArray(industries)
            ? industries
            : [],

          regions: Array.isArray(regions)
            ? regions
            : [],

          capabilities: Array.isArray(capabilities)
            ? capabilities
            : [],
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load partner details.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPartner();
  }, [partnerId]);

  if (loading) {
    return (
      <div className="partner-details-page">
        <div className="partner-details-loading">
          <div className="partner-details-loading-spinner" />

          <span>
            Loading partner details...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="partner-details-page">
        <div className="partner-details-error">
          <div className="partner-details-error-icon">
            !
          </div>

          <h2 className="partner-details-error-title">
            Unable to load partner
          </h2>

          <p className="partner-details-error-description">
            {error}
          </p>

          <Link
            href="/partners"
            className="partner-details-back-button"
          >
            ← Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="partner-details-page">
        <div className="partner-details-empty">
          <div className="partner-details-empty-title">
            Partner not found
          </div>

          <p className="partner-details-empty-description">
            The requested partner could not be found.
          </p>

          <Link
            href="/partners"
            className="partner-details-back-button"
          >
            Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  const partnerType = getSettingName(
    settings.partnerTypes,
    partner.partnerTypeId,
  );

  const tier = getSettingName(
    settings.tiers,
    partner.tierId,
  );

  const industry = getSettingName(
    settings.industries,
    partner.industryId,
  );

  const region = getSettingName(
    settings.regions,
    partner.regionId,
  );

  const configuredStatus = getSettingName(
    settings.statuses,
    partner.statusId,
  );

  const status =
    partner.status || configuredStatus;

  const statusClass =
    getStatusClass(status);

  const tierClass =
    getTierClass(tier);

  const capabilities =
    partner.capabilityIds
      ?.map((id) => {
        const capability =
          settings.capabilities.find(
            (item) => item.id === id,
          );

        if (!capability) {
          return null;
        }

        return (
          capability.name ||
          capability.label ||
          capability.value ||
          null
        );
      })
      .filter(
        (name): name is string =>
          Boolean(name),
      ) || [];

  return (
    <div className="partner-details-page">
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="partner-details-breadcrumb">
        <Link href="/partners">
          Partners
        </Link>

        <span>/</span>

        <span>{partner.name}</span>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="partner-details-header">
        <div className="partner-details-header-main">
          <div className="partner-details-avatar">
            {getInitials(partner.name)}
          </div>

          <div className="partner-details-title-area">
            <h1 className="partner-details-title">
              {partner.name}
            </h1>

            <p className="partner-details-subtitle">
              Partner profile, capabilities and
              relationship information.
            </p>

            <div className="partner-details-badges">
              <span className="partner-details-badge">
                {partnerType}
              </span>

              <span
                className={`partner-details-badge ${tierClass}`}
              >
                {tier}
              </span>

              <span
                className={`partner-details-badge status-${statusClass}`}
              >
                <span className="partners-status-dot" />

                {status || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="partner-details-header-actions">
          <Link
            href="/partners"
            className="partner-details-back-button"
          >
            ← Back
          </Link>

          <Link
            href={`/partners?edit=${partner.id}`}
            className="partner-details-edit-button"
          >
            ✎ Edit Partner
          </Link>
        </div>
      </div>

      {/* =====================================================
          OVERVIEW + CAPABILITIES
      ===================================================== */}

      <div className="partner-details-grid">
        {/* OVERVIEW */}

        <section className="partner-details-card">
          <div className="partner-details-card-header">
            <div>
              <h2 className="partner-details-card-title">
                Overview
              </h2>

              <p className="partner-details-card-subtitle">
                Core information about this partner.
              </p>
            </div>
          </div>

          <div className="partner-details-card-body">
            <div className="partner-details-overview-grid">
              <div className="partner-details-field">
                <span className="partner-details-field-label">
                  Partner Type
                </span>

                <strong className="partner-details-field-value">
                  {partnerType}
                </strong>
              </div>

              <div className="partner-details-field">
                <span className="partner-details-field-label">
                  Tier
                </span>

                <strong className="partner-details-field-value">
                  {tier}
                </strong>
              </div>

              <div className="partner-details-field">
                <span className="partner-details-field-label">
                  Industry
                </span>

                <strong className="partner-details-field-value">
                  {industry}
                </strong>
              </div>

              <div className="partner-details-field">
                <span className="partner-details-field-label">
                  Region
                </span>

                <strong className="partner-details-field-value">
                  {region}
                </strong>
              </div>

              <div className="partner-details-field full">
                <span className="partner-details-field-label">
                  Status
                </span>

                <strong className="partner-details-field-value">
                  {status || "—"}
                </strong>
              </div>

              <div className="partner-details-field full">
                <span className="partner-details-field-label">
                  Website
                </span>

                {partner.website ? (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="partner-details-website"
                  >
                    {partner.website}
                    <span>↗</span>
                  </a>
                ) : (
                  <strong className="partner-details-field-value">
                    —
                  </strong>
                )}
              </div>

              <div className="partner-details-field full">
                <span className="partner-details-field-label">
                  Description
                </span>

                <p className="partner-details-description">
                  {partner.description ||
                    "No description available."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}

        <section className="partner-details-card">
          <div className="partner-details-card-header">
            <div>
              <h2 className="partner-details-card-title">
                Capabilities
              </h2>

              <p className="partner-details-card-subtitle">
                Technology and service capabilities.
              </p>
            </div>

            <span className="partner-details-badge">
              {capabilities.length}
            </span>
          </div>

          <div className="partner-details-card-body">
            {capabilities.length === 0 ? (
              <div className="partner-details-empty">
                <div className="partner-details-empty-title">
                  No capabilities
                </div>

                <p className="partner-details-empty-description">
                  No capabilities have been configured
                  for this partner.
                </p>
              </div>
            ) : (
              <div className="partner-details-capabilities">
                {capabilities.map(
                  (capability) => (
                    <span
                      key={capability}
                      className="partner-details-capability"
                    >
                      {capability}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          PARTNER METRICS
      ===================================================== */}

      <section className="partner-details-card">
        <div className="partner-details-card-header">
          <div>
            <h2 className="partner-details-card-title">
              Partner Metrics
            </h2>

            <p className="partner-details-card-subtitle">
              Commercial performance and relationship
              indicators.
            </p>
          </div>
        </div>

        <div className="partner-details-card-body">
          <div className="partner-details-metrics">
            <div className="partner-details-metric-card">
              <span className="partner-details-metric-label">
                Active Deals
              </span>

              <strong className="partner-details-metric-value">
                0
              </strong>

              <span className="partner-details-metric-meta">
                Coming soon
              </span>
            </div>

            <div className="partner-details-metric-card">
              <span className="partner-details-metric-label">
                Customers
              </span>

              <strong className="partner-details-metric-value">
                0
              </strong>

              <span className="partner-details-metric-meta">
                Coming soon
              </span>
            </div>

            <div className="partner-details-metric-card">
              <span className="partner-details-metric-label">
                Pipeline
              </span>

              <strong className="partner-details-metric-value">
                ₹0
              </strong>

              <span className="partner-details-metric-meta">
                Coming soon
              </span>
            </div>

            <div className="partner-details-metric-card">
              <span className="partner-details-metric-label">
                Win Rate
              </span>

              <strong className="partner-details-metric-value">
                —
              </strong>

              <span className="partner-details-metric-meta">
                Coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIVITY
      ===================================================== */}

      <section className="partner-details-card">
        <div className="partner-details-card-header">
          <div>
            <h2 className="partner-details-card-title">
              Activity
            </h2>

            <p className="partner-details-card-subtitle">
              Recent activity and partner lifecycle events.
            </p>
          </div>
        </div>

        <div className="partner-details-card-body">
          <div className="partner-details-timeline">
            <div className="partner-details-timeline-item">
              <div className="partner-details-timeline-marker" />

              <div className="partner-details-timeline-content">
                <div className="partner-details-timeline-title">
                  Partner profile created
                </div>

                <div className="partner-details-timeline-description">
                  Partner profile was created in the
                  AllianceOS workspace.
                </div>

                <div className="partner-details-timeline-date">
                  {formatDate(partner.createdAt)}
                </div>
              </div>
            </div>

            <div className="partner-details-timeline-item">
              <div className="partner-details-timeline-marker" />

              <div className="partner-details-timeline-content">
                <div className="partner-details-timeline-title">
                  Partner profile updated
                </div>

                <div className="partner-details-timeline-description">
                  Partner information was last updated.
                </div>

                <div className="partner-details-timeline-date">
                  {formatDate(partner.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PARTNER SUMMARY
      ===================================================== */}

      <section className="partner-details-card">
        <div className="partner-details-card-header">
          <div>
            <h2 className="partner-details-card-title">
              Partner Summary
            </h2>

            <p className="partner-details-card-subtitle">
              Key partner configuration details.
            </p>
          </div>
        </div>

        <div className="partner-details-card-body">
          <div className="partner-details-summary-list">
            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Partner ID
              </span>

              <span className="partner-details-summary-value">
                {partner.id}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Partner Type
              </span>

              <span className="partner-details-summary-value">
                {partnerType}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Tier
              </span>

              <span className="partner-details-summary-value">
                {tier}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Status
              </span>

              <span className="partner-details-summary-value">
                {status || "—"}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Industry
              </span>

              <span className="partner-details-summary-value">
                {industry}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Region
              </span>

              <span className="partner-details-summary-value">
                {region}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Capabilities
              </span>

              <span className="partner-details-summary-value">
                {capabilities.length}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Created
              </span>

              <span className="partner-details-summary-value">
                {formatDate(partner.createdAt)}
              </span>
            </div>

            <div className="partner-details-summary-row">
              <span className="partner-details-summary-label">
                Last Updated
              </span>

              <span className="partner-details-summary-value">
                {formatDate(partner.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}