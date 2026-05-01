import { useEffect, useState } from 'react';
import { LogOut, Shield, ChevronLeft, PlusCircle, MinusCircle, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import BottomNav from '../components/BottomNav';

const formatCurrency = (value) => {
    const amount = Number.parseFloat(value);
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const AccountSettings = () => {
    const navigate = useNavigate();
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(() => {
        const storedUsername = localStorage.getItem('username') || 'User';

        return {
            username: storedUsername,
            first_name: '',
            last_name: '',
            full_name: storedUsername,
            balance: 0,
            exposure: 0,
            bonus: 0,
        };
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return undefined;
        }

        let isCancelled = false;
        const fetchTimeout = window.setTimeout(async () => {
            try {
                const response = await axios.get('/api/user-profile/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (isCancelled) {
                    return;
                }

                const profile = response.data;
                const fallbackName = profile.username || localStorage.getItem('username') || 'User';
                const fullName = profile.full_name
                    || `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    || fallbackName;

                setProfile({
                    username: fallbackName,
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    full_name: fullName,
                    balance: Number.parseFloat(profile.balance || 0),
                    exposure: Number.parseFloat(profile.exposure || 0),
                    bonus: Number.parseFloat(profile.bonus || 0),
                });
            } catch (error) {
                console.error('Error fetching user data:', error.response?.data || error.message);
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }, 0);

        return () => {
            isCancelled = true;
            window.clearTimeout(fetchTimeout);
        };
    }, []);

    const displayName = profile.full_name || profile.username || 'User';
    const avatarLabel = displayName.charAt(0).toUpperCase() || 'U';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-3 py-4 pb-20 text-white sm:px-4">
            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-gray-800 bg-[#1a1c23] p-2">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-black uppercase italic tracking-wide sm:text-xl sm:tracking-widest">Account</h1>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-[#121417] p-4 sm:gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-black sm:h-12 sm:w-12 sm:text-xl">
                            {avatarLabel}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black uppercase tracking-wide sm:text-base">{displayName}</p>
                            <p className="text-xs text-gray-500">Verified User</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-[#121417] via-[#171a20] to-[#1b2230] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] sm:p-6">
                        <div className="mb-4 flex items-center justify-center gap-2 text-gray-500">
                            <Wallet className="h-4 w-4 text-[#22c55e]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.22em]">Available Balance</p>
                        </div>
                        <div className="flex items-end justify-center gap-2">
                            <span className="pb-1 font-mono text-xl font-bold text-gray-400 sm:text-2xl">Rs</span>
                            <h2 className="font-mono text-4xl font-black tracking-tight text-white sm:text-5xl">
                                {loading ? '...' : formatCurrency(profile.balance)}
                            </h2>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-gray-800/80 bg-black/20 px-4 py-3 text-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Exposure</p>
                                <p className="mt-1 font-mono text-sm font-black text-red-400 sm:text-base">
                                    Rs {formatCurrency(profile.exposure)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-gray-800/80 bg-black/20 px-4 py-3 text-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Bonus</p>
                                <p className="mt-1 font-mono text-sm font-black text-yellow-300 sm:text-base">
                                    Rs {formatCurrency(profile.bonus)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 sm:pt-6">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Wallet Actions</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsDepositOpen(true)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-4 py-4 text-sm font-black uppercase tracking-wide text-black transition-all active:scale-[0.98] hover:opacity-90"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Deposit
                            </button>
                            <button
                                onClick={() => setIsWithdrawOpen(true)}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-800 bg-[#121417] px-4 py-4 text-sm font-black uppercase tracking-wide text-white transition-all active:scale-[0.98] hover:bg-gray-800"
                            >
                                <MinusCircle className="h-4 w-4 text-red-500" />
                                Withdraw
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 sm:pt-6">
                        <button className="flex w-full items-center gap-3 rounded-xl border border-gray-800 bg-[#121417] p-4 transition-all hover:bg-gray-800 sm:gap-4">
                            <Shield className="h-5 w-5 text-blue-500" />
                            <span className="text-left text-sm font-bold">Security & Password</span>
                        </button>
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-500 transition-all hover:bg-red-500/10 sm:gap-4">
                            <LogOut className="h-5 w-5" />
                            <span className="text-left text-sm font-bold uppercase tracking-widest">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {isDepositOpen ? (
                <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
            ) : null}
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
            <BottomNav />
        </div>
    );
};

export default AccountSettings;
