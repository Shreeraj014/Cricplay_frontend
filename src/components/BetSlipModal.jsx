import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Zap, Minus, Plus } from 'lucide-react';
import axios from 'axios';

const BetSlipModal = ({
    isOpen,
    onClose,
    matchId,
    matchTitle,
    displaySelection,
    selectionPayload,
    marketType,
    odds,
    targetOver = null,
    liveOver = null,
    isNextOverLocked = false,
    lockedOver = null,
}) => {
    const [stake, setStake] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const quickStakes = [100, 500, 1000, 5000, 10000];
    const isOverPrediction = targetOver !== null && targetOver !== undefined;

    useEffect(() => {
        if (isOpen) {
            setStake('');
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

    const potentialReturn = stake ? (parseFloat(stake) * odds).toFixed(2) : '0.00';

    const handlePlaceBet = async () => {
        if (!stake || parseFloat(stake) <= 0) {
            setError("Please enter a valid stake amount.");
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError("You must be logged in to place a bet.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('/api/place-bet/', {
                match_id: matchId,
                market_type: marketType,
                selection: selectionPayload,
                amount: parseFloat(stake),
                odds: odds,
                ...(isOverPrediction ? { target_over: targetOver } : {})
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess(true);
            setTimeout(() => { onClose(); }, 2000);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Your session has expired. Please log out and log back in to continue.");
            } else {
                setError(err.response?.data?.error || "Error placing bet.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex justify-center items-center p-4">
            <div className="bg-[#1a1c23] w-full max-w-md rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(34,197,94,0.1)] overflow-hidden animate-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-4 bg-[#121417] border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-500 p-1 rounded-md">
                            <Zap className="w-4 h-4 text-black fill-black" />
                        </div>
                        <h2 className="text-white font-black italic uppercase tracking-widest text-lg">BET SLIP</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-12 h-12 text-[#22c55e]" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic">BET PLACED!</h3>
                            <p className="text-gray-400 mt-2 text-sm">Good luck, your prediction is live.</p>
                        </div>
                    ) : (
                        <>
                            {/* Match & Selection Info */}
                            <div className="mb-6 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{matchTitle}</p>
                                    <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase border border-blue-500/30">{marketType}</span>
                                </div>
                                {isOverPrediction && (
                                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-500">Predicting Over</span>
                                            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-black uppercase text-yellow-300">
                                                Over {targetOver}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs font-bold text-white/85">
                                            {liveOver ? `Live match over: ${liveOver}. ` : ''}
                                            {isNextOverLocked && lockedOver
                                                ? `Over ${lockedOver} is locked now, so this bet moves to Over ${targetOver}.`
                                                : `This prediction will be settled against Over ${targetOver}.`}
                                        </p>
                                    </div>
                                )}
                                <div className="bg-[#121417] p-4 rounded-xl border border-gray-800 flex justify-between items-center shadow-inner">
                                    <span className="text-white font-black text-lg italic uppercase">{displaySelection}</span>
                                    <div className="text-right">
                                        <span className="text-[#22c55e] font-black text-2xl font-mono">{odds.toFixed(2)}x</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stake Section */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Enter Stake Amount</label>
                                    {stake && <span className="text-[10px] text-yellow-500 font-bold">Limit: ₹100 - ₹50,000</span>}
                                </div>
                                <input 
                                    type="number" value={stake} onChange={(e) => setStake(e.target.value)}
                                    placeholder="0" 
                                    className="w-full bg-black border-2 border-gray-800 focus:border-[#22c55e] p-4 rounded-xl text-white font-mono text-3xl text-center outline-none transition-all shadow-lg"
                                />
                            </div>

                            {/* Quick Stakes Grid */}
                            <div className="grid grid-cols-5 gap-2 mb-6">
                                {quickStakes.map(amt => (
                                    <button 
                                        key={amt} 
                                        onClick={() => setStake(amt.toString())}
                                        className="bg-gray-800/50 border border-gray-700 text-gray-300 py-2 rounded-lg text-[10px] font-black hover:bg-gray-700 hover:text-white transition-all active:scale-90"
                                    >
                                        +{amt >= 1000 ? (amt/1000)+'K' : amt}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 bg-red-900/20 text-red-500 p-3 rounded-xl mb-6 text-xs font-bold border border-red-900/50">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Payout Display */}
                            <div className="flex justify-between items-center mb-6 bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                                <span className="text-gray-400 text-xs font-black uppercase tracking-tighter">Potential Return</span>
                                <span className="text-white font-black text-2xl font-mono tracking-tighter">₹{potentialReturn}</span>
                            </div>

                            {/* Place Bet Button */}
                            <button 
                                onClick={handlePlaceBet} 
                                disabled={loading || !stake}
                                className="w-full bg-[#22c55e] hover:bg-green-500 text-black font-black uppercase italic tracking-widest py-5 rounded-2xl shadow-[0_10px_20px_rgba(34,197,94,0.2)] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>PLACE BET <Zap className="w-5 h-5 fill-black"/></>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BetSlipModal;
