import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav'; // Adjust path if needed for your folder structure

const TransactionHistory = () => {
    const [txs, setTxs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTxs = async () => {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');

            if (!token) {
                setError('Please login to view your transaction history.');
                setLoading(false);
                return;
            }

            try {
                // Safely using the VITE_API_URL we fixed earlier
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const res = await axios.get(`${apiUrl}/transactions/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setTxs(
                    Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res.data?.results)
                            ? res.data.results
                            : []
                );
                setError('');
            } catch (err) {
                console.error('Error fetching transactions:', err.response?.data || err.message);
                setTxs([]);
                setError(
                    err.response?.status === 401
                        ? 'Your session has expired. Please log out and log back in to continue.'
                        : 'Failed to load transactions.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTxs();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-3 py-4 pb-20 text-white sm:px-4">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-gray-800 bg-[#1a1c23] p-2 transition active:scale-95">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-black uppercase italic tracking-wide sm:text-xl sm:tracking-widest">Transaction History</h1>
                </div>

                {loading ? (
                    <div className="py-10 text-center font-mono text-gray-500 animate-pulse">Loading transactions...</div>
                ) : error ? (
                    <div className="rounded-xl border border-red-900/30 bg-red-900/10 py-10 text-center font-bold text-red-500">{error}</div>
                ) : txs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-800 bg-[#121417] py-16 text-center text-gray-500">
                        No transactions found.
                    </div>
                ) : (
                    <div className="space-y-3">
                    {txs?.map((tx) => (
                        <div key={tx.id} className="rounded-xl border border-gray-800 bg-[#121417] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className={`rounded-lg p-2 ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'won' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'won' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold capitalize break-words">
                                            {tx.type ? tx.type.replace('_', ' ') : 'Transaction'} {tx.description ? `- ${tx.description}` : ''}
                                        </p>
                                        <p className="text-[10px] font-mono text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className={`pl-11 text-sm font-mono font-black sm:pl-0 sm:text-base ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'won' ? 'text-green-500' : 'text-white'}`}>
                                    {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'won' ? '+' : '-'} Rs {Math.abs(tx.amount).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default TransactionHistory;