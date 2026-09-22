"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type User = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

const ROLE_OPTIONS = [
  "ADMIN",
  "MANAGER",
  "MEMBER",
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddUser, setShowAddUser] =
    useState(false);

  const [creating, setCreating] = useState(false);

  const [form, setForm] =
    useState<CreateUserPayload>({
      name: "",
      email: "",
      password: "",
      role: "MEMBER",
    });

  /*
   * Initial page load.
   *
   * We intentionally don't call loadUsers() here because
   * loadUsers() updates loading/error state synchronously.
   * React 19's set-state-in-effect rule flags that pattern.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchInitialUsers() {
      try {
        const data =
          await apiRequest<User[]>("/users");

        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load users.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInitialUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Used by the Refresh button and after creating
   * a new user.
   */
  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiRequest<User[]>("/users");

      setUsers(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof CreateUserPayload,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "MEMBER",
    });
  }

  function closeModal() {
    if (creating) {
      return;
    }

    setShowAddUser(false);
    resetForm();
  }

  async function handleCreateUser(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");

      await apiRequest<User>("/users", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setShowAddUser(false);
      resetForm();

      await loadUsers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create user.",
      );
    } finally {
      setCreating(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getInitials(user: User) {
    if (user.name?.trim()) {
      return user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }

    return user.email
      .charAt(0)
      .toUpperCase();
  }

  return (
    <main className="users-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="users-page-header">
        <div>
          <div className="page-breadcrumb">
            <span>Administration</span>
            <span>/</span>
            <span>Users</span>
          </div>

          <h1 className="users-page-title">
            Users
          </h1>

          <p className="users-page-subtitle">
            Manage workspace users, roles and
            access.
          </p>
        </div>

        <button
          type="button"
          className="users-add-button"
          onClick={() =>
            setShowAddUser(true)
          }
        >
          <span
            className="users-add-icon"
            aria-hidden="true"
          >
            +
          </span>

          <span>Add User</span>
        </button>
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div
          className="users-alert"
          role="alert"
        >
          <span className="users-alert-icon">
            !
          </span>

          <span>{error}</span>

          <button
            type="button"
            className="users-alert-close"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="users-summary">
        <div className="users-summary-card">
          <div className="users-summary-label">
            Total users
          </div>

          <div className="users-summary-value">
            {users.length}
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-label">
            Active users
          </div>

          <div className="users-summary-value">
            {
              users.filter(
                (user) =>
                  user.isActive !== false,
              ).length
            }
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-label">
            Administrators
          </div>

          <div className="users-summary-value">
            {
              users.filter(
                (user) =>
                  user.role === "ADMIN",
              ).length
            }
          </div>
        </div>
      </section>

      {/* =====================================================
          USERS TABLE
      ===================================================== */}

      <section className="users-card">
        <div className="users-card-header">
          <div>
            <h2 className="users-card-title">
              Workspace users
            </h2>

            <p className="users-card-description">
              People with access to this
              AllianceOS workspace.
            </p>
          </div>

          <button
            type="button"
            className="users-refresh-button"
            onClick={() =>
              void loadUsers()
            }
            disabled={loading}
          >
            <span
              className={
                loading
                  ? "users-refresh-icon spinning"
                  : "users-refresh-icon"
              }
            >
              ↻
            </span>

            Refresh
          </button>
        </div>

        <div className="users-table-wrapper">
          {loading ? (
            <div className="users-empty-state">
              <div className="users-loading-spinner" />

              <div className="users-empty-title">
                Loading users...
              </div>

              <div className="users-empty-description">
                Fetching workspace users.
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="users-empty-state">
              <div className="users-empty-icon">
                👤
              </div>

              <div className="users-empty-title">
                No users found
              </div>

              <div className="users-empty-description">
                Add your first workspace user
                to get started.
              </div>

              <button
                type="button"
                className="users-add-button users-empty-add-button"
                onClick={() =>
                  setShowAddUser(true)
                }
              >
                <span
                  className="users-add-icon"
                  aria-hidden="true"
                >
                  +
                </span>

                <span>Add User</span>
              </button>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const active =
                    user.isActive !== false;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="users-user-cell">
                          <div className="users-avatar">
                            {getInitials(user)}
                          </div>

                          <div className="users-user-info">
                            <div className="users-user-name">
                              {user.name ||
                                "Unnamed user"}
                            </div>

                            <div className="users-user-email">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="users-role-badge">
                          {user.role ||
                            "MEMBER"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            active
                              ? "users-status-badge active"
                              : "users-status-badge inactive"
                          }
                        >
                          <span className="users-status-dot" />

                          {active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <span className="users-created-date">
                          {formatDate(
                            user.createdAt,
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* =====================================================
          ADD USER MODAL
      ===================================================== */}

      {showAddUser && (
        <div
          className="users-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
          >
            <div className="users-modal-header">
              <div>
                <h2
                  id="add-user-title"
                  className="users-modal-title"
                >
                  Add user
                </h2>

                <p className="users-modal-description">
                  Create a new user for this
                  workspace.
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeModal}
                disabled={creating}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              className="users-form"
              onSubmit={handleCreateUser}
            >
              <div className="users-form-field">
                <label htmlFor="user-name">
                  Full name
                </label>

                <input
                  id="user-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="users-form-field">
                <label htmlFor="user-email">
                  Email address
                </label>

                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="users-form-field">
                <label htmlFor="user-password">
                  Temporary password
                </label>

                <input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value,
                    )
                  }
                  placeholder="Enter temporary password"
                  minLength={8}
                  required
                />
              </div>

              <div className="users-form-field">
                <label htmlFor="user-role">
                  Role
                </label>

                <select
                  id="user-role"
                  value={form.role}
                  onChange={(event) =>
                    updateField(
                      "role",
                      event.target.value,
                    )
                  }
                >
                  {ROLE_OPTIONS.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="users-cancel-button"
                  onClick={closeModal}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="users-add-button"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}