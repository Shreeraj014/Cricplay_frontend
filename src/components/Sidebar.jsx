import React from 'react';
import { X, History, Wallet, User, LogOut, ChevronRight, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, user }) => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" onClick={onClose} />
            
            {/* Sidebar Content */}
            <div className="fixed left-0 top-0 z-[160] h-full w-[86vw] max-w-[300px] border-r border-gray-800 bg-[#0f1113] shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="flex h-full flex-col p-4 sm:p-6">
                    
                    {/* User Header */}
                    <div className="mb-6 flex items-center justify-between sm:mb-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#22c55e] to-green-700 font-black text-black">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">@{user?.username || 'User'}</p>
                                <p className="text-[#22c55e] text-[10px] font-bold">VERIFIED PROFILE</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex-1 space-y-1">
                        <MenuButton icon={<PieChart />} label="Bet History" to="/bet-history" onClose={onClose} />
                        <MenuButton icon={<History />} label="Transaction History" to="/transactions" onClose={onClose} />
                        <MenuButton icon={<Wallet />} label="Deposit Requests" to="/deposit-requests" onClose={onClose} />
                        <MenuButton icon={<User />} label="Account Settings" to="/settings" onClose={onClose} />
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-gray-800 pt-6">
                        <button 
                            onClick={handleLogout}
                            className="w-full rounded-lg p-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/10 flex items-center gap-3"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const MenuButton = ({ icon, label, to, onClose }) => (
    <Link
        to={to}
        onClick={onClose}
        className="group flex w-full items-center justify-between rounded-xl p-3 transition-all hover:bg-white/5 sm:p-4"
    >
        <div className="flex min-w-0 items-center gap-3 text-gray-400 group-hover:text-white sm:gap-4">
            {React.cloneElement(icon, { size: 18 })}
            <span className="truncate text-sm font-bold tracking-tight">{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#22c55e] group-hover:translate-x-1 transition-all" />
    </Link>
);

export default Sidebar;
