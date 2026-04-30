import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const MyBets = () => {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyBets = async () => {
            try {
                const token = localStorage.getItem('access_token'); 
                
                if (!token) {
                    setError("Please login to view your bets.");
                    setLoading(false);
                    return;
                }

                // ==========================================
                // TEST MODE BYPASS: Load Mock Data!
                // ==========================================
                if (token === 'fake_test_token_123') {
                    console.log("Loading Test Bets...");
                    setTimeout(() => {
                        setBets([
                            { id: 1, match_title: 'CSK vs RCB', market_type: 'Match Winner', amount_staked: '5000.00', potential_return: '9500.00', status: 'PENDING', created_at: new Date().toISOString() },
                            { id: 2, match_title: 'MI vs DC', market_type: '6 Over Session Runs', amount_staked: '1000.00', potential_return: '1900.00', status: 'WON', created_at: new Date(Date.now() - 86400000).toISOString() },
                            { id: 3, match_title: 'KKR vs SRH', market_type: 'Fall of 1st Wicket', amount_staked: '2500.00', potential_return: '0.00', status: 'LOST', created_at: new Date(Date.now() - 172800000).toISOString() },
                        ]);
                        setLoading(false);
                    }, 800); // Fake a slight loading delay for realism
                    return;
                }
                // ==========================================

                // Real Backend Logic (For later)
                const res = await axios.get('/api/my-bets/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBets(
                    Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res.data?.results)
                            ? res.data.results
                            : []
                );
            } catch (err) {
                console.error("API Error:", err);
                setError("Failed to load bets.");
            } finally {
                if (token !== 'fake_test_token_123') setLoading(false);
            }
        };

        fetchMyBets();
    }, []);

    if (loading) return <div className="text-center text-gray-500 py-10 font-mono text-sm animate-pulse">Loading Slip...</div>;
    if (error) return <div className="text-center text-red-500 py-10 font-bold bg-red-900/10 rounded-lg border border-red-900/30">{error}</div>;

    return (
        <div className="space-y-3 pb-20 lg:pb-0">
            {bets.length === 0 ? (
                <div className="text-center py-16 bg-cric-dark rounded-xl border border-dashed border-gray-800">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No Active Bets</p>
                </div>
            ) : (
                bets?.map(bet => (
                    <div key={bet.id} className="bg-cric-dark border border-gray-800 rounded-lg p-4 shadow-lg relative overflow-hidden group">
                        
                        {/* Status Indicator Bar (Left Side) */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            bet.status === 'WON' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 
                            bet.status === 'LOST' ? 'bg-red-600' : 
                            'bg-yellow-500'
                        }`}></div>

                        <div className="flex justify-between items-start pl-2">
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-tight">
                                    {bet.match_title}
                                </h4>
                                <div className="flex items-center mt-1 space-x-2">
                                    <span className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                        {bet.market_type}
                                    </span>
                                    <span className="text-gray-500 text-[10px]">
                                        {new Date(bet.created_at).toLocaleString([], {month: 'short', day: 'numeric'})}
                                    </span>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center">
                                {bet.status === 'PENDING' && <span className="flex items-center text-yellow-500 text-[10px] font-bold uppercase tracking-widest"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                                {bet.status === 'WON' && <span className="flex items-center text-green-500 text-[10px] font-black uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Won</span>}
                                {bet.status === 'LOST' && <span className="flex items-center text-red-500 text-[10px] font-bold uppercase tracking-widest"><XCircle className="w-3.5 h-3.5 mr-1" /> Lost</span>}
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="mt-4 pt-3 border-t border-gray-800/50 flex justify-between items-end pl-2">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Stake</p>
                                <p className="text-white font-mono text-sm">₹{parseFloat(bet.amount_staked).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Return</p>
                                <p className={`font-mono text-lg font-black ${
                                    bet.status === 'WON' ? 'text-green-500' : 
                                    bet.status === 'LOST' ? 'text-gray-600 line-through' : 
                                    'text-white'
                                }`}>
                                    ₹{parseFloat(bet.potential_return).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyBets;
