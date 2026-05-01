import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const formatCurrency = (value) => {
    const amount = Number.parseFloat(value);
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const formatStatusLabel = (status) => {
    const normalizedStatus = String(status || 'PENDING').toUpperCase();

    switch (normalizedStatus) {
        case 'WON':
            return 'Won';
        case 'LOST':
            return 'Lost';
        default:
            return 'Pending';
    }
};

const formatSelectionLabel = (selection) => {
    if (selection === null || selection === undefined || selection === '') {
        return 'Unknown Selection';
    }

    if (typeof selection === 'string' || typeof selection === 'number' || typeof selection === 'boolean') {
        return String(selection);
    }

    if (Array.isArray(selection)) {
        const values = selection
            .map((item) => formatSelectionLabel(item))
            .filter(Boolean);

        return values.length > 0 ? values.join(' | ') : 'Custom Selection';
    }

    if (typeof selection === 'object') {
        if (Array.isArray(selection.sequence)) {
            const sequence = selection.sequence
                .map((item) => formatSelectionLabel(item))
                .filter(Boolean);

            return sequence.length > 0 ? `Sequence: ${sequence.join(' | ')}` : 'Sequence Bet';
        }

        if (selection.composition && typeof selection.composition === 'object') {
            const compositionSummary = Object.entries(selection.composition)
                .filter(([, count]) => Number(count) > 0)
                .map(([key, count]) => `${key} x${count}`);
            const runsSummary = selection.runs !== null && selection.runs !== undefined ? `Runs ${selection.runs}` : '';
            const summary = [...compositionSummary, runsSummary].filter(Boolean).join(', ');

            return summary ? `Over Mix: ${summary}` : 'Over Mix Bet';
        }

        if (selection.specifics && typeof selection.specifics === 'object') {
            const specificsSummary = Object.entries(selection.specifics)
                .filter(([, count]) => Number(count) > 0)
                .map(([key, count]) => `${key} x${count}`);
            const runsSummary = selection.runs !== null && selection.runs !== undefined ? `Runs ${selection.runs}` : '';
            const summary = [...specificsSummary, runsSummary].filter(Boolean).join(', ');

            return summary ? `Custom Specifics: ${summary}` : 'Custom Specifics Bet';
        }

        try {
            return JSON.stringify(selection);
        } catch {
            return 'Custom Selection';
        }
    }

    return 'Custom Selection';
};

const BetHistory = () => {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchBets = async () => {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');

            if (!token) {
                if (isMounted) {
                    setError('Please login to view your bet history.');
                    setBets([]);
                    setLoading(false);
                }
                return;
            }

            try {
                const res = await axios.get('/api/my-bets/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!isMounted) {
                    return;
                }

                const nextBets = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : [];

                setBets(nextBets);
                setError('');
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                console.error('Error fetching bets:', err.response?.data || err.message);
                setBets([]);
                setError(
                    err.response?.status === 401
                        ? 'Your session has expired. Please log out and log back in to continue.'
                        : 'Failed to load bet history.'
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBets();

        return () => {
            isMounted = false;
        };
    }, []);

    const getStatusStyle = (status) => {
        switch (String(status || 'PENDING').toUpperCase()) {
            case 'WON':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'LOST':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-3 py-4 pb-20 text-white sm:px-4">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-gray-800 bg-[#1a1c23] p-2">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-black italic uppercase tracking-wide sm:text-2xl sm:tracking-widest">Bet History</h1>
                </div>

                {loading ? (
                    <div className="py-10 text-center font-mono text-gray-500 animate-pulse">Loading your history...</div>
                ) : error ? (
                    <div className="rounded-xl border border-red-900/30 bg-red-900/10 py-10 text-center font-bold text-red-500">{error}</div>
                ) : (
                    <div className="space-y-4">
                        {bets.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-800 py-16 text-center text-gray-500 sm:py-20">
                                No bets placed yet.
                            </div>
                        ) : (
                            bets.map((bet, index) => {
                                const normalizedStatus = String(bet?.status || 'PENDING').toUpperCase();
                                const formattedSelection = formatSelectionLabel(bet?.selection);
                                const stakeAmount = formatCurrency(bet?.amount_staked ?? bet?.stake);
                                const oddsValue = formatCurrency(bet?.odds_taken ?? bet?.odds ?? bet?.multiplier);
                                const returnAmount = normalizedStatus === 'WON'
                                    ? formatCurrency(bet?.potential_return)
                                    : '0.00';
                                const betKey = bet?.id ?? `${bet?.created_at || 'bet'}-${index}`;

                                return (
                                    <div key={betKey} className="rounded-2xl border border-gray-800 bg-[#121417] p-4 shadow-lg sm:p-5">
                                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    {bet?.match_title || 'Unknown Match'}
                                                </p>
                                                <h3 className="text-base font-black italic uppercase sm:text-lg">
                                                    {formattedSelection}
                                                </h3>
                                                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                                    {bet?.market_type || 'Match Winner'}
                                                </p>
                                            </div>
                                            <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase ${getStatusStyle(normalizedStatus)}`}>
                                                {formatStatusLabel(normalizedStatus)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 border-t border-gray-800 pt-4 text-sm">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase text-gray-500">Stake</p>
                                                <p className="font-mono font-black text-white">Rs {stakeAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase text-gray-500">Odds</p>
                                                <p className="font-mono font-black text-blue-400">{oddsValue}x</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold uppercase text-gray-500">Return</p>
                                                <p className={`font-mono font-black ${normalizedStatus === 'WON' ? 'text-green-500' : 'text-gray-400'}`}>
                                                    Rs {returnAmount}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default BetHistory;
