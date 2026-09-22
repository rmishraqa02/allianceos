"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { apiRequest } from "@/lib/api";

type GtmStepStatus =
  | "SUCCESS"
  | "PENDING"
  | "FAILED"
  | "NOT_STARTED"
  | "IN_PROGRESS";

type GtmStep = {
  key: string;
  name: string;
  status: GtmStepStatus;
};

type GtmRunStep = {
  step: string;
  status: GtmStepStatus;
  startedAt?: string;
  completedAt?: string;
  output?: unknown;
  error?: string;
};

type ApprovalRequest = {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  comments?: string | null;
  requestedAt?: string;
  reviewedAt?: string | null;
};

type GtmRunResult = {
  runId?: string;
  dealId?: string;
  status?: string;
  currentStep?: string;
  startedAt?: string;
  completedAt?: string;
  message?: string;
  error?: string;

  steps?: GtmRunStep[];

  deal?: {
    id?: string;
    name?: string;
    description?: string;
    product?: string;
    partnerRole?: string;
    stage?: string;
    status?: string;
    value?: number;
    currency?: string;
    expectedCloseDate?: string;
  };

  analysis?: {
    gtmAssessment?: {
      requiresPartnerIdentification?: boolean;
      requiresCustomerIdentification?: boolean;
      proposalReady?: boolean;
      approvalRequired?: boolean;
      outreachReady?: boolean;
    };
    recommendedNextActions?: string[];
  };

  partners?: {
    candidates?: Array<{
      partnerId?: string;
      name?: string;
      description?: string;
      website?: string;
      matchScore?: number;
      matchReasons?: string[];
    }>;
  };

  selectedPartner?: {
    partnerId?: string;
    name?: string;
    description?: string;
    website?: string;
    matchScore?: number;
    matchReasons?: string[];
  };

  proposal?: {
    proposal?: {
      title?: string;
      executiveSummary?: string;
      customerProblem?: string;
      solution?: string;
      nextSteps?: string[];
      partner?: unknown;
      commercials?: unknown;
      currentStage?: string;
    };
    status?: string;
  };

  twigs?: {
    proposal?: {
      title?: string;
      executiveSummary?: string;
      customerProblem?: string;
      solution?: string;
      nextSteps?: string[];
    };

    twigExecution?: {
      total?: number;
      applied?: number;
      failed?: number;
      status?: string;

      appliedTwigs?: Array<{
        twigId?: string;
        field?: string;
        status?: string;
        instruction?: string;
        source?: string;
      }>;

      failedTwigs?: Array<{
        twigId?: string;
        field?: string;
        error?: string;
        status?: string;
      }>;
    };
  };

  email?: {
    status?: string;

    email?: {
      recipientType?: string;
      recipientName?: string;
      to?: string[];
      subject?: string;
      body?: string;
      proposalTitle?: string;
      generatedAt?: string;
    };

    approval?: {
      required?: boolean;
      status?: string;
    };
  };

  approval?: {
    required?: boolean;
    status?: string;
  };
};

/* ========================================================== */
/* WORKFLOW */
/* ========================================================== */

const defaultSteps: GtmStep[] = [
  {
    key: "get_deal",
    name: "Get Deal",
    status: "NOT_STARTED",
  },
  {
    key: "analyze_deal",
    name: "Deal Analysis",
    status: "NOT_STARTED",
  },
  {
    key: "find_partners",
    name: "Partner Matching",
    status: "NOT_STARTED",
  },
  {
    key: "generate_proposal",
    name: "Proposal",
    status: "NOT_STARTED",
  },
  {
    key: "generate_twigs",
    name: "Twig Generation",
    status: "NOT_STARTED",
  },
  {
    key: "apply_twigs",
    name: "Twig Application",
    status: "NOT_STARTED",
  },
  {
    key: "generate_email",
    name: "Email Generation",
    status: "NOT_STARTED",
  },
  {
    key: "approval",
    name: "Approval",
    status: "NOT_STARTED",
  },
];

const stepNames: Record<string, string> = {
  get_deal: "Get Deal",
  analyze_deal: "Deal Analysis",
  find_partners: "Partner Matching",
  generate_proposal: "Proposal",
  generate_twigs: "Twig Generation",
  apply_twigs: "Twig Application",
  generate_email: "Email Generation",
  approval: "Approval",
};

/* ========================================================== */
/* PAGE */
/* ========================================================== */

