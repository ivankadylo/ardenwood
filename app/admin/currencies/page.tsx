"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROUNDING_RULES = [
  { label: "None", value: "none" },
  { label: "Nearest 10", value: "up_to_10" },
  { label: "Nearest 50", value: "up_to_50" },
  { label: "Nearest 100", value: "up_to_100" },
];

export default function CurrencyManagement() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    const { data } = await supabase.from('currency_rates').select('*').order('code');
    if (data) setCurrencies(data);
    setLoading(false);
  };

  const handleToggle = async (id: string, field: string, value: any) => {
    const { error } = await supabase
      .from('currency_rates')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setCurrencies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    }
  };

  const syncRate = async (code: string, id: string) => {
    if (code === 'CZK') return;
    setSyncing(id);
    try {
      const res = await fetch(`https://v6.exchangerate-api.com/v6/latest/CZK`);
      const data = await res.json();
      const rate = data.conversion_rates[code];

      if (rate) {
        const { error } = await supabase
          .from('currency_rates')
          .update({
            rate_to_czk: 1/rate,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (!error) {
          setCurrencies(prev => prev.map(c => c.id === id ? { ...c, rate_to_czk: 1/rate } : c));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error syncing rate');
    } finally {
      setSyncing(null);
    }
  };

  const formatExample = (czkAmount: number, rate: number, rule: string) => {
    let converted = czkAmount / rate;
    if (rule === "up_to_10") converted = Math.ceil(converted / 10) * 10;
    else if (rule === "up_to_50") converted = Math.ceil(converted / 50) * 50;
    else if (rule === "up_to_100") converted = Math.ceil(converted / 100) * 100;
    return Math.round(converted);
  };

  if (loading) return <div className="p-20 text-center text-warm-mid">Loading currencies...</div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl mb-2">Currency Management</h1>
          <p className="text-warm-mid font-sans">Manage exchange rates and pricing rules.</p>
        </div>
        <button className="flex items-center gap-2 bg-oak hover:bg-oak-dark text-white px-6 py-3 rounded-xl font-sans font-medium transition-all shadow-lg">
          <Plus size={20} />
          Add Currency
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-warm-mid/10 shadow-sm overflow-hidden">
        <table className="w-full text-left font-sans">
          <thead className="bg-cream text-warm-mid text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Currency</th>
              <th className="px-6 py-4 font-medium">Rate</th>
              <th className="px-6 py-4 font-medium">Rounding</th>
              <th className="px-6 py-4 font-medium text-center">Auto Sync</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
              <th className="px-6 py-4 font-medium">Example</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-mid/10">
            {currencies.map((currency) => (
              <tr key={currency.id} className="hover:bg-cream/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-charcoal">{currency.code}</td>
                <td className="px-6 py-4 text-sm">{Number(currency.rate_to_czk).toFixed(4)}</td>
                <td className="px-6 py-4">
                  <select
                    value={currency.rounding_rule}
                    onChange={(e) => handleToggle(currency.id, 'rounding_rule', e.target.value)}
                    className="bg-transparent text-sm"
                  >
                    {ROUNDING_RULES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleToggle(currency.id, 'is_auto', !currency.is_auto)}>
                    {currency.is_auto ? <CheckCircle2 className="text-green-600" size={20} /> : <XCircle className="text-warm-mid/30" size={20} />}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                   <button
                    onClick={() => handleToggle(currency.id, 'is_active', !currency.is_active)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      currency.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {currency.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  1000 CZK = {formatExample(1000, currency.rate_to_czk, currency.rounding_rule)} {currency.code}
                </td>
                <td className="px-6 py-4 text-right">
                  {currency.is_auto && currency.code !== 'CZK' && (
                    <button onClick={() => syncRate(currency.code, currency.id)} className={cn(syncing === currency.id && "animate-spin")}>
                      <RefreshCw size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
