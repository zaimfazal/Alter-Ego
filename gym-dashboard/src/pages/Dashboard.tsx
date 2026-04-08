import React from 'react';
import { Users, Activity, CheckCircle, TrendingUp } from 'lucide-react';

const MetricCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
      <div style={{ color: 'var(--accent-cyan)', background: 'var(--accent-glow)', padding: '8px', borderRadius: '8px' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
      {value}
    </div>
    {trend && (
      <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <TrendingUp size={14} /> {trend} this week
      </div>
    )}
  </div>
);

export const Dashboard = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontWeight: 600 }}>Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gym performance and high-level user metrics.</p>
        </div>
        <button className="btn-primary">Generate Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <MetricCard title="Total Active Users" value="1,248" icon={<Users size={20} />} trend="+12%" />
        <MetricCard title="Avg Check-in Streak" value="4.2 Days" icon={<Activity size={20} />} trend="+0.5%" />
        <MetricCard title="Missions Completed" value="8,942" icon={<CheckCircle size={20} />} trend="+24%" />
        <MetricCard title="Gym Utilization" value="78%" icon={<TrendingUp size={20} />} trend="+3%" />
      </div>

      <div className="glass-panel" style={{ padding: '24px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} style={{ color: 'var(--border-subtle)', marginBottom: '16px' }} />
          <p>Activity Chart (Placeholder for D3/Recharts)</p>
        </div>
      </div>
    </div>
  );
};
