"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FileText,
  Mic,
  BarChart3,
  Compass,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { label: "Resume Analyzer", href: "/resume-analyzer", icon: FileText },
  { label: "Mock Interview", href: "/mock-interview", icon: Mic },
  { label: "AI Career Coach", href: "/career-coach", icon: Bot },
  { label: "Evaluation Reports", href: "/reports", icon: BarChart3 },
  { label: "Career Planner", href: "/career-planner", icon: Compass },
  { label: "Profile & Settings", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#0F172A] border-r border-white/[0.08] flex flex-col z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.08]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <span className="text-sm font-bold text-[#F8FAFC] block tracking-tight">
            InterviewAce
          </span>
          <span className="text-[10px] text-[#94A3B8] font-medium">Enterprise AI Coach</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-[#4F46E5] text-white shadow-sm font-semibold"
                    : "text-[#94A3B8] hover:bg-slate-800/80 hover:text-[#F8FAFC]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-white" : "text-[#94A3B8] group-hover:text-slate-200"
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {active && (
                  <ChevronRight className="h-3.5 w-3.5 text-white/70" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-3 border-t border-white/[0.08] space-y-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
          <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
          <span className="truncate">Firebase Authenticated</span>
        </div>

        <div className="flex items-center gap-3 px-2 py-1 rounded-lg">
          <Avatar className="h-8 w-8 shrink-0 border border-white/[0.1]">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
            <AvatarFallback className="text-xs bg-indigo-600/30 text-indigo-300 font-bold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#F8FAFC] truncate">
              {user?.displayName || "Candidate"}
            </p>
            <p className="text-[10px] text-[#94A3B8] truncate">
              {user?.email || "candidate@example.com"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-[#94A3B8] hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
