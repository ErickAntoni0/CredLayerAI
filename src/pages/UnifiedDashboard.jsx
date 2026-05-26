import React, { useState } from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { TrendingUp, TrendingDown, Shield, DollarSign, Users, Star, ArrowUpRight, Zap, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const recentTransactions = [
  { id: 1, address: '0xA3f2...91Bc', type: 'P2P Payment', amount: '+0.45 ETH', status: 'confirmed', time: '2m ago', avatar: 'A' },
  { id: 2, address: '0xBc91...44Da', type: 'Micro-Loan', amount: '-0.20 ETH', status: 'confirmed', time: '18m ago', avatar: 'B' },
  { id: 3, address: '0xF7e3...22Ac', type: 'Reputation Mint', amount: '+15 pts', status: 'pending', time: '1h ago', avatar: 'F' },
  { id: 4, address: '0xC112...88Fd', type: 'P2P Payment', amount: '+1.2 ETH', status: 'confirmed', time: '3h ago', avatar: 'C' },
  { id: 5, address: '0xD99a...55Ee', type: 'ENS Auth', amount: '— pts', status: 'failed', time: '5h ago', avatar: 'D' },
];

const reputationLeaderboard = [
  { rank: 1, name: 'vitalik.eth', score: 982, change: +3, color: 'bg-amber-400' },
  { rank: 2, name: 'alice.eth', score: 956, change: +7, color: 'bg-zinc-300' },
  { rank: 3, name: 'bob.eth', score: 921, change: -2, color: 'bg-orange-400' },
  { rank: 4, name: 'carol.eth', score: 889, change: +12, color: 'bg-emerald-500' },
  { rank: 5, name: 'dave.eth', score: 847, change: +1, color: 'bg-blue-500' },
];

const areaData = [
  { month: 'Jan', volume: 1200, reputation: 420 },
  { month: 'Feb', volume: 1900, reputation: 580 },
  { month: 'Mar', volume: 3000, reputation: 720 },
  { month: 'Apr', volume: 2800, reputation: 810 },
  { month: 'May', volume: 3800, reputation: 890 },
  { month: 'Jun', volume: 4200, reputation: 950 },
];

const StatCard = ({ label, value, change, icon: Icon, iconBg, positive }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className={`flex items-center gap-1.5 text-sm font-semibold ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
      {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      <span>{change}</span>
      <span className="font-normal text-zinc-400 ml-1">vs last month</span>
    </div>
  </div>
);

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50', icon: Clock },
  failed: { label: 'Failed', color: 'text-red-500 bg-red-50', icon: AlertCircle },
};

const UnifiedDashboard = () => {
  const { userProfile, isLoadingProfile } = useWalletConnection();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'reputation', label: 'Reputation' },
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-200 border-t-black animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const repScore = userProfile?.reputationScore || 0;
  const userLevel = repScore >= 800 ? 'Expert' : repScore >= 600 ? 'Advanced' : repScore >= 400 ? 'Intermediate' : 'Beginner';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            CredLayer Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Welcome back, <span className="font-semibold text-zinc-700 dark:text-zinc-300">{userProfile?.ensName || (userProfile?.address?.slice(0, 6) + '...' + userProfile?.address?.slice(-4)) || 'Connect Wallet'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold tracking-wider uppercase">
            {userLevel}
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
            Sepolia Testnet
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              label="Reputation Score"
              value={`${repScore}/1000`}
              change="+12.5%"
              icon={Shield}
              iconBg="bg-gradient-to-br from-violet-500 to-purple-700"
              positive
            />
            <StatCard
              label="Total Volume"
              value="$2,450"
              change="+8.2%"
              icon={DollarSign}
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
              positive
            />
            <StatCard
              label="Active Wallets"
              value="12,483"
              change="+24.1%"
              icon={Users}
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
              positive
            />
            <StatCard
              label="Trust Level"
              value={userLevel}
              change="-0.3%"
              icon={Star}
              iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
              positive={false}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Volume & Reputation</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Last 6 months</p>
                </div>
                <span className="flex items-center gap-1.5 text-emerald-500 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" /> +18.4%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: 12 }} />
                  <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2.5} fill="url(#volumeGrad)" name="Volume ($)" />
                  <Area type="monotone" dataKey="reputation" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#repGrad)" name="Reputation" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Quick Actions</h3>
              {[
                { label: 'Send Payment', icon: Send, color: 'bg-emerald-500 hover:bg-emerald-600', href: '/payments' },
                { label: 'Request Loan', icon: DollarSign, color: 'bg-violet-500 hover:bg-violet-600', href: '/loans' },
                { label: 'Mint Reputation', icon: Star, color: 'bg-amber-500 hover:bg-amber-600', href: '#' },
                { label: 'View Analytics', icon: TrendingUp, color: 'bg-blue-500 hover:bg-blue-600', href: '#' },
              ].map(({ label, icon: Icon, color, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${color}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <ArrowUpRight className="w-4 h-4 ml-auto opacity-70" />
                </a>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recent Transactions</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {recentTransactions.slice(0, 4).map(tx => {
                const { label, color, icon: StatusIcon } = statusConfig[tx.status];
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {tx.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{tx.address}</p>
                      <p className="text-xs text-zinc-400">{tx.type} · {tx.time}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
                      <StatusIcon className="w-3 h-3" /> {label}
                    </span>
                    <span className={`text-sm font-bold min-w-[80px] text-right ${tx.amount.startsWith('+') ? 'text-emerald-600' : tx.amount.startsWith('-') ? 'text-red-500' : 'text-zinc-400'}`}>
                      {tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTIONS TAB ─────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">All Transactions</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{recentTransactions.length} transactions found</p>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {recentTransactions.map(tx => {
              const { label, color, icon: StatusIcon } = statusConfig[tx.status];
              return (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {tx.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-white">{tx.address}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{tx.type} · {tx.time}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                    <StatusIcon className="w-3 h-3" /> {label}
                  </span>
                  <span className={`text-base font-black min-w-[90px] text-right ${tx.amount.startsWith('+') ? 'text-emerald-600' : tx.amount.startsWith('-') ? 'text-red-500' : 'text-zinc-400'}`}>
                    {tx.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── REPUTATION TAB ───────────────────────────────── */}
      {activeTab === 'reputation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Your Reputation Score</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f4f4f5" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#8b5cf6" strokeWidth="3"
                    strokeDasharray={`${(repScore / 1000) * 100} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-zinc-900 dark:text-white">{repScore}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">/ 1000</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">{userLevel}</span>
                </div>
                <p className="text-sm text-zinc-500">Your score ranks you in the <strong className="text-zinc-800 dark:text-white">top 15%</strong> of all wallets.</p>
                <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" /> +12.5% this month
                </div>
              </div>
            </div>
            {/* Progress breakdown */}
            {[
              { label: 'Payment History', value: 92 },
              { label: 'Loan Reliability', value: 78 },
              { label: 'ENS Activity', value: 65 },
              { label: 'Network Trust', value: 85 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-1">
                  <span>{label}</span><span>{value}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-5">Reputation Leaderboard</h3>
            <div className="space-y-3">
              {reputationLeaderboard.map(({ rank, name, score, change, color }) => (
                <div key={rank} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <span className={`w-7 h-7 ${color} rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0`}>
                    {rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-800 dark:text-white">{name}</p>
                    <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-300 rounded-full" style={{ width: `${(score / 1000) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-zinc-900 dark:text-white">{score}</p>
                    <p className={`text-xs font-semibold ${change > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      {change > 0 ? '+' : ''}{change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Protocol CTA Banner */}
      <div className="bg-zinc-900 dark:bg-black rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">CredLayer Protocol — Sepolia Testnet</p>
            <p className="text-zinc-500 text-xs mt-0.5">Contract: <span className="text-zinc-300 font-mono">0xcABFB7d0...431</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="/payments" className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-100 transition-colors">
            Send Payment
          </a>
          <a href="/loans" className="px-4 py-2 rounded-xl border border-zinc-700 text-white text-sm font-semibold hover:border-zinc-500 transition-colors">
            Get Loan
          </a>
        </div>
      </div>

    </div>
  );
};

export default UnifiedDashboard;
