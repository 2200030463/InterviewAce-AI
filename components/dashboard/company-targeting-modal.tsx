"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GLOBAL_COMPANY_DATABASE, CompanyInfo } from "@/lib/data/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  Building2,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Plus,
  Zap,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface CompanyTargetingProps {
  selectedCompanies: string[];
  onSave: (companies: string[]) => void;
  onClose: () => void;
}

export function CompanyTargetingModal({
  selectedCompanies: initialSelected,
  onSave,
  onClose,
}: CompanyTargetingProps) {
  const { getIdToken } = useAuth();
  const [selected, setSelected] = useState<string[]>(initialSelected || ["google", "openai"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [customInput, setCustomInput] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = ["All", "FAANG / Big Tech", "AI & Semiconductors", "Enterprise Cloud & SaaS", "Fintech & High Growth"];

  const filteredCompanies = useMemo(() => {
    return GLOBAL_COMPANY_DATABASE.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.primaryTechStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        company.interviewStyle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === "All" || company.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, categoryFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustom = () => {
    if (!customInput.trim()) return;
    const customId = customInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!selected.includes(customId)) {
      setSelected((prev) => [...prev, customInput.trim()]);
      toast.success(`Added "${customInput.trim()}" to targeted companies!`);
    }
    setCustomInput("");
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const token = await getIdToken();
      if (token) {
        await fetch("/api/auth/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetCompanies: selected }),
        });
      }
      onSave(selected);
      toast.success("Target company preferences saved to Firestore! 🎯");
      onClose();
    } catch {
      onSave(selected);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl rounded-3xl bg-[#0F172A] border border-white/[0.12] p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC]">Global Company Targeting Engine</h2>
              <p className="text-xs text-[#94A3B8]">
                Select your target enterprise companies to calibrate interview rubrics and system design depth.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-white/[0.08]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by company name, tech stack (Go, Rust, PyTorch), or interview style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-slate-950 border-white/[0.08] text-xs text-slate-100 focus:ring-indigo-500"
              />
            </div>

            {/* Custom Company Adder */}
            <div className="flex gap-2">
              <Input
                placeholder="Add other company..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                className="h-10 w-44 bg-slate-950 border-white/[0.08] text-xs text-slate-100"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustom}
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-3 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[11px] px-3 py-1 rounded-lg transition-all shrink-0 font-medium ${
                  categoryFilter === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/[0.04]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Badges Bar */}
        {selected.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1.5">
            <span className="text-[11px] font-semibold text-indigo-300">
              Active Targets ({selected.length} Selected):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selected.map((item) => (
                <Badge
                  key={item}
                  className="bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs py-1 px-2.5 gap-1.5 capitalize"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => toggleSelect(item)}
                    className="text-indigo-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Companies Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 custom-scrollbar min-h-[260px]">
          {filteredCompanies.map((company) => {
            const isSelected = selected.includes(company.id) || selected.includes(company.name);
            return (
              <div
                key={company.id}
                onClick={() => toggleSelect(company.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500"
                    : "border-white/[0.08] bg-slate-950/60 hover:border-white/[0.18]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{company.logoIcon}</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100">{company.name}</h4>
                        <span className="text-[10px] text-slate-400">{company.tier}</span>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    ) : (
                      <Badge variant="outline" className={`text-[9px] py-0 px-1.5 ${company.difficulty === "Expert" ? "border-rose-500/30 text-rose-300" : "border-amber-500/30 text-amber-300"}`}>
                        {company.difficulty}
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {company.interviewStyle}
                  </p>
                </div>

                {/* Tech Stack Tags */}
                <div className="pt-2 border-t border-white/[0.04] flex flex-wrap gap-1">
                  {company.primaryTechStack.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.04] text-slate-400 font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                  {company.primaryTechStack.length > 3 && (
                    <span className="text-[9px] text-slate-500 self-center">
                      +{company.primaryTechStack.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <span className="text-xs text-slate-400">
            {selected.length} Target Companies Configured
          </span>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/[0.1] text-slate-300 text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSavePreferences}
              disabled={saving}
              className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs gap-1.5 h-9 px-5 rounded-xl font-semibold shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
