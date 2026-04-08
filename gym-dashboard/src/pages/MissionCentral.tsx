import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';

const mockMissions = [
  { id: 1, title: 'Early Riser', description: 'Check-in at the gym before 7 AM', xp: 50, frequency: 'Daily', active: true },
  { id: 2, title: 'Cardio King', description: 'Complete 30 mins of intense cardio', xp: 100, frequency: 'Weekly', active: true },
  { id: 3, title: 'Weight Warrior', description: 'Hit a new PB on any compound lift', xp: 200, frequency: 'Monthly', active: false },
];

export const MissionCentral = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontWeight: 600 }}>Mission Central</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Curate and assign dynamic habits for your gym members.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Mission
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {mockMissions.map((mission) => (
          <div key={mission.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
              <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(138, 43, 226, 0.1)', color: 'var(--accent-violet)', padding: '12px', borderRadius: '12px' }}>
                <Target size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{mission.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>+{mission.xp} XP • {mission.frequency}</span>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {mission.description}
            </p>
            
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: mission.active ? '#10b981' : 'var(--text-secondary)' }}>
                {mission.active ? 'Currently Active' : 'Draft'}
              </span>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={mission.active} readOnly style={{ accentColor: 'var(--accent-cyan)' }} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
