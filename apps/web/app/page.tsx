'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiRequest } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Partner {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  description?: string | null;
}

interface Deal {
  id: string;
  name: string;
  description?: string | null;
  stage: string;
  value?: number | null;
  partnerId?: string | null;
  customerId?: string | null;
}

const PIPELINE_STAGES = [
  'DISCOVERY',
  'QUALIFIED',
  'PROPOSAL',
  'CLOSED',
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStage(stage: string) {
  return stage
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 9px',
        borderRadius: '999px',
        background: '#f2f4f7',
        color: '#344054',
        fontSize: '11px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {formatStage(status)}
    </span>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #eaecf0',
        borderRadius: '14px',
        padding: '20px',
        minHeight: '132px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            color: '#667085',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {title}
        </div>

        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: '#f2f4f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          fontSize: '27px',
          fontWeight: 750,
          color: '#101828',
          marginBottom: '5px',
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: '#98a2b3',
          fontSize: '12px',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #eaecf0',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '18px',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: '#101828',
            }}
          >
            {title}
          </h3>

          {subtitle && (
            <p
              style={{
                margin: '4px 0 0',
                color: '#667085',
                fontSize: '12px',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: '28px 10px',
        textAlign: 'center',
        color: '#98a2b3',
        fontSize: '13px',
      }}
    >
      {message}
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: '1px solid #eaecf0',
        background: '#ffffff',
        borderRadius: '12px',
        padding: '15px',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: '#f2f4f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '13px',
              color: '#101828',
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: '3px',
              fontSize: '11px',
              color: '#667085',
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        router.replace('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as User;

        setUser(parsedUser);

        const [
          partnersData,
          customersData,
          dealsData,
        ] = await Promise.all([
          apiRequest<Partner[]>('/partners'),
          apiRequest<Customer[]>('/customers'),
          apiRequest<Deal[]>('/deals'),
        ]);

        setPartners(partnersData);
        setCustomers(customersData);
        setDeals(dealsData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);

        if (
          err instanceof Error &&
          err.message === 'Session expired. Please login again.'
        ) {
          router.replace('/login');
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard',
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    router.replace('/login');
  }

  function openDeal(dealId: string) {
    router.push(`/deals/${dealId}`);
  }

  const pipelineValue = useMemo(() => {
    return deals.reduce(
      (total, deal) => total + (deal.value ?? 0),
      0,
    );
  }, [deals]);

  const activeDeals = useMemo(() => {
    return deals.filter(
      (deal) => deal.stage !== 'CLOSED',
    ).length;
  }, [deals]);

  const closedDeals = useMemo(() => {
    return deals.filter(
      (deal) => deal.stage === 'CLOSED',
    ).length;
  }, [deals]);

  const dealsByStage = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => {
      const stageDeals = deals.filter(
        (deal) => deal.stage === stage,
      );

      const value = stageDeals.reduce(
        (total, deal) => total + (deal.value ?? 0),
        0,
      );

      return {
        stage,
        deals: stageDeals,
        value,
      };
    });
  }, [deals]);

  const proposalDeals = useMemo(() => {
    return deals.filter(
      (deal) => deal.stage === 'PROPOSAL',
    ).length;
  }, [deals]);

  const qualifiedDeals = useMemo(() => {
    return deals.filter(
      (deal) => deal.stage === 'QUALIFIED',
    ).length;
  }, [deals]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#475467',
          fontSize: '15px',
        }}
      >
        Loading AllianceOS...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#101828',
      }}
    >
      {/* HEADER */}

      <header
        style={{
          height: '70px',
          background: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '21px',
                fontWeight: 800,
                letterSpacing: '-0.4px',
              }}
            >
              AllianceOS
            </div>

            <div
              style={{
                color: '#98a2b3',
                fontSize: '11px',
                marginTop: '2px',
              }}
            >
              Partner &amp; Co-Sell Operating System
            </div>
          </div>

          <div
            style={{
              height: '30px',
              width: '1px',
              background: '#eaecf0',
            }}
          />

          <div>
            <div
              style={{
                color: '#98a2b3',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontWeight: 700,
              }}
            >
              Workspace
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                marginTop: '2px',
              }}
            >
              AllianceOS Demo
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          {user && (
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {user.name}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: '#667085',
                  marginTop: '2px',
                }}
              >
                {user.role}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: '1px solid #d0d5dd',
              background: '#ffffff',
              borderRadius: '8px',
              padding: '8px 13px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#344054',
              fontSize: '12px',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* CONTENT */}

      <section
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '30px 32px 50px',
        }}
      >
        {/* HERO */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '20px',
            marginBottom: '25px',
          }}
        >
          <div>
            <div
              style={{
                color: '#667085',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              OVERVIEW
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '29px',
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
              }}
            >
              Good morning
              {user?.name
                ? `, ${user.name.split(' ')[0]}`
                : ''}
            </h1>

            <p
              style={{
                margin: '7px 0 0',
                color: '#667085',
                fontSize: '14px',
              }}
            >
              Here&apos;s what&apos;s happening across
              your partner ecosystem.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '9px',
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/deals')}
              style={{
                border: '1px solid #d0d5dd',
                background: '#ffffff',
                borderRadius: '8px',
                padding: '10px 14px',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#344054',
                fontSize: '12px',
              }}
            >
              View Pipeline
            </button>

            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => router.push('/users')}
                style={{
                  border: '1px solid #101828',
                  background: '#101828',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              >
                Manage Users
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              padding: '12px 15px',
              borderRadius: '9px',
              marginBottom: '20px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* KPI CARDS */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, minmax(0, 1fr))',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          <KpiCard
            title="Active Pipeline"
            value={formatCurrency(pipelineValue)}
            subtitle={`${activeDeals} open opportunities`}
            icon="↗"
          />

          <KpiCard
            title="Active Deals"
            value={activeDeals}
            subtitle={`${qualifiedDeals} qualified`}
            icon="◈"
          />

          <KpiCard
            title="Partners"
            value={partners.length}
            subtitle="Connected ecosystem"
            icon="◎"
          />

          <KpiCard
            title="Customers"
            value={customers.length}
            subtitle={`${closedDeals} closed deals`}
            icon="◉"
          />
        </div>

        {/* ATTENTION + AI */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 1.3fr) minmax(0, 1fr)',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <DashboardCard
            title="Attention Required"
            subtitle="Items that may need action"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <div
                style={{
                  border: '1px solid #eaecf0',
                  borderRadius: '11px',
                  padding: '15px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 750,
                  }}
                >
                  {proposalDeals}
                </div>

                <div
                  style={{
                    color: '#667085',
                    fontSize: '12px',
                    marginTop: '4px',
                  }}
                >
                  Deals in proposal
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #eaecf0',
                  borderRadius: '11px',
                  padding: '15px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 750,
                  }}
                >
                  {qualifiedDeals}
                </div>

                <div
                  style={{
                    color: '#667085',
                    fontSize: '12px',
                    marginTop: '4px',
                  }}
                >
                  Qualified opportunities
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #eaecf0',
                  borderRadius: '11px',
                  padding: '15px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 750,
                  }}
                >
                  {partners.length}
                </div>

                <div
                  style={{
                    color: '#667085',
                    fontSize: '12px',
                    marginTop: '4px',
                  }}
                >
                  Partner relationships
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="AI Partner Insights"
            subtitle="Signals from your ecosystem"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '11px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#f2f4f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ✦
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    Partner matching is ready
                  </div>

                  <div
                    style={{
                      color: '#667085',
                      fontSize: '11px',
                      marginTop: '3px',
                    }}
                  >
                    AI can analyze customer requirements
                    and identify partner capabilities.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '11px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#f2f4f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {deals.length} opportunities
                    available
                  </div>

                  <div
                    style={{
                      color: '#667085',
                      fontSize: '11px',
                      marginTop: '3px',
                    }}
                  >
                    Review opportunities and create
                    partner strategies.
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* PIPELINE */}

        <DashboardCard
          title="Deal Pipeline"
          subtitle="Co-sell opportunity distribution"
          action={
            <button
              type="button"
              onClick={() => router.push('/deals')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#475467',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View all →
            </button>
          }
        >
          {deals.length === 0 ? (
            <EmptyState
              message="No deals found for this workspace."
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              {dealsByStage.map((item) => {
                const percentage =
                  pipelineValue > 0
                    ? Math.round(
                        (item.value /
                          pipelineValue) *
                          100,
                      )
                    : 0;

                return (
                  <div
                    key={item.stage}
                    style={{
                      border: '1px solid #eaecf0',
                      borderRadius: '11px',
                      padding: '16px',
                      background: '#fcfcfd',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'center',
                        marginBottom: '11px',
                      }}
                    >
                      <span
                        style={{
                          color: '#667085',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform:
                            'uppercase',
                          letterSpacing: '0.4px',
                        }}
                      >
                        {formatStage(item.stage)}
                      </span>

                      <span
                        style={{
                          color: '#98a2b3',
                          fontSize: '11px',
                        }}
                      >
                        {percentage}%
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '23px',
                        fontWeight: 750,
                        marginBottom: '3px',
                      }}
                    >
                      {item.deals.length}
                    </div>

                    <div
                      style={{
                        color: '#667085',
                        fontSize: '12px',
                      }}
                    >
                      {formatCurrency(item.value)}
                    </div>

                    <div
                      style={{
                        height: '5px',
                        borderRadius: '99px',
                        background: '#eaecf0',
                        marginTop: '13px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            percentage,
                            item.deals.length
                              ? 4
                              : 0,
                          )}%`,
                          height: '100%',
                          background: '#475467',
                          borderRadius: '99px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>

        {/* QUICK ACTIONS */}

        <div style={{ marginTop: '20px' }}>
          <DashboardCard
            title="Quick Actions"
            subtitle="Start the next partner workflow"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <QuickAction
                icon="＋"
                title="Create Deal"
                description="Add a new co-sell opportunity"
                onClick={() => router.push('/deals')}
              />

              <QuickAction
                icon="◎"
                title="Find Partner"
                description="Identify partner capabilities"
                onClick={() =>
                  router.push('/partners')
                }
              />

              <QuickAction
                icon="▣"
                title="Customers"
                description="Review customer accounts"
                onClick={() =>
                  router.push('/customers')
                }
              />

              <QuickAction
                icon="◷"
                title="Activity"
                description="View ecosystem activity"
                onClick={() =>
                  router.push('/activity')
                }
              />
            </div>
          </DashboardCard>
        </div>

        {/* RECENT DEALS + PARTNERS */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 1.5fr) minmax(0, 1fr)',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <DashboardCard
            title="Recent Deals"
            subtitle="Latest opportunities"
            action={
              <button
                type="button"
                onClick={() => router.push('/deals')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#475467',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View all →
              </button>
            }
          >
            {deals.length === 0 ? (
              <EmptyState message="No deals available." />
            ) : (
              <div>
                {deals.slice(0, 6).map((deal) => (
                  <div
                    key={deal.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open deal ${deal.name}`}
                    onClick={() => openDeal(deal.id)}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();
                        openDeal(deal.id);
                      }
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background =
                        '#f9fafb';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background =
                        'transparent';
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '15px',
                      padding: '13px 10px',
                      margin: '0 -10px',
                      borderBottom:
                        '1px solid #f2f4f7',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition:
                        'background 0.15s ease',
                      outline: 'none',
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          marginBottom: '4px',
                          color: '#101828',
                        }}
                      >
                        {deal.name}
                      </div>

                      <div
                        style={{
                          color: '#98a2b3',
                          fontSize: '11px',
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {deal.description ||
                          'No description'}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0,
                      }}
                    >
                      <StatusBadge
                        status={deal.stage}
                      />

                      <div
                        style={{
                          minWidth: '80px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {formatCurrency(
                          deal.value ?? 0,
                        )}
                      </div>

                      <div
                        style={{
                          color: '#98a2b3',
                          fontSize: '16px',
                          width: '18px',
                          textAlign: 'center',
                        }}
                      >
                        →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          <DashboardCard
            title="Active Partners"
            subtitle="Your partner ecosystem"
            action={
              <button
                type="button"
                onClick={() =>
                  router.push('/partners')
                }
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#475467',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View all →
              </button>
            }
          >
            {partners.length === 0 ? (
              <EmptyState message="No partners found." />
            ) : (
              <div>
                {partners.slice(0, 6).map((partner) => (
                  <div
                    key={partner.id}
                    style={{
                      padding: '12px 0',
                      borderBottom:
                        '1px solid #f2f4f7',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'space-between',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '13px',
                        }}
                      >
                        {partner.name}
                      </div>

                      <StatusBadge
                        status={partner.status}
                      />
                    </div>

                    {partner.description && (
                      <div
                        style={{
                          color: '#667085',
                          fontSize: '11px',
                          marginTop: '5px',
                        }}
                      >
                        {partner.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* CUSTOMER SNAPSHOT */}

        <div style={{ marginTop: '20px' }}>
          <DashboardCard
            title="Customer Snapshot"
            subtitle="Accounts connected to your workspace"
            action={
              <button
                type="button"
                onClick={() =>
                  router.push('/customers')
                }
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#475467',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View all →
              </button>
            }
          >
            {customers.length === 0 ? (
              <EmptyState message="No customers found." />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(4, minmax(0, 1fr))',
                  gap: '12px',
                }}
              >
                {customers.slice(0, 8).map((customer) => (
                  <div
                    key={customer.id}
                    style={{
                      border: '1px solid #eaecf0',
                      borderRadius: '11px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '13px',
                        marginBottom: '4px',
                      }}
                    >
                      {customer.name}
                    </div>

                    <div
                      style={{
                        color: '#667085',
                        fontSize: '11px',
                      }}
                    >
                      {customer.company ||
                        'Company not specified'}
                    </div>

                    {customer.email && (
                      <div
                        style={{
                          color: '#98a2b3',
                          fontSize: '10px',
                          marginTop: '5px',
                        }}
                      >
                        {customer.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* FOOTER */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '28px',
            paddingTop: '18px',
            borderTop: '1px solid #eaecf0',
            color: '#98a2b3',
            fontSize: '11px',
          }}
        >
          <div>
            AllianceOS · Partner Operations
          </div>

          <div>{user?.email}</div>
        </div>
      </section>
    </main>
  );
}