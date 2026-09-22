"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";

type ConfigItem = {
  id: string;
  name: string;
};

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

  capabilityIds?: string[];

  partnerType?: ConfigItem | null;
  tier?: ConfigItem | null;
  statusConfig?: ConfigItem | null;
  industry?: ConfigItem | null;
  region?: ConfigItem | null;

  status?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

type PartnerForm = {
  name: string;
  description: string;
  website: string;
  partnerTypeId: string;
  tierId: string;
  statusId: string;
  industryId: string;
  regionId: string;
  capabilityIds: string[];
};

const EMPTY_FORM: PartnerForm = {
  name: "",
  description: "",
  website: "",
  partnerTypeId: "",
  tierId: "",
  statusId: "",
  industryId: "",
  regionId: "",
  capabilityIds: [],
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);

  const [partnerTypes, setPartnerTypes] = useState<ConfigItem[]>([]);
  const [partnerTiers, setPartnerTiers] = useState<ConfigItem[]>([]);
  const [partnerStatuses, setPartnerStatuses] = useState<ConfigItem[]>([]);
  const [industries, setIndustries] = useState<ConfigItem[]>([]);
  const [regions, setRegions] = useState<ConfigItem[]>([]);
  const [capabilities, setCapabilities] = useState<ConfigItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingPartner, setEditingPartner] =
    useState<Partner | null>(null);

  const [deletingPartner, setDeletingPartner] =
    useState<Partner | null>(null);

  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM);

  const loadPartners = useCallback(async () => {
    try {
      setPageError("");

      const data = await apiRequest<Partner[]>("/partners");

      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load partners.",
      );
    }
  }, []);

  const loadConfiguration = useCallback(async () => {
    try {
      const [
        types,
        tiers,
        statuses,
        industryData,
        regionData,
        capabilityData,
      ] = await Promise.all([
        apiRequest<ConfigItem[]>("/settings/partner-types"),
        apiRequest<ConfigItem[]>("/settings/partner-tiers"),
        apiRequest<ConfigItem[]>("/settings/partner-statuses"),
        apiRequest<ConfigItem[]>("/settings/industries"),
        apiRequest<ConfigItem[]>("/settings/regions"),
        apiRequest<ConfigItem[]>("/settings/capabilities"),
      ]);

      setPartnerTypes(Array.isArray(types) ? types : []);
      setPartnerTiers(Array.isArray(tiers) ? tiers : []);
      setPartnerStatuses(Array.isArray(statuses) ? statuses : []);
      setIndustries(Array.isArray(industryData) ? industryData : []);
      setRegions(Array.isArray(regionData) ? regionData : []);
      setCapabilities(
        Array.isArray(capabilityData) ? capabilityData : [],
      );
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load partner configuration.",
      );
    }
  }, []);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      await Promise.all([
        loadPartners(),
        loadConfiguration(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadPartners, loadConfiguration]);

  useEffect(() => {
    let cancelled = false;

    async function initializePage() {
      setLoading(true);
      setPageError("");

      try {
        await Promise.all([
          loadPartners(),
          loadConfiguration(),
        ]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializePage();

    return () => {
      cancelled = true;
    };
  }, [loadPartners, loadConfiguration]);

  function clearFilters() {
    setSearch("");
    setTypeFilter("");
    setTierFilter("");
    setStatusFilter("");
    setIndustryFilter("");
    setRegionFilter("");
  }

  function openAddModal() {
    setEditingPartner(null);

    setForm({
      ...EMPTY_FORM,
      capabilityIds: [],
    });

    setFormError("");
    setShowPartnerModal(true);
  }

  function openEditModal(partner: Partner) {
    setEditingPartner(partner);

    setForm({
      name: partner.name || "",
      description: partner.description || "",
      website: partner.website || "",
      partnerTypeId: partner.partnerTypeId || "",
      tierId: partner.tierId || "",
      statusId: partner.statusId || "",
      industryId: partner.industryId || "",
      regionId: partner.regionId || "",
      capabilityIds: partner.capabilityIds || [],
    });

    setFormError("");
    setShowPartnerModal(true);
  }

  function closePartnerModal() {
    if (saving) {
      return;
    }

    setShowPartnerModal(false);
    setEditingPartner(null);

    setForm({
      ...EMPTY_FORM,
      capabilityIds: [],
    });

    setFormError("");
  }

  function openDeleteModal(partner: Partner) {
    setDeletingPartner(partner);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeletingPartner(null);
  }

  function updateField<K extends keyof PartnerForm>(
    field: K,
    value: PartnerForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleCapability(capabilityId: string) {
    setForm((current) => {
      const exists =
        current.capabilityIds.includes(capabilityId);

      return {
        ...current,
        capabilityIds: exists
          ? current.capabilityIds.filter(
              (id) => id !== capabilityId,
            )
          : [...current.capabilityIds, capabilityId],
      };
    });
  }

  function validateForm() {
    if (!form.name.trim()) {
      setFormError("Partner name is required.");
      return false;
    }

    if (form.website.trim()) {
      try {
        const url = new URL(form.website.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        setFormError(
          "Website must be a valid HTTP/HTTPS URL, for example https://example.com",
        );
        return false;
      }
    }

    return true;
  }

  async function savePartner() {
    setFormError("");
    setPageError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        partnerTypeId: form.partnerTypeId || undefined,
        tierId: form.tierId || undefined,
        statusId: form.statusId || undefined,
        industryId: form.industryId || undefined,
        regionId: form.regionId || undefined,
        capabilityIds: form.capabilityIds,
      };

      if (editingPartner) {
        await apiRequest<Partner>(
          `/partners/${editingPartner.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

        setSuccessMessage(
          "Partner updated successfully.",
        );
      } else {
        await apiRequest<Partner>("/partners", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccessMessage(
          "Partner created successfully.",
        );
      }

      setShowPartnerModal(false);
      setEditingPartner(null);

      setForm({
        ...EMPTY_FORM,
        capabilityIds: [],
      });

      await loadPartners();

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save partner.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePartner() {
    if (!deletingPartner) {
      return;
    }

    setDeleting(true);
    setPageError("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/partners/${deletingPartner.id}`,
        {
          method: "DELETE",
        },
      );

      setShowDeleteModal(false);
      setDeletingPartner(null);

      setSuccessMessage(
        "Partner deleted successfully.",
      );

      await loadPartners();

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to delete partner.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const filteredPartners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return partners.filter((partner) => {
      const partnerTypeId =
        partner.partnerTypeId || "";

      const tierId =
        partner.tierId || "";

      const statusId =
        partner.statusId || "";

      const industryId =
        partner.industryId || "";

      const regionId =
        partner.regionId || "";

      const partnerTypeName =
        partner.partnerType?.name ||
        partnerTypes.find(
          (item) => item.id === partner.partnerTypeId,
        )?.name ||
        "";

      const tierName =
        partner.tier?.name ||
        partnerTiers.find(
          (item) => item.id === partner.tierId,
        )?.name ||
        "";

      const statusName =
        partner.statusConfig?.name ||
        partnerStatuses.find(
          (item) => item.id === partner.statusId,
        )?.name ||
        partner.status ||
        "";

      const industryName =
        partner.industry?.name ||
        industries.find(
          (item) => item.id === partner.industryId,
        )?.name ||
        "";

      const regionName =
        partner.region?.name ||
        regions.find(
          (item) => item.id === partner.regionId,
        )?.name ||
        "";

      const matchesSearch =
        !query ||
        partner.name.toLowerCase().includes(query) ||
        (partner.description || "")
          .toLowerCase()
          .includes(query) ||
        (partner.website || "")
          .toLowerCase()
          .includes(query) ||
        partnerTypeName.toLowerCase().includes(query) ||
        tierName.toLowerCase().includes(query) ||
        statusName.toLowerCase().includes(query) ||
        industryName.toLowerCase().includes(query) ||
        regionName.toLowerCase().includes(query);

      const matchesType =
        !typeFilter ||
        partnerTypeId === typeFilter;

      const matchesTier =
        !tierFilter ||
        tierId === tierFilter;

      const matchesStatus =
        !statusFilter ||
        statusId === statusFilter;

      const matchesIndustry =
        !industryFilter ||
        industryId === industryFilter;

      const matchesRegion =
        !regionFilter ||
        regionId === regionFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesTier &&
        matchesStatus &&
        matchesIndustry &&
        matchesRegion
      );
    });
  }, [
    partners,
    partnerTypes,
    partnerTiers,
    partnerStatuses,
    industries,
    regions,
    search,
    typeFilter,
    tierFilter,
    statusFilter,
    industryFilter,
    regionFilter,
  ]);

  const activeFilterCount = [
    typeFilter,
    tierFilter,
    statusFilter,
    industryFilter,
    regionFilter,
  ].filter(Boolean).length;

  function getInitials(name: string) {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return "P";
    }

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  function getPartnerTypeName(partner: Partner) {
    return (
      partner.partnerType?.name ||
      partnerTypes.find(
        (item) => item.id === partner.partnerTypeId,
      )?.name ||
      "—"
    );
  }

  function getTierName(partner: Partner) {
    return (
      partner.tier?.name ||
      partnerTiers.find(
        (item) => item.id === partner.tierId,
      )?.name ||
      "—"
    );
  }

  function getStatusName(partner: Partner) {
    return (
      partner.statusConfig?.name ||
      partnerStatuses.find(
        (item) => item.id === partner.statusId,
      )?.name ||
      partner.status ||
      "—"
    );
  }

  function getIndustryName(partner: Partner) {
    return (
      partner.industry?.name ||
      industries.find(
        (item) => item.id === partner.industryId,
      )?.name ||
      "—"
    );
  }

  function getRegionName(partner: Partner) {
    return (
      partner.region?.name ||
      regions.find(
        (item) => item.id === partner.regionId,
      )?.name ||
      "—"
    );
  }

  function getCapabilityNames(partner: Partner) {
    if (!partner.capabilityIds?.length) {
      return [];
    }

    return partner.capabilityIds
      .map(
        (id) =>
          capabilities.find(
            (capability) =>
              capability.id === id,
          )?.name,
      )
      .filter(
        (name): name is string =>
          Boolean(name),
      );
  }

  const strategicCount = partners.filter(
    (partner) =>
      getTierName(partner).toLowerCase() ===
      "strategic",
  ).length;

  const activeCount = partners.filter(
    (partner) =>
      getStatusName(partner).toLowerCase() ===
      "active",
  ).length;

  const technologyCount = partners.filter(
    (partner) =>
      getPartnerTypeName(partner).toLowerCase() ===
      "technology partner",
  ).length;

  if (loading) {
    return (
      <div className="partners-page">
        <div className="partners-page-header">
          <div>
            <div className="partners-breadcrumb">
              Workspace / Partners
            </div>

            <h1>Partners</h1>

            <p>
              Manage your partner ecosystem,
              capabilities and relationships.
            </p>
          </div>
        </div>

        <div className="partners-loading">
          <div className="partners-loading-spinner" />

          <span>
            Loading partner directory...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="partners-page">
        <div className="partners-page-header">
          <div>
            <div className="partners-breadcrumb">
              Workspace / Partners
            </div>

            <h1>Partners</h1>

            <p>
              Manage your partner ecosystem,
              capabilities and relationships.
            </p>
          </div>

          <button
            type="button"
            className="partners-primary-button"
            onClick={openAddModal}
          >
            <span>＋</span>
            Add Partner
          </button>
        </div>

        {successMessage && (
          <div className="partners-success-message">
            <span>✓</span>

            <span>{successMessage}</span>
          </div>
        )}

        {pageError && (
          <div className="partners-error-message">
            <span>!</span>

            <span>{pageError}</span>

            <button
              type="button"
              onClick={() => {
                void loadPage();
              }}
            >
              Retry
            </button>
          </div>
        )}

        <section className="partners-kpi-grid">
          <div className="partners-kpi-card">
            <div className="partners-kpi-icon">
              ♧
            </div>

            <div className="partners-kpi-content">
              <span>Total Partners</span>

              <strong>{partners.length}</strong>

              <small>
                Across your ecosystem
              </small>
            </div>
          </div>

          <div className="partners-kpi-card">
            <div className="partners-kpi-icon">
              ✓
            </div>

            <div className="partners-kpi-content">
              <span>Active Partners</span>

              <strong>{activeCount}</strong>

              <small>
                Currently active
              </small>
            </div>
          </div>

          <div className="partners-kpi-card">
            <div className="partners-kpi-icon">
              ★
            </div>

            <div className="partners-kpi-content">
              <span>Strategic Partners</span>

              <strong>{strategicCount}</strong>

              <small>
                Strategic tier
              </small>
            </div>
          </div>

          <div className="partners-kpi-card">
            <div className="partners-kpi-icon">
              ◈
            </div>

            <div className="partners-kpi-content">
              <span>Technology Partners</span>

              <strong>{technologyCount}</strong>

              <small>
                Technology ecosystem
              </small>
            </div>
          </div>
        </section>

        <section className="partners-filter-card">
          <div className="partners-filter-header">
            <div>
              <strong>
                Partner Directory
              </strong>

              <span>
                {filteredPartners.length} of{" "}
                {partners.length} partners
              </span>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="partners-clear-filters"
                onClick={clearFilters}
              >
                Clear filters (
                {activeFilterCount})
              </button>
            )}
          </div>

          <div className="partners-filter-row">
            <div className="partners-search-wrapper">
              <span className="partners-search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search partners..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                aria-label="Search partners"
              />

              {search && (
                <button
                  type="button"
                  className="partners-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              aria-label="Filter by partner type"
            >
              <option value="">
                All Types
              </option>

              {partnerTypes.map((type) => (
                <option
                  key={type.id}
                  value={type.id}
                >
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={tierFilter}
              onChange={(event) =>
                setTierFilter(event.target.value)
              }
              aria-label="Filter by partner tier"
            >
              <option value="">
                All Tiers
              </option>

              {partnerTiers.map((tier) => (
                <option
                  key={tier.id}
                  value={tier.id}
                >
                  {tier.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter by partner status"
            >
              <option value="">
                All Statuses
              </option>

              {partnerStatuses.map((status) => (
                <option
                  key={status.id}
                  value={status.id}
                >
                  {status.name}
                </option>
              ))}
            </select>

            <select
              value={industryFilter}
              onChange={(event) =>
                setIndustryFilter(event.target.value)
              }
              aria-label="Filter by industry"
            >
              <option value="">
                All Industries
              </option>

              {industries.map((industry) => (
                <option
                  key={industry.id}
                  value={industry.id}
                >
                  {industry.name}
                </option>
              ))}
            </select>

            <select
              value={regionFilter}
              onChange={(event) =>
                setRegionFilter(event.target.value)
              }
              aria-label="Filter by region"
            >
              <option value="">
                All Regions
              </option>

              {regions.map((region) => (
                <option
                  key={region.id}
                  value={region.id}
                >
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="partners-directory-card">
          <div className="partners-directory-header">
            <div>
              <h2>Partner Directory</h2>

              <p>
                View and manage all partners
                in your organization.
              </p>
            </div>

            <button
              type="button"
              className="partners-refresh-button"
              onClick={() => {
                void loadPage();
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {filteredPartners.length === 0 ? (
            <div className="partners-empty-state">
              <div className="partners-empty-icon">
                ♧
              </div>

              <h3>
                {partners.length === 0
                  ? "No partners yet"
                  : "No partners found"}
              </h3>

              <p>
                {partners.length === 0
                  ? "Add your first partner to start building your ecosystem."
                  : "Try changing your search or filters."}
              </p>

              {partners.length === 0 ? (
                <button
                  type="button"
                  className="partners-primary-button"
                  onClick={openAddModal}
                >
                  <span>＋</span>
                  Add Partner
                </button>
              ) : (
                <button
                  type="button"
                  className="partners-secondary-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="partners-table-wrapper">
              <table className="partners-table">
                <thead>
                  <tr>
                    <th>PARTNER</th>
                    <th>TYPE</th>
                    <th>TIER</th>
                    <th>STATUS</th>
                    <th>INDUSTRY</th>
                    <th>REGION</th>
                    <th>CAPABILITIES</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPartners.map((partner) => {
                    const capabilityNames =
                      getCapabilityNames(partner);

                    const statusName =
                      getStatusName(partner);

                    const normalizedStatus =
                      statusName.toLowerCase();

                    const statusClass =
                      normalizedStatus === "active"
                        ? "active"
                        : normalizedStatus ===
                            "onboarding"
                          ? "onboarding"
                          : normalizedStatus ===
                              "suspended"
                            ? "suspended"
                            : "";

                    const tierClass =
                      getTierName(partner)
                        .toLowerCase()
                        .replace(/\s+/g, "-");

                    return (
                      <tr key={partner.id}>
                        <td>
                          <div className="partner-cell">
                            <div className="partner-avatar">
                              {getInitials(
                                partner.name,
                              )}
                            </div>

                            <div className="partner-info">
                              <strong>
                                {partner.name}
                              </strong>

                              {partner.website ? (
                                <a
                                  href={partner.website}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {partner.website.replace(
                                    /^https?:\/\//,
                                    "",
                                  )}
                                </a>
                              ) : (
                                <span>
                                  {partner.description ||
                                    "No description"}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="partners-table-text">
                            {getPartnerTypeName(
                              partner,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`partners-tier-badge ${tierClass}`}
                          >
                            {getTierName(partner)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`partners-status-badge ${statusClass}`}
                          >
                            <span className="partners-status-dot" />

                            {statusName}
                          </span>
                        </td>

                        <td>
                          <span className="partners-table-text">
                            {getIndustryName(
                              partner,
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="partners-table-text">
                            {getRegionName(partner)}
                          </span>
                        </td>

                        <td>
                          <div className="partners-capability-list">
                            {capabilityNames.length ===
                            0 ? (
                              <span className="partners-muted">
                                —
                              </span>
                            ) : (
                              <>
                                {capabilityNames
                                  .slice(0, 2)
                                  .map((name) => (
                                    <span
                                      key={name}
                                      className="partners-capability-tag"
                                    >
                                      {name}
                                    </span>
                                  ))}

                                {capabilityNames.length >
                                  2 && (
                                  <span className="partners-capability-more">
                                    +
                                    {capabilityNames.length -
                                      2}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="partners-action-buttons">
                            <button
                              type="button"
                              className="partners-icon-action edit"
                              title="Edit partner"
                              aria-label={`Edit ${partner.name}`}
                              onClick={() =>
                                openEditModal(
                                  partner,
                                )
                              }
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="partners-icon-action delete"
                              title="Delete partner"
                              aria-label={`Delete ${partner.name}`}
                              onClick={() =>
                                openDeleteModal(
                                  partner,
                                )
                              }
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="partners-directory-footer">
            <span>
              Showing{" "}
              {filteredPartners.length} of{" "}
              {partners.length} partners
            </span>
          </div>
        </section>
      </div>

      {showPartnerModal && (
        <div
          className="partners-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePartnerModal();
            }
          }}
        >
          <div
            className="partners-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-modal-title"
          >
            <div className="partners-modal-header">
              <div>
                <div className="partners-breadcrumb">
                  Partner Management
                </div>

                <h2 id="partner-modal-title">
                  {editingPartner
                    ? "Edit Partner"
                    : "Add Partner"}
                </h2>

                <p>
                  {editingPartner
                    ? "Update partner information and configuration."
                    : "Create a new partner in your ecosystem."}
                </p>
              </div>

              <button
                type="button"
                className="partners-modal-close"
                onClick={closePartnerModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="partners-form">
              <div className="partners-form-grid">
                <div className="partners-form-field full">
                  <label htmlFor="partner-name">
                    Partner Name *
                  </label>

                  <input
                    id="partner-name"
                    type="text"
                    placeholder="e.g. Acme Technology Solutions"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  />
                </div>

                <div className="partners-form-field">
                  <label htmlFor="partner-type">
                    Partner Type
                  </label>

                  <select
                    id="partner-type"
                    value={form.partnerTypeId}
                    onChange={(event) =>
                      updateField(
                        "partnerTypeId",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  >
                    <option value="">
                      Select partner type
                    </option>

                    {partnerTypes.map((type) => (
                      <option
                        key={type.id}
                        value={type.id}
                      >
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="partners-form-field">
                  <label htmlFor="partner-tier">
                    Partner Tier
                  </label>

                  <select
                    id="partner-tier"
                    value={form.tierId}
                    onChange={(event) =>
                      updateField(
                        "tierId",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  >
                    <option value="">
                      Select partner tier
                    </option>

                    {partnerTiers.map((tier) => (
                      <option
                        key={tier.id}
                        value={tier.id}
                      >
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="partners-form-field">
                  <label htmlFor="partner-status">
                    Status
                  </label>

                  <select
                    id="partner-status"
                    value={form.statusId}
                    onChange={(event) =>
                      updateField(
                        "statusId",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  >
                    <option value="">
                      Select status
                    </option>

                    {partnerStatuses.map(
                      (status) => (
                        <option
                          key={status.id}
                          value={status.id}
                        >
                          {status.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="partners-form-field">
                  <label htmlFor="partner-industry">
                    Industry
                  </label>

                  <select
                    id="partner-industry"
                    value={form.industryId}
                    onChange={(event) =>
                      updateField(
                        "industryId",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  >
                    <option value="">
                      Select industry
                    </option>

                    {industries.map((industry) => (
                      <option
                        key={industry.id}
                        value={industry.id}
                      >
                        {industry.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="partners-form-field">
                  <label htmlFor="partner-region">
                    Region
                  </label>

                  <select
                    id="partner-region"
                    value={form.regionId}
                    onChange={(event) =>
                      updateField(
                        "regionId",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  >
                    <option value="">
                      Select region
                    </option>

                    {regions.map((region) => (
                      <option
                        key={region.id}
                        value={region.id}
                      >
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="partners-form-field">
                  <label htmlFor="partner-website">
                    Website
                  </label>

                  <input
                    id="partner-website"
                    type="url"
                    placeholder="https://example.com"
                    value={form.website}
                    onChange={(event) =>
                      updateField(
                        "website",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  />
                </div>

                <div className="partners-form-field full">
                  <label htmlFor="partner-description">
                    Description
                  </label>

                  <textarea
                    id="partner-description"
                    placeholder="Describe the partner, strategic relationship, or specialization..."
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value,
                      )
                    }
                    disabled={saving}
                  />
                </div>

                <div className="partners-form-field full">
                  <div className="partners-capability-heading">
                    <label>Capabilities</label>

                    <span>
                      {form.capabilityIds.length}{" "}
                      selected
                    </span>
                  </div>

                  {capabilities.length === 0 ? (
                    <div className="partners-capability-empty">
                      No capabilities configured.
                      Add them from Settings.
                    </div>
                  ) : (
                    <div className="partners-capability-grid">
                      {capabilities.map(
                        (capability) => {
                          const selected =
                            form.capabilityIds.includes(
                              capability.id,
                            );

                          return (
                            <button
                              key={capability.id}
                              type="button"
                              className={
                                selected
                                  ? "partners-capability selected"
                                  : "partners-capability"
                              }
                              onClick={() =>
                                toggleCapability(
                                  capability.id,
                                )
                              }
                              disabled={saving}
                            >
                              <span className="partners-capability-checkbox">
                                {selected ? "✓" : ""}
                              </span>

                              <span>
                                {capability.name}
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div className="partners-form-error">
                  <span>!</span>

                  <span>{formError}</span>
                </div>
              )}
            </div>

            <div className="partners-modal-footer">
              <button
                type="button"
                className="partners-secondary-button"
                onClick={closePartnerModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="partners-primary-button"
                onClick={savePartner}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="partners-button-spinner" />
                    Saving...
                  </>
                ) : editingPartner ? (
                  "Save Changes"
                ) : (
                  "Create Partner"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingPartner && (
        <div
          className="partners-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="partners-modal partners-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-partner-title"
          >
            <div className="partners-form">
              <div className="partners-delete-icon">
                !
              </div>

              <h2 id="delete-partner-title">
                Delete Partner?
              </h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {deletingPartner.name}
                </strong>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="partners-modal-footer">
              <button
                type="button"
                className="partners-secondary-button"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="partners-danger-button"
                onClick={deletePartner}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="partners-button-spinner" />
                    Deleting...
                  </>
                ) : (
                  "Delete Partner"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}