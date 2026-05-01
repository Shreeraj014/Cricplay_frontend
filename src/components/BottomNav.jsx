import React from 'react';
import { Home, Trophy, List, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
    {
        label: 'Home',
        icon: Home,
        path: '/',
        matches: ['/', '/admin'],
    },
    {
        label: 'Sports',
        icon: Trophy,
        path: '/sports',
        matches: ['/sports'],
    },
    {
        label: 'My Bets',
        icon: List,
        path: '/bet-history',
        matches: ['/bet-history'],
    },
    {
        label: 'Account',
        icon: User,
        path: '/settings',
        matches: ['/settings'],
    },
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-gray-800 bg-[#121212] py-2 pb-safe lg:hidden">
            {navItems.map(({ label, icon: Icon, path, matches }) => {
                const isActive = matches.includes(location.pathname);

                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => navigate(path)}
                        className={`flex flex-col items-center ${isActive ? 'text-green-500' : 'text-gray-400'}`}
                    >
                        <Icon className="h-6 w-6" />
                        <span className="mt-1 text-[10px]">{label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
