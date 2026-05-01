import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Trophy, Clock, Lock, Zap, Target, PieChart, CheckCircle2, AlertCircle, HelpCircle, Info } from 'lucide-react';
import BetSlipModal from './BetSlipModal';
import MyBets from './MyBets';

// ==========================================
// 1. THE DARK-THEME BET SLIP MODAL
// ==========================================
const LegacyBetSlipModal = ({ isOpen, onClose, matchTitle, displaySelection, marketType, odds }) => {
    const [stake, setStake] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) { setStake(''); setSuccess(false); }
    }, [isOpen]);

    const potentialReturn = stake ? (parseFloat(stake) * odds).toFixed(2) : '0.00';

    const handlePlaceBet = () => {
        if (!stake || parseFloat(stake) <= 0) return alert("Enter a valid stake");
        setLoading(true);
        setTimeout(() => {
            setSuccess(true);
            setTimeout(() => { onClose(); setLoading(false); }, 2000);
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
            <div className="bg-[#1a1c23] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-white font-black italic uppercase tracking-widest flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> 
                        BET SLIP
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-5">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <CheckCircle2 className="w-16 h-16 text-[#22c55e] mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Bet Placed!</h3>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs text-gray-400 font-bold uppercase">{matchTitle}</p>
                                <span className="bg-[#2a2d3a] text-gray-300 text-[9px] px-2 py-1 rounded font-black uppercase tracking-wider">
                                    {marketType}
                                </span>
                            </div>
                            <div className="bg-[#121417] border border-gray-800 rounded p-4 flex justify-between items-center mb-6">
                                <span className="text-white font-bold text-sm">{displaySelection}</span>
                                <span className="text-[#22c55e] font-black text-lg">{odds.toFixed(2)}x</span>
                            </div>
                            <div className="mb-6">
                                <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block tracking-wider">Enter Stake (₹)</label>
                                <div className="relative">
                                    <input 
                                        type="number" value={stake} onChange={(e) => setStake(e.target.value)}
                                        placeholder="100" 
                                        className="w-full bg-black border border-[#22c55e] p-3 rounded text-white font-mono text-xl outline-none focus:ring-1 focus:ring-[#22c55e]" 
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-400 font-black text-sm uppercase tracking-wider">Potential Return</span>
                                <span className="text-white font-black text-2xl font-mono">₹{potentialReturn}</span>
                            </div>
                            <button onClick={handlePlaceBet} disabled={loading || !stake} className="w-full bg-[#22c55e] hover:bg-green-500 text-black font-black uppercase tracking-widest py-4 rounded shadow-lg active:scale-95 transition-all disabled:opacity-50 text-lg">
                                {loading ? 'Processing...' : 'Place Bet'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const parseOverState = (oversValue) => {
    const oversText = String(oversValue ?? '0.0').trim();
    const [overPart, ballPart = '0'] = oversText.split('.');
    const currentOver = Number.parseInt(overPart, 10);
    const currentBall = Number.parseInt(ballPart, 10);

    return {
        currentOver: Number.isNaN(currentOver) ? 0 : currentOver,
        currentBall: Number.isNaN(currentBall) ? 0 : currentBall,
        liveOverLabel: oversText || '0.0',
    };
};

const getBettingOver = (currentOver, currentBall) => (
    currentBall >= 6 ? currentOver + 2 : currentOver + 1
);

const getOverBettingContext = (oversValue) => {
    const { currentOver, currentBall, liveOverLabel } = parseOverState(oversValue);
    const targetOver = getBettingOver(currentOver, currentBall);
    const isNextOverLocked = currentBall >= 6;

    return {
        currentOver,
        currentBall,
        liveOverLabel,
        targetOver,
        isNextOverLocked,
        lockedOver: isNextOverLocked ? currentOver + 1 : null,
    };
};

const CUSTOM_SPECIFICS_PROFIT_INCREMENTS = {
    '0': 0.5,
    '1': 0.5,
    '2': 0.5,
    Wd: 0.5,
    '4': 1.0,
    '6': 1.0,
    W: 2.0,
    NB: 2.0,
    '3': 2.0,
};

const calculateAdditiveSpecificsOdds = (selectionCounts, runsActive, runsBonus = 1.5) => {
    let totalOdds = 1.0;
    let hasSelection = false;

    Object.entries(selectionCounts).forEach(([key, count]) => {
        const increment = CUSTOM_SPECIFICS_PROFIT_INCREMENTS[key];
        const quantity = Number(count) || 0;

        if (!increment || quantity <= 0) {
            return;
        }

        totalOdds += increment * quantity;
        hasSelection = true;
    });

    if (runsActive) {
        totalOdds += runsBonus;
        hasSelection = true;
    }

    return hasSelection ? totalOdds : 0;
};

// ==========================================
// 2. THE LIGHT-THEME STACKED MICRO-BETS COMPONENT
// ==========================================
const MatchMicroBets = ({ match, handleOddsClick }) => {
    // --- SECTION 1: EXACT SEQUENCE ---
    const [s1Balls, setS1Balls] = useState(Array(6).fill(null));
    const [s1ActiveSlot, setS1ActiveSlot] = useState(0);
    const [s1RunsActive, setS1RunsActive] = useState(false);
    const [s1Runs, setS1Runs] = useState(0);
    const outcomes1 = ['0', '1', '2', '3', '4', '6', 'W', 'Wd', 'NB'];
    const overBettingContext = getOverBettingContext(match.overs);

    const handleS1Keypad = (val) => {
        const newBalls = [...s1Balls];
        newBalls[s1ActiveSlot] = val;
        setS1Balls(newBalls);
        if (s1ActiveSlot < 5) setS1ActiveSlot(s1ActiveSlot + 1);
    };

    const isS1Complete = s1Balls.every(ball => ball !== null && ball !== '');

    const submitS1Bet = () => {
        if (!isS1Complete) {
            alert("STRICT RULE: You must predict all 6 balls to place this bet!");
            return;
        }

        handleOddsClick(
            match,
            "Exact Over Sequence",
            10.00,
            'BALL_BY_BALL',
            { sequence: s1Balls },
            overBettingContext
        );
    };

    // --- SECTION 2: OVER MIX ---
    const [s2Comp, setS2Comp] = useState({ '0':0, '1':0, '2':0, '4':0, '6':0, 'W':0, 'Wd':0, 'NB':0 });
    const [s2RunsActive, setS2RunsActive] = useState(false);
    const [s2Runs, setS2Runs] = useState(0);
    const s2TotalBalls = Object.values(s2Comp).reduce((a, b) => a + b, 0);

    const handleS2Change = (key, delta) => {
        if (delta > 0 && s2TotalBalls >= 6) return;
        if (s2Comp[key] + delta < 0) return;
        setS2Comp({ ...s2Comp, [key]: s2Comp[key] + delta });
    };

    const submitS2Bet = () => {
        handleOddsClick(
            match,
            "Over Composition Mix",
            8.00,
            'DISTRIBUTION',
            { composition: s2Comp, runs: s2RunsActive ? s2Runs : null },
            overBettingContext
        );
    };

    // --- SECTION 3: CUSTOM PARLAY ---
    const [s3Selections, setS3Selections] = useState({ '2':0, '3':0, '4':0, '6':0, 'W':0, 'Wd':0, 'NB':0 });
    const [s3RunsActive, setS3RunsActive] = useState(false);
    const [s3Runs, setS3Runs] = useState(0);

    const handleS3Change = (key, delta) => {
        if (s3Selections[key] + delta < 0) return;
        setS3Selections({ ...s3Selections, [key]: s3Selections[key] + delta });
    };

    const calculateS3OddsValue = () => calculateAdditiveSpecificsOdds(s3Selections, s3RunsActive);

    const calculateS3Odds = () => {
        const totalOdds = calculateS3OddsValue();
        return totalOdds > 0 ? totalOdds.toFixed(2) : "0.00";
    };

    const submitS3Bet = () => {
        const finalOdds = calculateS3OddsValue();
        if (finalOdds <= 0) return alert("Please select at least one outcome.");
        handleOddsClick(
            match,
            "Custom Specifics Parlay",
            parseFloat(finalOdds.toFixed(2)),
            'CUSTOM',
            { specifics: s3Selections, runs: s3RunsActive ? s3Runs : null },
            overBettingContext
        );
    };

    const s3OddsValue = calculateS3OddsValue();
    const s3HasSelection = s3OddsValue > 0;
    const s3TotalPicks = Object.values(s3Selections).reduce((sum, count) => sum + count, 0) + (s3RunsActive ? 1 : 0);
    const s3ProfitBoost = s3HasSelection ? (s3OddsValue - 1).toFixed(2) : '0.00';
    const s3SelectionSummary = Object.entries(s3Selections)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => `${key} x${count}`);

    if (s3RunsActive) {
        s3SelectionSummary.push(`Runs ${s3Runs}`);
    }

    const conceptHighlights = [
        {
            icon: <Target className="h-4 w-4 text-blue-300" />,
            title: 'Exact',
            subtitle: '10x Returns',
            detail: '6-ball order'
        },
        {
            icon: <PieChart className="h-4 w-4 text-purple-300" />,
            title: 'Over Mix',
            subtitle: '8x Returns',
            detail: 'Total composition'
        },
        {
            icon: <Zap className="h-4 w-4 text-green-300" />,
            title: 'Parlay',
            subtitle: 'Flex Odds',
            detail: 'Stacked events'
        },
    ];

    return (
        <div className="mt-4 rounded-xl border border-gray-800 bg-[#121417] p-1.5 text-gray-900 shadow-xl sm:p-3">
            
            {/* Header Banner */}
            <div className="mb-2 overflow-hidden rounded-xl border border-[#2b82b8]/40 bg-gradient-to-br from-[#123247] via-[#17202d] to-[#121417] shadow-md">
                <div className="p-2.5 sm:p-4">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                            3 Unique Concepts
                        </span>
                        <span className="rounded-full border border-green-400/40 bg-green-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-green-300">
                            High Return Formats
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-200">
                            Fast Entry
                        </span>
                    </div>

                    <div className="mb-2">
                        <h3 className="text-sm font-black uppercase tracking-wide text-white sm:text-lg sm:tracking-widest">
                            Advanced Over Predictions
                        </h3>
                        <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-blue-100/80 sm:text-sm">
                            All 3 concepts stay visible below, with tighter mobile sizing so users can compare and act faster.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {conceptHighlights.map((concept) => (
                            <div key={concept.title} className="rounded-lg border border-white/10 bg-black/20 p-2 sm:rounded-xl sm:p-3">
                                <div className="mb-1 flex items-center gap-1.5">
                                    {concept.icon}
                                    <p className="text-[10px] font-black uppercase tracking-wide text-white sm:text-xs">{concept.title}</p>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7dd3fc] sm:text-[10px]">
                                    {concept.subtitle}
                                </p>
                                <p className="mt-1 text-[9px] leading-relaxed text-gray-200/75 sm:text-[11px]">
                                    {concept.detail}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 rounded-lg border border-yellow-400/25 bg-yellow-500/10 p-2 sm:mt-3 sm:p-3">
                        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
                            <div className="rounded-md bg-black/20 px-2 py-1.5">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-yellow-200/70">Live Over</p>
                                <p className="text-sm font-black text-white">{overBettingContext.liveOverLabel}</p>
                            </div>
                            <div className="rounded-md bg-black/20 px-2 py-1.5">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-yellow-200/70">Predicting</p>
                                <p className="text-sm font-black text-yellow-200">Over {overBettingContext.targetOver}</p>
                            </div>
                            <div className="col-span-2 rounded-md bg-black/20 px-2 py-1.5">
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-yellow-200/70">Bet Window</p>
                                <p className="text-[11px] font-bold leading-relaxed text-white/85">
                                    {overBettingContext.isNextOverLocked
                                        ? `Over ${overBettingContext.lockedOver} is locked on the 6th ball. New bets now move to Over ${overBettingContext.targetOver}.`
                                        : `New micro-bets placed now apply to Over ${overBettingContext.targetOver}.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-3 overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
                <div className="border-b border-gray-800 bg-[#101317] p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-black italic uppercase tracking-wide text-white sm:text-base sm:tracking-widest">
                        <Target className="h-4 w-4 text-blue-400" />
                        1. Ball Sequence
                    </span>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-200">
                                Over {overBettingContext.targetOver}
                            </span>
                            <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                                Peak Return 10x
                            </span>
                        </div>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-gray-400 sm:text-xs">
                        Predict all 6 balls in exact order. Every slot must be filled. Add exact runs to unlock the full return ceiling.
                    </p>
                </div>
                <div className="bg-white p-2.5 text-black sm:p-5">
                        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-[11px] font-medium text-blue-800 sm:p-3 sm:text-xs">
                            <div className="mb-1 flex items-center gap-1 font-bold"><Info className="w-4 h-4"/> How to Play:</div>
                            Predict the exact outcome of all 6 balls in perfect order, then optionally add exact runs.
                            <p className="mt-2 font-bold">Strict mode: every ball slot from B1 to B6 must be filled before continuing.</p>
                        </div>

                        <div className="mb-4 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
                            <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase text-gray-500"><AlertCircle className="w-3 h-3"/> Return System</p>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold sm:gap-2 sm:text-xs">
                                <div className="bg-gray-100 p-1 rounded text-gray-500">0-1 Correct = Loss</div>
                                <div className="bg-blue-100 p-1 rounded text-blue-800 border border-blue-300">2 Correct = 1x <span className="text-[9px] block">(Money Back)</span></div>
                                <div className="bg-green-100 p-1 rounded text-green-800">3 Correct = 1.5x</div>
                                <div className="bg-green-100 p-1 rounded text-green-800">4 Correct = 2x</div>
                                <div className="bg-green-100 p-1 rounded text-green-800">5 Correct = 3x</div>
                                <div className="bg-green-200 p-1 rounded border border-green-500 text-green-900">6 Correct = 5x <span className="text-green-700 block">+ Runs = 10x!</span></div>
                            </div>
                        </div>

                        <div className="mb-4 grid grid-cols-6 gap-1 sm:flex sm:justify-between sm:gap-1">
                            {s1Balls.map((ball, idx) => (
                                <div key={idx} onClick={() => setS1ActiveSlot(idx)} className={`w-full aspect-square flex flex-col items-center justify-center border-2 rounded-lg cursor-pointer transition-all ${s1ActiveSlot === idx ? 'border-blue-600 bg-blue-100 scale-105 shadow-md' : 'border-gray-300 bg-white hover:border-blue-400'}`}>
                                    <span className="text-[9px] text-gray-500 font-bold mb-1">B{idx + 1}</span>
                                    <span className="font-black text-sm sm:text-lg text-gray-900">{ball || '-'}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4 grid grid-cols-5 gap-1.5 sm:gap-2">
                            {outcomes1.map(out => (
                                <button key={out} onClick={() => handleS1Keypad(out)} className="rounded border border-gray-300 bg-white py-2 text-xs font-black text-gray-800 shadow-sm transition-colors active:scale-95 hover:border-blue-600 hover:bg-blue-600 hover:text-white sm:text-sm">{out}</button>
                            ))}
                            <button onClick={() => {setS1Balls(Array(6).fill(null)); setS1ActiveSlot(0);}} className="rounded border border-red-200 bg-red-50 py-2 text-xs font-black text-red-600 shadow-sm transition-colors active:scale-95 hover:bg-red-500 hover:text-white sm:text-sm">CLR</button>
                        </div>

                        <div className="mb-4 flex flex-col gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={s1RunsActive} onChange={() => setS1RunsActive(!s1RunsActive)} className="w-4 h-4 accent-blue-600" /> + Predict Exact Runs
                            </label>
                            {s1RunsActive && (
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    <button onClick={() => setS1Runs(Math.max(0, s1Runs - 1))} className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center font-black text-gray-700 hover:bg-gray-300">-</button>
                                    <span className="font-black text-xl w-6 text-center text-blue-700">{s1Runs}</span>
                                    <button onClick={() => setS1Runs(s1Runs + 1)} className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center font-black text-blue-800 hover:bg-blue-200">+</button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={submitS1Bet}
                            disabled={!isS1Complete}
                            className={`w-full rounded-xl py-4 text-xs font-black uppercase shadow-lg transition-all ${
                                !isS1Complete
                                    ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                    : 'bg-[#2b82b8] text-white active:scale-95'
                            }`}
                        >
                            {!isS1Complete ? 'Fill all 6 balls to continue' : 'Add to Bet Slip'}
                        </button>
                </div>
            </div>

            <div className="mb-3 overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
                <div className="border-b border-gray-800 bg-[#101317] p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-black italic uppercase tracking-wide text-white sm:text-base sm:tracking-widest">
                        <PieChart className="h-4 w-4 text-purple-400" />
                        2. Over Mix
                    </span>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-200">
                                Over {overBettingContext.targetOver}
                            </span>
                            <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
                                Peak Return 8x
                            </span>
                        </div>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-gray-400 sm:text-xs">
                        Predict the over composition without caring about order. Keep the total to exactly 6 balls and add runs for the top payout.
                    </p>
                </div>
                <div className="bg-white p-2.5 text-black sm:p-5">
                        <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-2.5 text-[11px] font-medium text-purple-800 sm:p-3 sm:text-xs">
                            <div className="mb-1 flex items-center gap-1 font-bold"><Info className="w-4 h-4"/> How to Play:</div>
                            Predict the total composition of the over regardless of order. Your final mix must equal exactly 6 balls.
                        </div>

                        <div className="mb-4 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
                            <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase text-gray-500"><AlertCircle className="w-3 h-3"/> Return System</p>
                            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold sm:gap-2 sm:text-xs">
                                <div className="bg-gray-100 p-1 rounded text-gray-500">0-2 Correct = Loss</div>
                                <div className="bg-purple-100 p-1 rounded text-purple-800 border border-purple-300">3 Correct = 1x <span className="text-[9px] block">(Money Back)</span></div>
                                <div className="bg-green-100 p-1 rounded text-green-800">4 Correct = 2x</div>
                                <div className="bg-green-100 p-1 rounded text-green-800">5 Correct = 3x</div>
                                <div className="bg-green-200 p-1 rounded text-green-900 border border-green-500 col-span-2">6 Correct = 5x <span className="text-green-700 ml-2">+ Runs = 8x!</span></div>
                            </div>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
                            {Object.keys(s2Comp).map(key => (
                                <div key={key} className="flex justify-between items-center bg-white border border-gray-300 p-2 rounded shadow-sm">
                                    <span className="font-bold text-gray-700 w-6">{key}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleS2Change(key, -1)} className="bg-gray-100 w-7 h-7 rounded flex items-center justify-center font-bold text-gray-600 border border-gray-300 hover:bg-gray-200">-</button>
                                        <span className="font-black text-sm w-4 text-center text-gray-900">{s2Comp[key]}</span>
                                        <button onClick={() => handleS2Change(key, 1)} disabled={s2TotalBalls >= 6} className="bg-purple-100 w-7 h-7 rounded flex items-center justify-center font-bold text-purple-700 border border-purple-300 hover:bg-purple-200 disabled:opacity-50">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4 flex flex-col gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={s2RunsActive} onChange={() => setS2RunsActive(!s2RunsActive)} className="w-4 h-4 accent-purple-600" /> + Predict Exact Runs
                            </label>
                            {s2RunsActive && (
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    <button onClick={() => setS2Runs(Math.max(0, s2Runs - 1))} className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center font-black text-gray-700 hover:bg-gray-300">-</button>
                                    <span className="font-black text-xl w-6 text-center text-purple-700">{s2Runs}</span>
                                    <button onClick={() => setS2Runs(s2Runs + 1)} className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center font-black text-purple-800 hover:bg-purple-200">+</button>
                                </div>
                            )}
                        </div>
                        <button onClick={submitS2Bet} className="w-full bg-[#2b82b8] hover:bg-blue-600 text-white font-black uppercase tracking-widest py-3 rounded shadow-md active:scale-95 transition-all text-sm">Add to Bet Slip</button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
                <div className="border-b border-gray-800 bg-[#101317] p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-black italic uppercase tracking-wide text-white sm:text-base sm:tracking-widest">
                        <Zap className="h-4 w-4 text-green-400" />
                        3. Custom Specifics
                    </span>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-200">
                                Over {overBettingContext.targetOver}
                            </span>
                            <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-green-300">
                                Additive Returns
                            </span>
                        </div>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-gray-400 sm:text-xs">
                        Combine specific over events in one slip. Each pick adds profit to a 1.0x base return, so users can read the payout quickly.
                    </p>
                </div>
                <div className="bg-white p-2.5 text-black sm:p-5">
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-2.5 text-[11px] font-medium text-green-800 sm:p-3 sm:text-xs">
                        <div className="mb-1 flex items-center gap-1 font-bold"><Info className="w-4 h-4"/> How to Play:</div>
                        Build a custom parlay from events inside the over. Every pick adds profit to the 1.0x base return, so this section works like a cleaner version of the other two.
                    </div>

                    <div className="mb-4 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
                        <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase text-gray-500"><AlertCircle className="w-3 h-3"/> Profit System</p>
                        <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] font-bold sm:gap-2 sm:text-xs">
                            <div className="rounded border border-gray-200 bg-gray-50 p-1.5 text-gray-700"><span className="text-gray-900">2, Wide</span> = +0.5x</div>
                            <div className="rounded border border-gray-200 bg-gray-50 p-1.5 text-gray-700"><span className="text-gray-900">4, 6</span> = +1.0x</div>
                            <div className="rounded border border-gray-200 bg-gray-50 p-1.5 text-gray-700"><span className="text-gray-900">W, NB, 3</span> = +2.0x</div>
                            <div className="rounded border border-gray-200 bg-gray-50 p-1.5 text-gray-700"><span className="text-gray-900">Exact Runs</span> = +1.5x</div>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
                        {Object.keys(s3Selections).map(key => {
                            let labelMult = "+0.5x";
                            if (['4', '6'].includes(key)) labelMult = "+1.0x";
                            if (['W', 'NB', '3'].includes(key)) labelMult = "+2.0x";

                            return (
                                <div key={key} className="rounded-lg border border-gray-300 bg-white p-2 shadow-sm">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">{key}</span>
                                            <span className="text-[10px] font-black text-green-600">{labelMult} profit</span>
                                        </div>
                                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-700">
                                            x{s3Selections[key]}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleS3Change(key, -1)} className="h-8 w-8 rounded border border-gray-300 bg-gray-100 font-bold text-gray-600 hover:bg-gray-200">-</button>
                                        <span className="flex-1 text-center text-base font-black text-gray-900">{s3Selections[key]}</span>
                                        <button onClick={() => handleS3Change(key, 1)} className="h-8 w-8 rounded border border-green-300 bg-green-100 font-bold text-green-700 hover:bg-green-200">+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mb-4 rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-gray-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={s3RunsActive} onChange={() => setS3RunsActive(!s3RunsActive)} className="w-4 h-4 accent-green-600" /> + Predict Exact Runs
                                </label>
                                <span className="ml-6 block text-[10px] font-black text-green-600">Adds +1.5x profit</span>
                            </div>
                            {s3RunsActive && (
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    <button onClick={() => setS3Runs(Math.max(0, s3Runs - 1))} className="h-8 w-8 rounded-full bg-gray-200 font-black text-gray-700 hover:bg-gray-300">-</button>
                                    <span className="w-6 text-center text-xl font-black text-green-700">{s3Runs}</span>
                                    <button onClick={() => setS3Runs(s3Runs + 1)} className="h-8 w-8 rounded-full bg-green-100 font-black text-green-800 hover:bg-green-200">+</button>
                                </div>
                            )}
                        </div>
                        <p className="pt-3 text-[11px] font-medium leading-relaxed text-gray-600">
                            Use this when you want a sharper read on one over without filling every ball slot. Stack only the events you really want exposed.
                        </p>
                    </div>

                    <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">Your Bet</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-green-200 bg-white px-3 py-2">
                                <span className="text-[11px] font-black uppercase text-gray-500">Target Over</span>
                                <p className="mt-1 text-sm font-black text-gray-900">Over {overBettingContext.targetOver}</p>
                            </div>
                            <div className="rounded-lg border border-green-200 bg-white px-3 py-2">
                                <span className="text-[11px] font-black uppercase text-gray-500">Active Picks</span>
                                <p className="mt-1 text-sm font-black text-gray-900">{s3TotalPicks}</p>
                            </div>
                            <div className="rounded-lg border border-green-200 bg-white px-3 py-2">
                                <span className="text-[11px] font-black uppercase text-gray-500">Base Return</span>
                                <p className="mt-1 text-sm font-black text-gray-900">1.00x</p>
                            </div>
                            <div className="rounded-lg border border-green-200 bg-white px-3 py-2">
                                <span className="text-[11px] font-black uppercase text-gray-500">Added Profit</span>
                                <p className="mt-1 text-sm font-black text-green-700">+{s3ProfitBoost}x</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-green-200 bg-white p-3">
                            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                                Selected Outcomes
                            </span>
                            {s3SelectionSummary.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {s3SelectionSummary.map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-green-700"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-[11px] font-medium leading-relaxed text-gray-500">
                                    Start selecting outcomes and your custom slip summary will appear here.
                                </p>
                            )}
                        </div>

                        <div className="mt-4 rounded-lg border-2 border-green-400 bg-white p-3 text-center">
                            <span className="mb-1 block text-[10px] font-bold uppercase text-green-800">Final Combined Odds</span>
                            <span className="text-2xl font-black text-green-600 sm:text-3xl">{calculateS3Odds()}x</span>
                        </div>

                        <p className="mt-3 text-[11px] font-bold leading-relaxed text-green-900/80">
                            {overBettingContext.isNextOverLocked
                                ? `Over ${overBettingContext.lockedOver} is locked on ball 6, so this section is now taking entries for Over ${overBettingContext.targetOver}.`
                                : `Entries placed from this section now settle against Over ${overBettingContext.targetOver}.`}
                        </p>
                    </div>

                    <button
                        onClick={submitS3Bet}
                        disabled={!s3HasSelection}
                        className={`w-full rounded py-3 text-sm font-black uppercase tracking-widest text-white shadow-md transition-all ${
                            s3HasSelection
                                ? 'bg-[#2b82b8] active:scale-95 hover:bg-blue-600'
                                : 'cursor-not-allowed bg-gray-400/80 shadow-none'
                        }`}
                    >
                        {s3HasSelection ? 'Add to Bet Slip' : 'Select Outcomes First'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN DASHBOARD
// ==========================================
const Dashboard = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('match_winner');

    const [betSlipConfig, setBetSlipConfig] = useState({
        isOpen: false,
        matchId: null,
        matchTitle: '',
        displaySelection: '',
        selectionPayload: null,
        marketType: 'Match Winner',
        odds: 1.00,
        targetOver: null,
        liveOver: null,
        isNextOverLocked: false,
        lockedOver: null,
    });

    useEffect(() => {
        fetchMatches();
        const interval = setInterval(fetchMatches, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await axios.get('/api/matches/');
            setMatches(
                Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : []
            );
            setLoading(false);
        } catch (err) {
            console.error("Error fetching matches:", err);
            setLoading(false);
        }
    };

    const handleOddsClick = (match, displayTitle, odds, marketType = 'Match Winner', payload = null, betMeta = {}) => {
        setBetSlipConfig({
            isOpen: true,
            matchId: match.id,
            matchTitle: match.title,
            displaySelection: displayTitle,
            selectionPayload: payload ?? displayTitle,
            marketType: marketType,
            odds: parseFloat(odds),
            targetOver: betMeta.targetOver ?? null,
            liveOver: betMeta.liveOverLabel ?? null,
            isNextOverLocked: betMeta.isNextOverLocked ?? false,
            lockedOver: betMeta.lockedOver ?? null,
        });
    };

    if (loading) return <div className="py-20 text-center font-mono text-white animate-pulse">Loading Live Matches...</div>;

    return (
        <div className="mx-auto w-full max-w-7xl px-1 py-2 pb-24 sm:px-2 sm:py-3 lg:pb-8">
            <div className="mb-4 flex items-center gap-2 sm:mb-6">
                <Activity className="h-5 w-5 text-[#22c55e] sm:h-6 sm:w-6" />
                <h1 className="text-xl font-black italic uppercase tracking-wide text-white sm:text-2xl sm:tracking-widest">Live & Upcoming</h1>
            </div>

            {matches.length === 0 ? (
                <div className="text-gray-500 text-center py-10 border border-gray-800 rounded-xl bg-[#121417]">
                    No active matches found. Check back later!
                </div>
            ) : (
                <>
                    <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                        <button
                            onClick={() => setActiveCategory('match_winner')}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                                activeCategory === 'match_winner'
                                    ? 'border border-blue-500 bg-[#0f172a] text-blue-400'
                                    : 'border border-gray-700 bg-transparent text-gray-400 hover:border-gray-500'
                            }`}
                        >
                            <Trophy className="h-4 w-4" />
                            MATCH WINNER
                        </button>
                        <button
                            onClick={() => setActiveCategory('sessions')}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                                activeCategory === 'sessions'
                                    ? 'border border-purple-500 bg-[#2e1065] text-purple-400'
                                    : 'border border-gray-700 bg-transparent text-gray-400 hover:border-gray-500'
                            }`}
                        >
                            <Clock className="h-4 w-4" />
                            SESSIONS
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                        <div className="min-w-0 flex-1 space-y-4">
                        {matches?.map((match) => {
                            const activeSessions = Array.isArray(match.sessions)
                                ? match.sessions.filter((s) => !s.is_completed)
                                : [];

                            return (
                            <div key={match.id} className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#121417] shadow-lg">
                                <div className="flex flex-col lg:flex-row lg:overflow-hidden">
                                    <div className="w-full border-b border-gray-800 lg:w-[320px] lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:border-gray-800">
                                        <div className="flex flex-col gap-4 bg-[#0f1115] p-3 sm:p-5 lg:sticky lg:top-24">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                                    <span className="truncate text-[11px] font-bold uppercase text-gray-400 sm:text-xs">{match.league}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {match.status === 'live' ? <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span> : <Clock className="h-3 w-3 text-gray-500" />}
                                                    <span className={`text-[10px] font-black uppercase tracking-wide sm:text-xs sm:tracking-wider ${match.status === 'live' ? 'text-red-500' : 'text-gray-500'}`}>{match.status}</span>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <h2 className="mb-2 text-lg font-black text-white sm:text-xl">{match.title}</h2>
                                                {match.status === 'live' && match.batting_team ? (
                                                    <div className="inline-block rounded-lg border border-gray-800 bg-black/40 px-4 py-2 sm:px-6">
                                                        <p className="font-mono text-xl font-black text-[#22c55e] sm:text-2xl">{match.runs}/{match.wickets} <span className="ml-1 text-xs text-gray-400 sm:text-sm">({match.overs} ov)</span></p>
                                                    </div>
                                                ) : (
                                                    <p className="font-mono text-xs text-gray-500 sm:text-sm">{new Date(match.match_time).toLocaleString()}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1 p-3 sm:p-5 lg:max-h-[calc(100vh-9.5rem)] lg:overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                                        {activeCategory === 'match_winner' && (
                                            <div className="rounded-xl border border-gray-800 bg-[#1e1e24] p-4">
                                                <div className="mb-4 flex items-end justify-between gap-3 border-l-4 border-blue-500 pl-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Match Winner</p>
                                                    <span className="text-[8px] font-bold uppercase italic text-gray-500">Primary market</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => handleOddsClick(match, `${match.team1_name} to Win`, match.team1_odds)}
                                                        className="flex w-full items-center justify-between rounded-md bg-[#72bbed] px-4 py-3 font-bold text-black transition-all hover:bg-[#5daee3] active:scale-95"
                                                    >
                                                        <span className="mr-2 truncate">{match.team1_name}</span>
                                                        <span>{parseFloat(match.team1_odds || 1.9).toFixed(2)}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOddsClick(match, `${match.team2_name} to Win`, match.team2_odds)}
                                                        className="flex w-full items-center justify-between rounded-md bg-[#faa9ba] px-4 py-3 font-bold text-black transition-all hover:bg-[#f992a7] active:scale-95"
                                                    >
                                                        <span className="mr-2 truncate">{match.team2_name}</span>
                                                        <span>{parseFloat(match.team2_odds || 1.9).toFixed(2)}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {activeCategory === 'sessions' && (
                                            <div className="rounded-xl border border-gray-800 border-l-2 border-l-purple-500 bg-[#1e1e24] p-4">
                                                <div className="mb-3 flex items-end justify-between gap-3 border-l-4 border-purple-600 pl-2 tracking-widest">
                                                    <p className="text-[10px] font-black uppercase text-purple-400">Live Sessions</p>
                                                    <span className="text-[8px] font-bold uppercase italic text-gray-500">Real-time update</span>
                                                </div>

                                                <div className="overflow-hidden rounded-xl border border-gray-800 bg-black/30">
                                                    {activeSessions?.map(s => (
                                                        <div key={s.id} className="relative border-b border-gray-800/50 last:border-0">
                                                            {s.is_locked && (
                                                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-[1px]">
                                                                    <span className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-[9px] font-black uppercase text-white shadow-lg">
                                                                        <Lock className="h-3 w-3"/> Session Closed
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-col sm:flex-row">
                                                                <div className="flex min-h-0 flex-1 items-center px-3 py-3 text-[11px] font-bold text-white sm:px-4">
                                                                    {s.question_text}
                                                                </div>

                                                                <div className="grid grid-cols-2 border-t border-gray-800 sm:flex sm:border-l sm:border-t-0">
                                                                    <button
                                                                        disabled={s.is_locked}
                                                                        onClick={() => handleOddsClick(match, `NO: ${s.question_text}`, s.no_odds, 'SESSION_NO')}
                                                                        className="min-h-[48px] bg-pink-500/10 font-mono font-black text-pink-400 transition-all active:scale-95 hover:bg-pink-500/20 disabled:cursor-not-allowed sm:w-[76px] sm:border-r sm:border-gray-800"
                                                                    >
                                                                        {s.no_odds}
                                                                    </button>

                                                                    <button
                                                                        disabled={s.is_locked}
                                                                        onClick={() => handleOddsClick(match, `YES: ${s.question_text}`, s.yes_odds, 'SESSION_YES')}
                                                                        className="min-h-[48px] border-l border-gray-800 bg-blue-500/10 font-mono font-black text-blue-400 transition-all active:scale-95 hover:bg-blue-500/20 disabled:cursor-not-allowed sm:w-[76px] sm:border-l-0"
                                                                    >
                                                                        {s.yes_odds}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {activeSessions.length === 0 && (
                                                        <div className="p-6 text-center text-[10px] font-bold uppercase italic text-gray-500">
                                                            No active sessions for this match
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                        </div>

                        <aside className="w-full lg:w-[350px] lg:flex-shrink-0">
                            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#121417] shadow-xl lg:sticky lg:top-24">
                                <div className="border-b border-gray-800 bg-[#0f1115] p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Dashboard Panel</p>
                                            <h3 className="mt-1 text-base font-black uppercase tracking-wide text-white">Recent Bets</h3>
                                        </div>
                                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-green-300">
                                            Live Slip
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                                    <MyBets />
                                </div>
                            </div>
                        </aside>
                    </div>
                </>
            )}

            <BetSlipModal 
                isOpen={betSlipConfig.isOpen}
                onClose={() => setBetSlipConfig({...betSlipConfig, isOpen: false})}
                matchId={betSlipConfig.matchId}
                matchTitle={betSlipConfig.matchTitle}
                displaySelection={betSlipConfig.displaySelection}
                selectionPayload={betSlipConfig.selectionPayload}
                marketType={betSlipConfig.marketType}
                odds={betSlipConfig.odds}
                targetOver={betSlipConfig.targetOver}
                liveOver={betSlipConfig.liveOver}
                isNextOverLocked={betSlipConfig.isNextOverLocked}
                lockedOver={betSlipConfig.lockedOver}
            />
        </div>
    );
};

export default Dashboard;
