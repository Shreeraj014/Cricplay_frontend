import { useState, useEffect } from 'react';
import { Menu, User, PlusCircle, MinusCircle, Gift, LogIn } from 'lucide-react';
import axios from 'axios';
import DepositModal from './DepositModal'; 
import AuthModal from './AuthModal';
import Sidebar from './Sidebar';
import WithdrawModal from './WithdrawModal'; // 1. Import the Withdraw Modal

const Header = () => {
    const [isDepositOpen, setIsDepositOpen] = useState(false); 
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false); // 2. Add Withdraw State
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('access_token')));
    const [username, setUsername] = useState(() => localStorage.getItem('username') || (localStorage.getItem('access_token') ? 'User' : ''));
    const [wallet, setWallet] = useState({ balance: 0, exposure: 0, bonus: 0 });

    const fetchProfile = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const res = await axios.get('/api/user-profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWallet({
                balance: parseFloat(res.data.balance || 0),
                exposure: parseFloat(res.data.exposure || 0),
                bonus: parseFloat(res.data.bonus || 0),
            });
            setUsername(res.data.username || localStorage.getItem('username') || 'User');
        } catch (err) {
            console.error("Error fetching live balance", err.response?.data || err);
        }
    };

    useEffect(() => {
        let profileTimeout;

        if (isLoggedIn) {
            profileTimeout = window.setTimeout(() => {
                fetchProfile();
            }, 0);
        }

        const interval = setInterval(() => {
            if (localStorage.getItem('access_token')) {
                fetchProfile();
            }
        }, 10000);

        return () => {
            if (profileTimeout) {
                window.clearTimeout(profileTimeout);
            }
            clearInterval(interval);
        };
    }, [isLoggedIn]);

    return (
        <>
            <div className="sticky top-0 z-50 border-b border-gray-800 bg-[#0f1113] px-2 py-2 text-white sm:px-3">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
                    
                    {/* Left: Menu & Logo */}
                    <div className="flex min-w-0 items-center space-x-2 md:space-x-3">
                        <Menu 
                            onClick={() => setIsSidebarOpen(true)}
                            className="h-5 w-5 shrink-0 cursor-pointer text-gray-400 transition-colors hover:text-[#22c55e] sm:h-6 sm:w-6" 
                        />
                        
                        <div className="flex min-w-0 items-center text-lg font-black italic tracking-wider sm:text-xl md:text-2xl">
                            <span style={{ color: '#22c55e' }}>C</span>P 
                            <span className="ml-1 hidden text-xs font-bold not-italic text-gray-300 sm:block md:text-sm">
                                CRICPLAY
                            </span>
                        </div>
                    </div>

                    {/* Middle: Action Buttons */}
                    {isLoggedIn && (
                        <div className="hidden md:flex space-x-2">
                            <button 
                                onClick={() => setIsDepositOpen(true)}
                                style={{ backgroundColor: '#22c55e' }}
                                className="px-4 py-1.5 rounded flex items-center font-black text-[12px] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all cursor-pointer active:scale-95 hover:opacity-80"
                            >
                                <PlusCircle className="w-4 h-4 mr-1" /> DEPOSIT
                            </button>

                            {/* 3. Connect the Withdraw Button */}
                            <button 
                                onClick={() => setIsWithdrawOpen(true)}
                                className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded flex items-center font-bold text-[12px] text-white shadow-md transition-all cursor-pointer active:scale-95"
                            >
                                <MinusCircle className="w-4 h-4 mr-1 text-red-500" /> WITHDRAW
                            </button>

                            <button className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded flex items-center font-bold text-[12px] text-white shadow-md transition-all cursor-pointer">
                                <Gift className="w-4 h-4 mr-1 text-yellow-500" /> BONUSES
                            </button>
                        </div>
                    )}

                    {/* Right: Wallet OR Login Button */}
                    <div className="flex min-w-0 items-center space-x-2 md:space-x-3">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center gap-1 md:hidden">
                                    <button 
                                        onClick={() => setIsDepositOpen(true)}
                                        style={{ backgroundColor: '#22c55e' }}
                                        className="flex items-center rounded px-2 py-1.5 text-[10px] font-black text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all hover:opacity-80 active:scale-95"
                                    >
                                        <PlusCircle className="w-3 h-3 mr-1" /> ADD
                                    </button>

                                    <button
                                        onClick={() => setIsWithdrawOpen(true)}
                                        className="flex items-center rounded bg-gray-800 px-2 py-1.5 text-[10px] font-black text-white shadow-md transition-all hover:bg-gray-700 active:scale-95"
                                    >
                                        <MinusCircle className="w-3 h-3 mr-1 text-red-500" /> WD
                                    </button>
                                </div>

                                <div className="relative flex min-w-0 items-center rounded border border-gray-800 bg-black/40 p-1 shadow-inner group">
                                    <div className="px-1.5 text-[10px] leading-tight md:px-2 md:text-[11px]">
                                        <div className="flex justify-between space-x-2 md:space-x-4">
                                            <span className="hidden font-bold uppercase text-gray-500 sm:inline">Bal</span>
                                            <span style={{ color: '#22c55e' }} className="font-mono font-black">{wallet.balance.toFixed(2)}</span>
                                        </div>
                                        <div className="mt-0.5 flex justify-between space-x-2 border-t border-gray-800 pt-0.5 md:space-x-4">
                                            <span className="hidden font-bold uppercase text-gray-500 sm:inline">Exp</span>
                                            <span className="font-mono text-red-500 font-bold">{wallet.exposure.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="flex cursor-pointer flex-col items-center border-l border-gray-800 pl-1.5 pr-0.5 sm:pl-2 sm:pr-1"
                                    >
                                        <div className="rounded-full bg-gray-800 p-1.5 transition-colors hover:bg-gray-700">
                                            <User className="w-3 h-3 md:w-4 md:h-4 text-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsAuthOpen(true)}
                                className="bg-white hover:bg-gray-200 text-black px-4 sm:px-6 py-2 rounded font-black text-xs uppercase tracking-widest flex items-center shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all active:scale-95"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Navigation Menu */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                user={{ username: username }} 
            />

            {/* Modals */}
            {isDepositOpen ? (
                <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
            ) : null}
            
            {/* 4. Add the Withdraw Modal Component */}
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />

            <AuthModal 
                isOpen={isAuthOpen} 
                onClose={() => setIsAuthOpen(false)} 
                onLoginSuccess={() => {
                    setIsLoggedIn(true);
                    setUsername(localStorage.getItem('username'));
                    fetchProfile();
                }} 
            />
        </>
    );
};

export default Header;
