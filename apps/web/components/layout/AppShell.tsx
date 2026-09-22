"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ThemeSelector from "@/components/ui/ThemeSelector";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const primaryNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "⌂",
  },
  {
    label: "Partners",
    href: "/partners",
    icon: "♧",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "◉",
  },
  {
    label: "Deals",
    href: "/deals",
    icon: "◇",
  },
  {
    label: "Activity",
    href: "/activity",
    icon: "◷",
  },
];

const administrationNavigation: NavItem[] = [
  {
    label: "Users",
    href: "/users",
    icon: "♙",
  },
];

function isActiveRoute(
  pathname: string,
  href: string,
) {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const pageTitle =
    pathname === "/"
      ? "Dashboard"
      : pathname
          .split("/")
          .filter(Boolean)
          .map(
            (part) =>
              part.charAt(0).toUpperCase() +
              part.slice(1),
          )
          .join(" / ");

  return (
    <div className="app-shell">
      {/* =================================================
          SIDEBAR
      ================================================= */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            A
          </div>

          <div className="sidebar-brand-text">
            AllianceOS
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">
            Workspace
          </div>

          <div className="sidebar-nav-list">
            {primaryNavigation.map((item) => {
              const active =
                isActiveRoute(
                  pathname,
                  item.href,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "sidebar-nav-item active"
                      : "sidebar-nav-item"
                  }
                >
                  <span
                    className="sidebar-nav-icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="sidebar-nav-label">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="sidebar-section-label sidebar-section-label-admin">
            Administration
          </div>

          <div className="sidebar-nav-list">
            {administrationNavigation.map(
              (item) => {
                const active =
                  isActiveRoute(
                    pathname,
                    item.href,
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "sidebar-nav-item active"
                        : "sidebar-nav-item"
                    }
                  >
                    <span
                      className="sidebar-nav-icon"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>

                    <span className="sidebar-nav-label">
                      {item.label}
                    </span>
                  </Link>
                );
              },
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            AllianceOS
          </div>

          <div className="sidebar-footer-version">
            Partner &amp; Co-Sell OS
          </div>
        </div>
      </aside>

      {/* =================================================
          MAIN AREA
      ================================================= */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {pageTitle}
          </div>

          <div className="topbar-actions">
            {pathname === "/" && (
              <ThemeSelector />
            )}

            <button
              type="button"
              className="icon-button"
              aria-label="Notifications"
            >
              🔔
            </button>

            <div className="user-profile">
              <div className="avatar">
                RM
              </div>

              <div className="user-profile-info">
                <div className="user-name">
                  Rajesh Mishra
                </div>

                <div className="user-role">
                  Administrator
                </div>
              </div>

              <span className="chevron">
                ⌄
              </span>
            </div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}