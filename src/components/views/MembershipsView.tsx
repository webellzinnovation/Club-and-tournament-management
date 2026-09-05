import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MembershipsView: React.FC = () => {
  const { membershipPlans, payments, activeClub } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider uppercase">
              Club Subscriptions & Plans
            </span>
            <span className="text-xs text-neutral-400">Automated Billing & Renewals</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">Membership Tiers & Subscriptions</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage athlete membership plans, coach fees, court access hours, and billing frequencies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipPlans.map(p => (
          <div key={p.id} className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs flex flex-col justify-between hover:border-neutral-400 transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">{p.billingCycle}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  {p.activeSubscribersCount} Active Members
                </span>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 mt-3">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-neutral-900">₹{p.price.toLocaleString()}</span>
                <span className="text-xs text-neutral-400">/{p.billingCycle.toLowerCase()}</span>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-neutral-600">
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors">
              Manage Subscribers
            </button>
          </div>
        ))}
      </div>

      {/* Recent Payments Ledger */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-3">Recent Transactions Ledger</h3>
        <div className="divide-y divide-neutral-100 text-xs">
          {payments.map(pay => (
            <div key={pay.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900">{pay.payerName}</p>
                <p className="text-[10px] text-neutral-400">{pay.description} • {pay.paymentMethod}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-neutral-900 text-sm">₹{pay.amount.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-600 block uppercase">{pay.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
