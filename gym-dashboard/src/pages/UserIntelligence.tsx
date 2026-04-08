import React, { useState } from 'react';
import { Search, MoreVertical, Flame, Star } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Zaim N.', streak: 12, level: 8, status: 'Active', lastSeen: '2h ago' },
  { id: 2, name: 'Sarah M.', streak: 45, level: 15, status: 'Active', lastSeen: '10m ago' },
  { id: 3, name: 'John D.', streak: 0, level: 3, status: 'At Risk', lastSeen: '4d ago' },
  { id: 4, name: 'Emily R.', streak: 7, level: 5, status: 'Active', lastSeen: '1d ago' },
];

export const UserIntelligence = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontWeight: 600 }}>User Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Granular view of user habit streaks and engagement.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by user name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', paddingLeft: '48px' }}
          />
          <button className="btn-secondary">Filter by Status</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '16px', fontWeight: 500 }}>User</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Current Streak</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Alter-Ego Level</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 500 }}>Last Active</th>
                <th style={{ padding: '16px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s', cursor: 'pointer' }} className="hover-row">
                  <td style={{ padding: '16px', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flame size={16} color={user.streak > 0 ? '#ff7b00' : 'var(--text-secondary)'} />
                      {user.streak} days
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={16} color="var(--accent-cyan)" />
                      Lvl {user.level}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '16px', 
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      backgroundColor: user.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: user.status === 'Active' ? '#10b981' : '#ef4444'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.lastSeen}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
