import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const formatCurrency = (value) => {
    const amount = Number.parseFloat(value);
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const MyBets = () => {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchMyBets = async () => {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');

            if (!token) {
                if (isMounted) {
                    setError('Please login to view your bets.');
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await axios.get('/api/my-bets/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!isMounted) {
                    return;
                }

                setBets(
                    Array.isArray(response.data)
                        ? response.data
                        : Array.isArray(response.data?.results)
                            ? response.data.results
                            : []
                );
                setError('');
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                console.error('Error fetching bets:', err.response?.data || err.message);
                setError(
                    err.response?.status === 401
                        ? 'Your session has expired. Please log out and log back in to continue.'
                        : 'Failed to load bets.'
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMyBets();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <div className="py-10 text-center font-mono text-sm text-gray-500 animate-pulse">Loading Slip...</div>;
    }

    if (error) {
        return <div className="rounded-lg border border-red-900/30 bg-red-900/10 py-10 text-center font-bold text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-3 pb-20 lg:pb-0">
            {bets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-800 bg-cric-dark py-16 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500">No Recent Bets Found</p>
                </div>
            ) : (
                bets.map((bet) => {
                    const normalizedStatus = String(bet.status || '').toUpperCase();

                    return (
                        <div key={bet.id} className="group relative overflow-hidden rounded-lg border border-gray-800 bg-cric-dark p-4 shadow-lg">
                            <div
                                className={`absolute bottom-0 left-0 top-0 w-1 ${
                                    normalizedStatus === 'WON'
                                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                                        : normalizedStatus === 'LOST'
                                            ? 'bg-red-600'
                                            : 'bg-yellow-500'
                                }`}
                            />

                            <div className="flex justify-between items-start pl-2">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight text-white">
                                        {bet.match_title}
                                    </h4>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                                            {bet.market_type}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(bet.created_at).toLocaleString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    {normalizedStatus === 'PENDING' && (
                                        <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                                            <Clock className="mr-1 h-3 w-3" /> Pending
                                        </span>
                                    )}
                                    {normalizedStatus === 'WON' && (
                                        <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-green-500">
                                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Won
                                        </span>
                                    )}
                                    {normalizedStatus === 'LOST' && (
                                        <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-red-500">
                                            <XCircle className="mr-1 h-3.5 w-3.5" /> Lost
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex items-end justify-between border-t border-gray-800/50 pt-3 pl-2">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500">Stake</p>
                                    <p className="text-sm font-mono text-white">Rs {formatCurrency(bet.amount_staked)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase text-gray-500">Return</p>
                                    <p
                                        className={`text-lg font-black font-mono ${
                                            normalizedStatus === 'WON'
                                                ? 'text-green-500'
                                                : normalizedStatus === 'LOST'
                                                    ? 'text-gray-600 line-through'
                                                    : 'text-white'
                                        }`}
                                    >
                                        Rs {formatCurrency(bet.potential_return)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MyBets;
