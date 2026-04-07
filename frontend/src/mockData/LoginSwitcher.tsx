// src/mock/LoginSwitcher.tsx

import { BaseUser } from './seed';
import { User } from '../context/UserContext';

interface Props {
    users: BaseUser[];
    currentUser: User | null;
    onSwitch: (user: BaseUser) => void;
}

const ROLE_BADGE: Record<string, string> = {
    ADMIN: '🛡️',
    MOD: '⚖️',
    USER: '',
};

export const LoginSwitcher = ({ users, currentUser, onSwitch }: Props) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minWidth: 180,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            fontFamily: 'sans-serif',
        }}>
            {/* Header */}
            <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>
                Demo — switch user
            </div>

            {/* Current user */}
            <div style={{ fontSize: 12, color: '#888' }}>
                Connecté en tant que{' '}
                <strong style={{ color: '#fff' }}>{currentUser?.username}</strong>
                {' '}{ROLE_BADGE[currentUser?.role ?? '']}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#222' }} />

            {/* User buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {users.map(u => {
                    const isActive = u.id === currentUser?.id;
                    const isBanned = !!u.bannedAt;
                    return (
                        <button
                            key={u.id}
                            onClick={() => onSwitch(u)}
                            title={`${u.email} — ${u.role}${isBanned ? ' — BANNI' : ''}`}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 12,
                                cursor: 'pointer',
                                border: isActive ? '1px solid #6366f1' : '1px solid #2a2a2a',
                                background: isActive ? '#6366f1' : '#1a1a1a',
                                color: isBanned ? '#ef4444' : isActive ? '#fff' : '#aaa',
                                textDecoration: isBanned ? 'line-through' : 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            {ROLE_BADGE[u.role]} {u.username}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};