export default function DealPage() {
  const params = useParams();

  const dealId = params.id as string;

  const [running, setRunning] = useState(false);

  const [result, setResult] =
    useState<GtmRunResult | null>(null);

  const [error, setError] = useState("");

  const [voiceDump, setVoiceDump] = useState(
    "The customer wants the proposal to emphasize the joint value of AllianceOS and the selected partner. The solution should focus on enterprise AI integration. Do not introduce any unconfirmed pricing, dates, metrics, or commercial commitments.",
  );

  const [approval, setApproval] =
    useState<ApprovalRequest | null>(null);

  const [approvalLoading, setApprovalLoading] =
    useState(false);

  const [approvalError, setApprovalError] =
    useState("");

  /* ======================================================== */
  /* RUN GTM */
  /* ======================================================== */

  const runGtmAgent = async () => {
    try {
      setRunning(true);
      setError("");
      setApprovalError("");
      setResult(null);
      setApproval(null);

      const response =
        await apiRequest<GtmRunResult>(
          "/gtm/run",
          {
            method: "POST",
            body: JSON.stringify({
              dealId,
              voiceDump,
            }),
          },
        );

      setResult(response);

      /*
       * The GTM response contains approval status but
       * not necessarily the ApprovalRequest ID.
       *
       * Find the real approval record for this deal.
       */
      try {
        const approvals =
          await apiRequest<ApprovalRequest[]>(
            "/approvals",
            {
              method: "GET",
            },
          );

        const dealApprovals =
          approvals
            .filter(
              (item) =>
                item.entityType === "DEAL" &&
                item.entityId === dealId,
            )
            .sort(
              (a, b) =>
                new Date(
                  b.requestedAt ?? 0,
                ).getTime() -
                new Date(
                  a.requestedAt ?? 0,
                ).getTime(),
            );

        /*
         * Prefer an existing PENDING request.
         */
        const pendingApproval =
          dealApprovals.find(
            (item) =>
              item.status === "PENDING",
          );

        if (pendingApproval) {
          setApproval(pendingApproval);
          return;
        }

        /*
         * If this GTM run requires approval but no
         * pending request exists, create one.
         */
        if (
          response.approval?.required &&
          response.approval?.status ===
            "PENDING"
        ) {
          const createdApproval =
            await apiRequest<ApprovalRequest>(
              "/approvals",
              {
                method: "POST",
                body: JSON.stringify({
                  entityType: "DEAL",
                  entityId: dealId,
                  comments:
                    "Approval requested for the GTM-generated proposal and outreach.",
                }),
              },
            );

          setApproval(createdApproval);
        }
      } catch (approvalFetchError) {
        console.error(
          "Approval initialization failed:",
          approvalFetchError,
        );

        setApprovalError(
          approvalFetchError instanceof Error
            ? approvalFetchError.message
            : "Unable to initialize approval.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to run GTM Agent",
      );
    } finally {
      setRunning(false);
    }
  };

  /* ======================================================== */
  /* APPROVE / REJECT */
  /* ======================================================== */

  const reviewApproval = async (
    action: "approve" | "reject",
  ) => {
    if (!approval?.id) {
      setApprovalError(
        "No approval request is available for this deal.",
      );
      return;
    }

    try {
      setApprovalLoading(true);
      setApprovalError("");

      const updatedApproval =
        await apiRequest<ApprovalRequest>(
          `/approvals/${approval.id}/${action}`,
          {
            method: "POST",
            body: JSON.stringify({
              comments:
                action === "approve"
                  ? "Approved from AllianceOS GTM Workspace."
                  : "Rejected from AllianceOS GTM Workspace.",
            }),
          },
        );

      setApproval(updatedApproval);

      const newStatus =
        action === "approve"
          ? "APPROVED"
          : "REJECTED";

      setResult((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          status: newStatus,

          currentStep: "approval",

          approval: {
            required: true,
            status: newStatus,
          },
        };
      });
    } catch (err) {
      setApprovalError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} approval.`,
      );
    } finally {
      setApprovalLoading(false);
    }
  };

  /* ======================================================== */
  /* DERIVED DATA */
  /* ======================================================== */

  const workflowSteps =
    getWorkflowSteps(result);

  const deal = result?.deal;

  const selectedPartner =
    result?.selectedPartner ??
    result?.partners?.candidates?.[0];

  const proposal =
    result?.twigs?.proposal ??
    result?.proposal?.proposal;

  const email = result?.email?.email;

  const approvalStatus =
    approval?.status ??
    getApprovalStatus(result);

  const isPendingApproval =
    approvalStatus === "PENDING";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                AllianceOS / GTM Workspace
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {deal?.name ??
                  "AI Enterprise Co-Sell Opportunity"}
              </h1>

              <p className="mt-2 max-w-3xl text-slate-600">
                {deal?.description ??
                  "Run the AI-powered GTM workflow for this opportunity."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <Badge>
                  {deal?.stage ??
                    "DISCOVERY"}
                </Badge>

                <Badge>
                  {deal?.status ??
                    "IN_PROGRESS"}
                </Badge>

                {deal?.product && (
                  <Badge>
                    {deal.product}
                  </Badge>
                )}

              </div>

            </div>

          </div>

          {deal?.value !== undefined && (
            <div className="mt-6 border-t pt-5">

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                <Metric
                  label="Deal Value"
                  value={`${deal.currency ?? "USD"} ${deal.value.toLocaleString()}`}
                />

                <Metric
                  label="Stage"
                  value={
                    deal.stage ?? "-"
                  }
                />

                <Metric
                  label="Partner Role"
                  value={
                    deal.partnerRole ?? "-"
                  }
                />

                <Metric
                  label="Expected Close"
                  value={
                    deal.expectedCloseDate
                      ? new Date(
                          deal.expectedCloseDate,
                        ).toLocaleDateString()
                      : "-"
                  }
                />

              </div>

            </div>
          )}

        </section>

        {/* ================================================== */}
        {/* VOICE / MEETING CONTEXT */}
        {/* ================================================== */}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">
                  ✦
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Meeting / Voice Context
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Provide customer requirements,
                    meeting notes, or AI instructions.
                  </p>

                </div>

              </div>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              AI Input
            </span>

          </div>

          <textarea
            value={voiceDump}
            onChange={(event) =>
              setVoiceDump(
                event.target.value,
              )
            }
            rows={5}
            disabled={running}
            className="mt-5 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-slate-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            placeholder="Paste meeting notes or voice-dump instructions..."
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-slate-400">
              The context is passed to the GTM AI workflow
              and Twig generation.
            </p>

            <button
              onClick={runGtmAgent}
              disabled={
                running ||
                !voiceDump.trim()
              }
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running
                ? "Running GTM AI..."
                : "✦ Run GTM AI"}
            </button>

          </div>

        </section>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <strong>
              GTM Agent Error:
            </strong>{" "}

            {error}

          </section>
        )}

        {/* ================================================== */}
        {/* RUNNING */}
        {/* ================================================== */}

        {running && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />

              <div>

                <h2 className="font-semibold text-slate-900">
                  GTM AI is running
                </h2>

                <p className="text-sm text-slate-500">
                  Analyzing the opportunity, matching
                  partners, generating the proposal,
                  applying Twigs, and preparing outreach.
                </p>

              </div>

            </div>

            <Workflow
              steps={getRunningSteps()}
              running
            />

          </section>
        )}

        {/* ================================================== */}
        {/* RESULTS */}
        {/* ================================================== */}

        {result && !running && (
          <>

            {/* ============================================== */}
            {/* WORKFLOW */}
            {/* ============================================== */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <SectionTitle>
                  GTM AI Workflow
                </SectionTitle>

                <StatusBadge
                  status={
                    result.status ?? "-"
                  }
                />

              </div>

              <Workflow
                steps={workflowSteps}
              />

              <div className="mt-5 rounded-xl bg-slate-50 p-4">

                <div className="grid gap-4 text-sm md:grid-cols-3">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Run ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-700">
                      {result.runId ?? "-"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <div className="mt-1">
                      <StatusBadge
                        status={
                          result.status ?? "-"
                        }
                      />
                    </div>

                  </div>

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Current Step
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {result.currentStep ??
                        "-"}
                    </p>

                  </div>

                </div>

              </div>

              {result.message && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                  {result.message}
                </div>
              )}

            </section>

            {/* ============================================== */}
            {/* FAILED */}
            {/* ============================================== */}

            {result.status === "FAILED" && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">

                <h2 className="text-lg font-bold text-red-800">
                  GTM Agent Failed
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  {result.error ??
                    getFailedStepError(
                      result,
                    ) ??
                    "The GTM workflow failed."}
                </p>

              </section>
            )}

            {/* ============================================== */}
            {/* PARTNER */}
            {/* ============================================== */}

            {selectedPartner && (
              <section className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <SectionTitle>
                    🤝{" "}
                    {result.selectedPartner
                      ? "Selected Partner"
                      : "AI Recommended Partner"}
                  </SectionTitle>

                  <Badge>
                    {result.selectedPartner
                      ? "Selected"
                      : "AI Recommended"}
                  </Badge>

                </div>

                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div>

                    <h3 className="text-xl font-semibold text-slate-900">
                      {selectedPartner.name ??
                        "Partner"}
                    </h3>

                    {selectedPartner.description && (
                      <p className="mt-1 max-w-3xl text-sm text-slate-500">
                        {selectedPartner.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">

                      {selectedPartner.matchReasons?.map(
                        (reason, index) => (
                          <span
                            key={`${reason}-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                          >
                            {reason}
                          </span>
                        ),
                      )}

                    </div>

                  </div>

                  <div className="min-w-[120px] rounded-xl bg-slate-50 p-4 text-center">

                    <div className="text-3xl font-bold text-slate-900">
                      {selectedPartner.matchScore ??
                        "-"}
                    </div>

                    <div className="text-xs font-medium text-slate-500">
                      Match Score
                    </div>

                  </div>

                </div>

              </section>
            )}

            {/* ============================================== */}
            {/* PROPOSAL */}
            {/* ============================================== */}

            {proposal && (
              <section className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>

                    <SectionTitle>
                      📄 Final GTM Proposal
                    </SectionTitle>

                    <p className="mt-1 text-sm text-slate-500">
                      Proposal after AI-generated Twig
                      modifications.
                    </p>

                  </div>

                  <StatusBadge
                    status={
                      result.proposal?.status ??
                      "DRAFT"
                    }
                  />

                </div>

                <div className="mt-6 space-y-5">

                  {proposal.title && (
                    <h3 className="text-2xl font-bold text-slate-900">
                      {proposal.title}
                    </h3>
                  )}

                  <ProposalBlock
                    title="Executive Summary"
                    value={
                      proposal.executiveSummary
                    }
                  />

                  <ProposalBlock
                    title="Customer Problem"
                    value={
                      proposal.customerProblem
                    }
                  />

                  <ProposalBlock
                    title="Solution"
                    value={
                      proposal.solution
                    }
                  />

                  {proposal.nextSteps &&
                    proposal.nextSteps.length >
                      0 && (
                      <div>

                        <h4 className="mb-2 font-semibold text-slate-900">
                          Next Steps
                        </h4>

                        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">

                          {proposal.nextSteps.map(
                            (step, index) => (
                              <li
                                key={`${step}-${index}`}
                              >
                                {step}
                              </li>
                            ),
                          )}

                        </ul>

                      </div>
                    )}

                </div>

              </section>
            )}

            {/* ============================================== */}
            {/* TWIGS */}
            {/* ============================================== */}

            {result.twigs?.twigExecution && (
              <section className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>

                    <SectionTitle>
                      🌿 AI Twig Modifications
                    </SectionTitle>

                    <p className="mt-1 text-sm text-slate-500">
                      AI-generated modifications applied
                      to proposal and outreach content.
                    </p>

                  </div>

                  <StatusBadge
                    status={
                      result.twigs.twigExecution
                        .status ??
                      "SUCCESS"
                    }
                  />

                </div>

                <div className="mt-5 space-y-3">

                  {result.twigs.twigExecution
                    .appliedTwigs?.map(
                      (twig, index) => (
                        <div
                          key={`${twig.twigId ?? "twig"}-${index}`}
                          className="rounded-xl border bg-slate-50 p-4"
                        >

                          <div className="flex items-center justify-between">

                            <span className="font-mono text-sm font-semibold text-slate-900">
                              {twig.twigId ??
                                "Twig"}
                            </span>

                            <StatusBadge
                              status={
                                twig.status ??
                                "APPLIED"
                              }
                            />

                          </div>

                          <p className="mt-2 text-sm text-slate-600">

                            {twig.field && (
                              <strong>
                                {twig.field}
                              </strong>
                            )}

                            {twig.instruction &&
                              ` — ${twig.instruction}`}

                          </p>

                          {twig.source && (
                            <p className="mt-2 text-xs text-slate-400">
                              Source: {twig.source}
                            </p>
                          )}

                        </div>
                      ),
                    )}

                  {(!result.twigs.twigExecution
                    .appliedTwigs ||
                    result.twigs.twigExecution
                      .appliedTwigs.length ===
                      0) && (
                    <p className="text-sm text-slate-500">
                      No Twigs were applied.
                    </p>
                  )}

                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">

                  <TwigMetric
                    label="Total"
                    value={
                      result.twigs.twigExecution
                        .total ?? 0
                    }
                  />

                  <TwigMetric
                    label="Applied"
                    value={
                      result.twigs.twigExecution
                        .applied ?? 0
                    }
                  />

                  <TwigMetric
                    label="Failed"
                    value={
                      result.twigs.twigExecution
                        .failed ?? 0
                    }
                  />

                </div>

              </section>
            )}

            {/* ============================================== */}
            {/* EMAIL */}
            {/* ============================================== */}

            {email && (
              <section className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>

                    <SectionTitle>
                      ✉️ Generated Outreach Email
                    </SectionTitle>

                    <p className="mt-1 text-sm text-slate-500">
                      AI-generated outreach based on the
                      final GTM proposal.
                    </p>

                  </div>

                  <StatusBadge
                    status={
                      result.email?.status ??
                      "DRAFT"
                    }
                  />

                </div>

                <div className="mt-5 rounded-xl border bg-slate-50 p-5">

                  <div className="space-y-3 text-sm">

                    <div>
                      <span className="font-semibold text-slate-900">
                        Recipient:
                      </span>{" "}
                      {email.recipientName ??
                        email.recipientType ??
                        "-"}
                    </div>

                    <div>
                      <span className="font-semibold text-slate-900">
                        To:
                      </span>{" "}
                      {email.to &&
                      email.to.length > 0
                        ? email.to.join(", ")
                        : "Not configured"}
                    </div>

                    <div>
                      <span className="font-semibold text-slate-900">
                        Subject:
                      </span>{" "}
                      {email.subject ??
                        "-"}
                    </div>

                  </div>

                  <div className="mt-5 whitespace-pre-wrap rounded-xl bg-white p-5 text-sm leading-6 text-slate-700">
                    {email.body ??
                      "No email body generated."}
                  </div>

                </div>

              </section>
            )}

            {/* ============================================== */}
            {/* APPROVAL */}
            {/* ============================================== */}

            <section
              className={`rounded-2xl border p-6 shadow-sm ${
                approvalStatus === "PENDING"
                  ? "border-amber-200 bg-amber-50"
                  : approvalStatus === "APPROVED"
                    ? "border-green-200 bg-green-50"
                    : approvalStatus ===
                        "REJECTED"
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-white"
              }`}
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <h2 className="text-xl font-bold text-slate-900">

                      {approvalStatus ===
                      "APPROVED"
                        ? "✓ Approval Complete"
                        : approvalStatus ===
                            "REJECTED"
                          ? "✕ Approval Rejected"
                          : "⏳ Human Approval"}

                    </h2>

                    <StatusBadge
                      status={
                        approvalStatus
                      }
                    />

                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">

                    {approvalStatus ===
                    "PENDING"
                      ? "The proposal and outreach email are ready for human review. No external communication should be sent until approval is granted."
                      : approvalStatus ===
                          "APPROVED"
                        ? "The GTM proposal and outreach have been approved."
                        : approvalStatus ===
                            "REJECTED"
                          ? "The GTM proposal and outreach were rejected."
                          : "Approval status is not available."}

                  </p>

                </div>

                {isPendingApproval && (
                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        reviewApproval(
                          "reject",
                        )
                      }
                      disabled={
                        approvalLoading ||
                        !approval
                      }
                      className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() =>
                        reviewApproval(
                          "approve",
                        )
                      }
                      disabled={
                        approvalLoading ||
                        !approval
                      }
                      className="rounded-lg bg-black px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {approvalLoading
                        ? "Processing..."
                        : "✓ Approve"}
                    </button>

                  </div>
                )}

              </div>

              {approvalError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {approvalError}
                </div>
              )}

              {approval?.id && (
                <p className="mt-4 text-xs text-slate-400">
                  Approval request initialized.
                </p>
              )}

            </section>

          </>
        )}

      </div>
    </main>
  );
}

