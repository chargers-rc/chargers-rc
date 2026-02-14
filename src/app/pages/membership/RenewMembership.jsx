import { useState } from "react";
import useMembership from "@app/hooks/useMembership";
import { useNotifications } from "@app/hooks/useNotifications";

const PLANS = [
  {
    id: "full",
    name: "Full Year Membership",
    price: 50,
    description: "Best value for regular racers and families.",
  },
  {
    id: "half",
    name: "Half Year Membership",
    price: 30,
    description: "Great for mid-season joiners.",
  },
];

export default function RenewMembership() {
  const { membership, loadingMembership, renewMembership } = useMembership();
  const { notify } = useNotifications();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("full");
  const [processing, setProcessing] = useState(false);

  if (loadingMembership) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
          <p className="text-slate-300 text-sm">Loading membership…</p>
        </div>
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.id === selectedPlan);

  const handleContinueFromPlan = () => setStep(2);

  const handleComplete = async () => {
    setProcessing(true);
    await renewMembership();
    notify("Membership renewed successfully", "success");
    setProcessing(false);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Renew Membership
        </h1>

        <p className="text-slate-400 text-sm">
          Keep your household membership active for nominations and club benefits.
        </p>

        {/* STEP INDICATOR */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <StepDot active={step === 1} label="Choose plan" />
          <span>›</span>
          <StepDot active={step === 2} label="Confirm & pay" />
          <span>›</span>
          <StepDot active={step === 3} label="Done" />
        </div>

        {/* STEP 1 — CHOOSE PLAN */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 animate-slideUp">
            <h2 className="text-xl font-semibold text-slate-50">Choose a plan</h2>

            <div className="space-y-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedPlan === plan.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-100">{plan.name}</h3>
                      <p className="text-sm text-slate-400">{plan.description}</p>
                    </div>
                    <div className="text-lg font-semibold text-slate-100">
                      ${plan.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleContinueFromPlan}
                className="rounded-full bg-emerald-500 text-slate-950 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — CONFIRM & PAY */}
        {step === 2 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 animate-slideUp">
            <h2 className="text-xl font-semibold text-slate-50">Confirm & pay</h2>

            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <h3 className="font-medium text-slate-100 mb-1">{currentPlan.name}</h3>
              <p className="text-sm text-slate-400 mb-2">{currentPlan.description}</p>
              <p className="text-lg font-semibold text-slate-100">${currentPlan.price}</p>
            </div>

            <p className="text-sm text-slate-500">
              Payment processing will be integrated soon. For now, this simulates a successful renewal.
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                disabled={processing}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  processing
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                Back
              </button>

              <button
                onClick={handleComplete}
                disabled={processing}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  processing
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                }`}
              >
                {processing ? "Processing…" : "Complete renewal"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — DONE */}
        {step === 3 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3 animate-slideUp">
            <h2 className="text-xl font-semibold text-slate-50">Membership renewed</h2>
            <p className="text-sm text-slate-400">
              Your membership has been renewed. You’ll continue to have access to nominations and club events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({ active, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-slate-600"
        }`}
      />
      <span
        className={`${
          active ? "font-medium text-slate-100" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
