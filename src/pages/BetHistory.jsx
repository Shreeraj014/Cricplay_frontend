import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BetHistory = () => {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBets = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await axios.get('/api/my-bets/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBets(res.data);
            } catch (err) {
                console.error('Error fetching bets');
            } finally {
                setLoading(false);
            }
        };

        fetchBets();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'won':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'lost':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-3 py-4 pb-24 text-white sm:px-4">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-gray-800 bg-[#1a1c23] p-2">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-black italic uppercase tracking-wide sm:text-2xl sm:tracking-widest">Bet History</h1>
                </div>

                {loading ? (
                    <div className="py-10 text-center font-mono text-gray-500 animate-pulse">Loading your history...</div>
                ) : (
                    <div className="space-y-4">
                        {bets.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-800 py-16 text-center text-gray-500 sm:py-20">
                                No bets placed yet.
                            </div>
                        ) : (
                            bets.map((bet) => (
                                <div key={bet.id} className="rounded-2xl border border-gray-800 bg-[#121417] p-4 shadow-lg sm:p-5">
                                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">{bet.match_title}</p>
                                            <h3 className="text-base font-black italic uppercase sm:text-lg">{bet.selection}</h3>
                                        </div>
                                        <span className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase ${getStatusStyle(bet.status)}`}>
                                            {bet.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 border-t border-gray-800 pt-4 text-sm">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase text-gray-500">Stake</p>
                                            <p className="font-mono font-black text-white">Rs {bet.stake}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase text-gray-500">Odds</p>
                                            <p className="font-mono font-black text-blue-400">{bet.odds}x</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase text-gray-500">Return</p>
                                            <p className={`font-mono font-black ${bet.status === 'won' ? 'text-green-500' : 'text-gray-400'}`}>
                                                Rs {bet.status === 'won' ? bet.potential_return : '0.00'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BetHistory;