/* ========================================================== */
/* WORKFLOW HELPERS */
/* ========================================================== */

function getWorkflowSteps(
  result: GtmRunResult | null,
): GtmStep[] {
  if (!result?.steps?.length) {
    return defaultSteps;
  }

  return defaultSteps.map(
    (defaultStep) => {
      const backendStep =
        result.steps?.find(
          (item) =>
            item.step ===
            defaultStep.key,
        );

      if (!backendStep) {
        if (
          defaultStep.key ===
          "approval"
        ) {
          return {
            ...defaultStep,
            status:
              getApprovalStatus(
                result,
              ) as GtmStepStatus,
          };
        }

        return defaultStep;
      }

      return {
        ...defaultStep,
        name:
          stepNames[
            backendStep.step
          ] ??
          defaultStep.name,
        status:
          backendStep.status,
      };
    },
  );
}

function getRunningSteps(): GtmStep[] {
  return defaultSteps.map(
    (step, index) => ({
      ...step,
      status:
        index === 0
          ? "IN_PROGRESS"
          : "NOT_STARTED",
    }),
  );
}

function getApprovalStatus(
  result: GtmRunResult | null,
): string {
  if (!result) {
    return "NOT_STARTED";
  }

  const approvalStatus =
    result.approval?.status ??
    result.email?.approval?.status;

  if (approvalStatus) {
    return approvalStatus;
  }

  if (
    result.status ===
    "PENDING_APPROVAL"
  ) {
    return "PENDING";
  }

  if (
    result.status ===
    "FAILED"
  ) {
    return "FAILED";
  }

  return "NOT_STARTED";
}

