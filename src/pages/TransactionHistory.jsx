import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, ArrowDownLeft, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransactionHistory = () => {
    const [txs, setTxs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTxs = async () => {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('/api/transactions/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTxs(
                Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : []
            );
        };

        fetchTxs();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-3 py-4 pb-24 text-white sm:px-4">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-gray-800 bg-[#1a1c23] p-2">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-black uppercase italic tracking-wide sm:text-xl sm:tracking-widest">Transaction History</h1>
                </div>

                <div className="space-y-3">
                    {txs?.map((tx) => (
                        <div key={tx.id} className="rounded-xl border border-gray-800 bg-[#121417] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className={`rounded-lg p-2 ${tx.type === 'deposit' || tx.type === 'win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold capitalize break-words">{tx.type} - {tx.description}</p>
                                        <p className="text-[10px] font-mono text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className={`pl-11 text-sm font-mono font-black sm:pl-0 sm:text-base ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-500' : 'text-white'}`}>
                                    {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}Rs {tx.amount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
