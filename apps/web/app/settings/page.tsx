"use client";

import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";

type ConfigType =
  | "partner-types"
  | "partner-tiers"
  | "partner-statuses"
  | "industries"
  | "regions"
  | "capabilities";

type ConfigItem = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type ConfigDefinition = {
  key: ConfigType;
  label: string;
  description: string;
};

const CONFIGURATIONS: ConfigDefinition[] = [
  {
    key: "partner-types",
    label: "Partner Types",
    description:
      "Define the types of partners your organization works with.",
  },
  {
    key: "partner-tiers",
    label: "Partner Tiers",
    description:
      "Define strategic and commercial partner tiers.",
  },
  {
    key: "partner-statuses",
    label: "Partner Statuses",
    description:
      "Control the lifecycle statuses available for partners.",
  },
  {
    key: "industries",
    label: "Industries",
    description:
      "Define the industries your organization supports.",
  },
  {
    key: "regions",
    label: "Regions",
    description:
      "Define the geographic regions used across partners.",
  },
  {
    key: "capabilities",
    label: "Capabilities",
    description:
      "Define partner capabilities used for matching and co-sell.",
  },
];

export default function SettingsPage() {
  const [selectedType, setSelectedType] =
    useState<ConfigType>("partner-types");

  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ConfigItem | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const selectedConfig = useMemo(
    () =>
      CONFIGURATIONS.find(
        (config) => config.key === selectedType,
      ),
    [selectedType],
  );

  /*
   * Load configuration data.
   *
   * This function is intentionally kept separate from the
   * useEffect because it is also used after create, update,
   * toggle and delete operations.
   */
  async function loadItems(type: ConfigType) {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<ConfigItem[]>(
        `/settings/${type}`,
      );

      setItems(
        [...data].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load configuration.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Initial load + reload when the selected configuration
   * changes.
   *
   * The request lives inside the effect rather than calling
   * a state-changing function directly from the effect.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchConfiguration = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<ConfigItem[]>(
          `/settings/${selectedType}`,
        );

        if (cancelled) {
          return;
        }

        setItems(
          [...data].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          ),
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load configuration.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchConfiguration();

    return () => {
      cancelled = true;
    };
  }, [selectedType]);

  function openCreateModal() {
    setEditingItem(null);
    setName("");
    setDescription("");
    setSortOrder("0");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(item: ConfigItem) {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description ?? "");
    setSortOrder(String(item.sortOrder));
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingItem(null);
    setName("");
    setDescription("");
    setSortOrder("0");
  }

  async function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: trimmedName,
        description:
          description.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
      };

      if (editingItem) {
        await apiRequest(
          `/settings/${selectedType}/${editingItem.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              ...payload,
              isActive: editingItem.isActive,
            }),
          },
        );
      } else {
        await apiRequest(
          `/settings/${selectedType}`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
      }

      closeModal();

      await loadItems(selectedType);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save configuration.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item: ConfigItem) {
    try {
      setError("");

      await apiRequest(
        `/settings/${selectedType}/${item.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            isActive: !item.isActive,
          }),
        },
      );

      await loadItems(selectedType);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update status.",
      );
    }
  }

  async function handleDelete(item: ConfigItem) {
    const confirmed = window.confirm(
      `Delete "${item.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(
        `/settings/${selectedType}/${item.id}`,
        {
          method: "DELETE",
        },
      );

      await loadItems(selectedType);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete configuration.",
      );
    }
  }

  function getAddLabel(label?: string) {
    if (!label) {
      return "Configuration";
    }

    if (label === "Partner Statuses") {
      return "Partner Status";
    }

    if (label.endsWith("s")) {
      return label.slice(0, -1);
    }

    return label;
  }

  return (
    <div className="settings-page">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="settings-header">
        <div>
          <h1>Settings</h1>

          <p>
            Configure your tenant-specific AllianceOS
            workspace.
          </p>
        </div>
      </div>

      {/* =====================================================
          SETTINGS LAYOUT
      ====================================================== */}

      <div className="settings-layout">
        {/* ===================================================
            SETTINGS SIDEBAR
        ==================================================== */}

        <aside className="settings-sidebar">
          <div className="settings-sidebar-title">
            Partner Setup
          </div>

          {CONFIGURATIONS.map((config) => {
            const active =
              selectedType === config.key;

            return (
              <button
                key={config.key}
                type="button"
                className={
                  active
                    ? "settings-nav-item active"
                    : "settings-nav-item"
                }
                onClick={() =>
                  setSelectedType(config.key)
                }
              >
                <span>{config.label}</span>

                <span
                  className="settings-nav-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            );
          })}

          <div className="settings-coming-soon">
            <div className="settings-coming-soon-title">
              More configuration
            </div>

            <div>Customer Setup</div>
            <div>Deal Setup</div>
            <div>Custom Fields</div>
            <div>Roles &amp; Permissions</div>
            <div>Workflows</div>
            <div>AI Configuration</div>
            <div>Integrations</div>
          </div>
        </aside>

        {/* ===================================================
            SETTINGS CONTENT
        ==================================================== */}

        <section className="settings-content">
          <div className="settings-content-header">
            <div>
              <h2>{selectedConfig?.label}</h2>

              <p>
                {selectedConfig?.description}
              </p>
            </div>

            <button
              type="button"
              className="settings-primary-button"
              onClick={openCreateModal}
            >
              + Add {getAddLabel(selectedConfig?.label)}
            </button>
          </div>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className="settings-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* =================================================
              TABLE / EMPTY / LOADING
          ================================================== */}

          <div className="settings-card">
            {loading ? (
              <div className="settings-state">
                <div className="settings-loading-spinner" />

                <div>
                  Loading configuration...
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="settings-state">
                <div className="settings-empty-icon">
                  ⚙
                </div>

                <h3>
                  No configuration yet
                </h3>

                <p>
                  Add your first{" "}
                  {selectedConfig?.label.toLowerCase()}.
                </p>

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={openCreateModal}
                >
                  Add Configuration
                </button>
              </div>
            ) : (
              <div className="settings-table-wrapper">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th className="settings-actions-column">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="settings-item-name">
                            {item.name}
                          </div>
                        </td>

                        <td>
                          <div className="settings-item-description">
                            {item.description || "—"}
                          </div>
                        </td>

                        <td>
                          {item.sortOrder}
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              item.isActive
                                ? "status-badge active"
                                : "status-badge inactive"
                            }
                            onClick={() =>
                              toggleStatus(item)
                            }
                            title={
                              item.isActive
                                ? "Click to deactivate"
                                : "Click to activate"
                            }
                          >
                            <span className="status-dot" />

                            {item.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>
                        </td>

                        <td>
                          <div className="settings-row-actions">
                            <button
                              type="button"
                              className="table-action-button"
                              onClick={() =>
                                openEditModal(item)
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="table-action-button danger"
                              onClick={() =>
                                handleDelete(item)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {modalOpen && (
        <div
          className="settings-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
          >
            {/* =============================================
                MODAL HEADER
            ============================================== */}

            <div className="settings-modal-header">
              <div>
                <h3 id="settings-modal-title">
                  {editingItem
                    ? `Edit ${selectedConfig?.label}`
                    : `Add ${selectedConfig?.label}`}
                </h3>

                <p>
                  Configure this value for your
                  tenant.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* =============================================
                FORM
            ============================================== */}

            <div className="settings-form">
              <label>
                <span>Name</span>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter name"
                  maxLength={100}
                  autoFocus
                />
              </label>

              <label>
                <span>Description</span>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Optional description"
                  rows={4}
                  maxLength={500}
                />
              </label>

              <label>
                <span>Sort Order</span>

                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            {/* =============================================
                MODAL FOOTER
            ============================================== */}

            <div className="settings-modal-footer">
              <button
                type="button"
                className="settings-secondary-button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="settings-primary-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingItem
                    ? "Save Changes"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}