function getFailedStepError(
  result: GtmRunResult,
): string | undefined {
  const failedStep =
    result.steps?.find(
      (step) =>
        step.status ===
        "FAILED",
    );

  return failedStep?.error;
}

/* ========================================================== */
/* WORKFLOW COMPONENT */
/* ========================================================== */

function Workflow({
  steps,
  running = false,
}: {
  steps: GtmStep[];
  running?: boolean;
}) {
  return (
    <div className="mt-6 overflow-x-auto">

      <div className="flex min-w-[950px] items-start">

        {steps.map(
          (step, index) => (
            <div
              key={step.key}
              className="flex flex-1 items-start"
            >

              <div className="flex min-w-[90px] flex-col items-center">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    step.status ===
                    "SUCCESS"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : step.status ===
                          "PENDING"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : step.status ===
                            "FAILED"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : step.status ===
                              "IN_PROGRESS"
                            ? "animate-pulse border-blue-500 bg-blue-50 text-blue-700"
                            : running
                              ? "border-blue-400 bg-blue-50 text-blue-600"
                              : "border-slate-300 bg-white text-slate-400"
                  }`}
                >

                  {step.status ===
                  "SUCCESS"
                    ? "✓"
                    : step.status ===
                        "PENDING"
                      ? "!"
                      : step.status ===
                          "FAILED"
                        ? "×"
                        : step.status ===
                            "IN_PROGRESS"
                          ? "●"
                          : index + 1}

                </div>

                <span className="mt-2 whitespace-nowrap text-center text-xs font-semibold text-slate-700">
                  {step.name}
                </span>

                <span
                  className={`mt-1 text-[10px] font-medium ${
                    step.status ===
                    "SUCCESS"
                      ? "text-green-600"
                      : step.status ===
                          "PENDING"
                        ? "text-amber-600"
                        : step.status ===
                            "FAILED"
                          ? "text-red-600"
                          : step.status ===
                              "IN_PROGRESS"
                            ? "text-blue-600"
                            : "text-slate-400"
                  }`}
                >
                  {step.status}
                </span>

              </div>

              {index <
                steps.length - 1 && (
                <div
                  className={`mx-2 mt-5 h-px flex-1 ${
                    step.status ===
                    "SUCCESS"
                      ? "bg-green-300"
                      : "bg-slate-300"
                  }`}
                />
              )}

            </div>
          ),
        )}

      </div>

    </div>
  );
}

/* ========================================================== */
/* UI HELPERS */
/* ========================================================== */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-xl font-bold text-slate-900">
      {children}
    </h2>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function TwigMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toUpperCase();

  let className =
    "bg-slate-100 text-slate-600";

  if (
    normalized === "SUCCESS" ||
    normalized === "APPROVED" ||
    normalized === "APPLIED"
  ) {
    className =
      "bg-green-100 text-green-700";
  }

  if (
    normalized === "PENDING" ||
    normalized ===
      "PENDING_APPROVAL"
  ) {
    className =
      "bg-amber-100 text-amber-700";
  }

  if (
    normalized === "FAILED" ||
    normalized === "REJECTED"
  ) {
    className =
      "bg-red-100 text-red-700";
  }

  if (
    normalized === "IN_PROGRESS"
  ) {
    className =
      "bg-blue-100 text-blue-700";
  }

  if (normalized === "DRAFT") {
    className =
      "bg-blue-100 text-blue-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function ProposalBlock({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div>

      <h4 className="mb-2 font-semibold text-slate-900">
        {title}
      </h4>

      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {value}
      </p>

    </div>
  );
}