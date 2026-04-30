import React, { useState } from 'react';
import { Target, PieChart, Zap, Send } from 'lucide-react';

const MicroBetsPanel = ({ matchTitle, handleBoxClick }) => {
    const [activeTab, setActiveTab] = useState(3); // Defaulting to the new Specifics tab

    // ==========================================
    // SECTION 1: EXACT SEQUENCE (BALL-BY-BALL)
    // ==========================================
    const [s1Balls, setS1Balls] = useState(Array(6).fill(null));
    const [s1ActiveSlot, setS1ActiveSlot] = useState(0);
    const [s1RunsActive, setS1RunsActive] = useState(false);
    const [s1Runs, setS1Runs] = useState(0);

    const keypadOutcomes = ['0', '1', '2', '3', '4', '6', 'W', 'Wd', 'NB'];

    const handleS1Keypad = (val) => {
        const newBalls = [...s1Balls];
        newBalls[s1ActiveSlot] = val;
        setS1Balls(newBalls);
        if (s1ActiveSlot < 5) setS1ActiveSlot(s1ActiveSlot + 1);
    };

    const handleS1Clear = () => {
        setS1Balls(Array(6).fill(null));
        setS1ActiveSlot(0);
    };

    const sendS1ToBetSlip = () => {
        const payload = { sequence: s1Balls, runs: s1RunsActive ? s1Runs : null };
        // Passing 10.0 odds as per your max return rule
        handleBoxClick('yes', { name: "Exact Over Sequence" }, "Sequence", 10.00, payload);
    };

    // ==========================================
    // SECTION 2: OVER MIX
    // ==========================================
    const [s2Comp, setS2Comp] = useState({ '0':0, '1':0, '2':0, '4':0, '6':0, 'W':0, 'Wd':0, 'NB':0 });
    const [s2RunsActive, setS2RunsActive] = useState(false);
    const [s2Runs, setS2Runs] = useState(0);
    
    const s2TotalBalls = Object.values(s2Comp).reduce((a, b) => a + b, 0);

    const handleS2Change = (key, delta) => {
        if (delta > 0 && s2TotalBalls >= 6) return; // Limit to 6 balls
        if (s2Comp[key] + delta < 0) return;
        setS2Comp({ ...s2Comp, [key]: s2Comp[key] + delta });
    };

    const sendS2ToBetSlip = () => {
        const payload = { composition: s2Comp, runs: s2RunsActive ? s2Runs : null };
        // Passing 8.0 odds as per your max return rule
        handleBoxClick('yes', { name: "Over Composition" }, "Mix", 8.00, payload);
    };

    // ==========================================
    // SECTION 3: SPECIFIC PARLAY BUILDER
    // ==========================================
    const [s3Selections, setS3Selections] = useState({ '0':0, '1':0, '2':0, '3':0, '4':0, '6':0, 'W':0, 'Wd':0, 'NB':0 });
    const [s3RunsActive, setS3RunsActive] = useState(false);
    const [s3Runs, setS3Runs] = useState(0);

    const handleS3Change = (key, delta) => {
        if (s3Selections[key] + delta < 0) return;
        setS3Selections({ ...s3Selections, [key]: s3Selections[key] + delta });
    };

    // Dynamic Odds Calculator based on your exact rules
    const calculateS3Odds = () => {
        let multiplier = 1.0;
        let hasSelection = false;

        // 1.5x Return: 0, 1, 2, Wide
        ['0', '1', '2', 'Wd'].forEach(key => {
            for(let i=0; i<s3Selections[key]; i++) { multiplier *= 1.5; hasSelection = true; }
        });

        // 2.0x Return: 4, 6
        ['4', '6'].forEach(key => {
            for(let i=0; i<s3Selections[key]; i++) { multiplier *= 2.0; hasSelection = true; }
        });

        // 3.0x Return: Wicket, No Ball, 3
        ['W', 'NB', '3'].forEach(key => {
            for(let i=0; i<s3Selections[key]; i++) { multiplier *= 3.0; hasSelection = true; }
        });

        // 2.5x Return: Over Runs
        if (s3RunsActive) {
            multiplier *= 2.5;
            hasSelection = true;
        }

        return hasSelection ? multiplier.toFixed(2) : "0.00";
    };

    const sendS3ToBetSlip = () => {
        const finalOdds = calculateS3Odds();
        if (finalOdds === "0.00") return alert("Please select at least one outcome.");
        
        const payload = { specifics: s3Selections, exactRuns: s3RunsActive ? s3Runs : null };
        handleBoxClick('yes', { name: "Custom Over Specifics" }, "Parlay", parseFloat(finalOdds), payload);
    };

    return (
        <div className="bg-white shadow-md border border-[#2b82b8] mt-4 font-sans">
            {/* Header Tabs - Exchange Style */}
            <div className="flex bg-[#2b82b8] text-white text-xs font-bold">
                <button onClick={() => setActiveTab(1)} className={`flex-1 py-2 flex items-center justify-center gap-2 ${activeTab === 1 ? 'bg-[#1a5b82]' : 'hover:bg-[#206994]'}`}>
                    <Target className="w-4 h-4" /> EXACT SEQUENCE
                </button>
                <button onClick={() => setActiveTab(2)} className={`flex-1 py-2 flex items-center justify-center gap-2 border-l border-[#4095c7] ${activeTab === 2 ? 'bg-[#1a5b82]' : 'hover:bg-[#206994]'}`}>
                    <PieChart className="w-4 h-4" /> OVER MIX
                </button>
                <button onClick={() => setActiveTab(3)} className={`flex-1 py-2 flex items-center justify-center gap-2 border-l border-[#4095c7] ${activeTab === 3 ? 'bg-[#1a5b82]' : 'hover:bg-[#206994]'}`}>
                    <Zap className="w-4 h-4" /> SPECIFICS
                </button>
            </div>

            <div className="p-4 bg-[#f8f9fa]">
                
                {/* ==========================================
                    TAB 1: EXACT SEQUENCE
                ========================================== */}
                {activeTab === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <p className="text-xs text-center text-gray-600 font-bold mb-2">Predict all 6 balls. Max Return: 10x</p>
                        
                        {/* 6 Ball Slots */}
                        <div className="flex gap-2 justify-center">
                            {s1Balls.map((ball, idx) => (
                                <div 
                                    key={idx} onClick={() => setS1ActiveSlot(idx)}
                                    className={`w-12 h-12 flex flex-col items-center justify-center border-2 cursor-pointer bg-white ${s1ActiveSlot === idx ? 'border-blue-600 shadow-inner' : 'border-gray-300'}`}
                                >
                                    <span className="text-[9px] text-gray-500 font-bold">B{idx+1}</span>
                                    <span className="font-black text-lg text-gray-800">{ball || '-'}</span>
                                </div>
                            ))}
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
                            {keypadOutcomes.map(out => (
                                <button key={out} onClick={() => handleS1Keypad(out)} className="bg-white border border-gray-400 py-1.5 font-bold text-gray-800 hover:bg-[#87cefa] hover:border-blue-500 shadow-sm">
                                    {out}
                                </button>
                            ))}
                            <button onClick={handleS1Clear} className="bg-red-100 text-red-700 border border-red-300 py-1.5 font-bold hover:bg-red-200 shadow-sm">
                                CLR
                            </button>
                        </div>

                        {/* Optional Total Runs */}
                        <div className="flex items-center justify-between border-t border-gray-300 pt-4 max-w-sm mx-auto">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={s1RunsActive} onChange={() => setS1RunsActive(!s1RunsActive)} className="w-4 h-4" />
                                Predict Total Runs
                            </label>
                            {s1RunsActive && (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setS1Runs(Math.max(0, s1Runs - 1))} className="bg-gray-200 w-8 h-8 font-black text-gray-700 hover:bg-gray-300 border border-gray-400">-</button>
                                    <span className="font-black text-lg w-6 text-center">{s1Runs}</span>
                                    <button onClick={() => setS1Runs(s1Runs + 1)} className="bg-[#bce0fd] w-8 h-8 font-black text-blue-800 hover:bg-[#87cefa] border border-blue-400">+</button>
                                </div>
                            )}
                        </div>

                        <button onClick={sendS1ToBetSlip} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 shadow-md flex justify-center items-center gap-2 uppercase tracking-wide">
                            <Send className="w-4 h-4" /> Send to Bet Slip
                        </button>
                    </div>
                )}

                {/* ==========================================
                    TAB 2: OVER MIX
                ========================================== */}
                {activeTab === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <p className="text-xs text-center text-gray-600 font-bold mb-2">Predict composition (Order doesn't matter). Total: {s2TotalBalls}/6</p>
                        
                        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                            {Object.keys(s2Comp).map(key => (
                                <div key={key} className="flex justify-between items-center bg-white border border-gray-300 p-2 shadow-sm">
                                    <span className="font-bold text-gray-800 w-6">{key}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleS2Change(key, -1)} className="bg-gray-200 w-6 h-6 flex items-center justify-center font-bold text-gray-700 border border-gray-400 hover:bg-gray-300">-</button>
                                        <span className="font-black w-4 text-center">{s2Comp[key]}</span>
                                        <button onClick={() => handleS2Change(key, 1)} disabled={s2TotalBalls >= 6} className="bg-[#bce0fd] w-6 h-6 flex items-center justify-center font-bold text-blue-800 border border-blue-400 hover:bg-[#87cefa] disabled:opacity-50">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-300 pt-4 max-w-sm mx-auto">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={s2RunsActive} onChange={() => setS2RunsActive(!s2RunsActive)} className="w-4 h-4" />
                                Predict Total Runs
                            </label>
                            {s2RunsActive && (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setS2Runs(Math.max(0, s2Runs - 1))} className="bg-gray-200 w-8 h-8 font-black text-gray-700 hover:bg-gray-300 border border-gray-400">-</button>
                                    <span className="font-black text-lg w-6 text-center">{s2Runs}</span>
                                    <button onClick={() => setS2Runs(s2Runs + 1)} className="bg-[#bce0fd] w-8 h-8 font-black text-blue-800 hover:bg-[#87cefa] border border-blue-400">+</button>
                                </div>
                            )}
                        </div>

                        <button onClick={sendS2ToBetSlip} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 shadow-md flex justify-center items-center gap-2 uppercase tracking-wide">
                            <Send className="w-4 h-4" /> Send to Bet Slip
                        </button>
                    </div>
                )}

                {/* ==========================================
                    TAB 3: SPECIFICS (DYNAMIC MULTIPLIER)
                ========================================== */}
                {activeTab === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <p className="text-xs text-center text-gray-600 font-bold mb-2">Build your custom specific prediction!</p>

                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                            {/* Loop through selections and show correct multipliers */}
                            {Object.keys(s3Selections).map(key => {
                                let labelMult = "1.5x";
                                if (['4','6'].includes(key)) labelMult = "2.0x";
                                if (['W','NB','3'].includes(key)) labelMult = "3.0x";

                                return (
                                    <div key={key} className="flex justify-between items-center bg-white border border-gray-300 p-2 shadow-sm">
                                        <div>
                                            <span className="font-bold text-gray-800 block text-sm">{key}</span>
                                            <span className="text-[10px] font-black text-green-600">{labelMult}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleS3Change(key, -1)} className="bg-gray-200 w-6 h-6 flex items-center justify-center font-bold text-gray-700 border border-gray-400 hover:bg-gray-300">-</button>
                                            <span className="font-black w-4 text-center">{s3Selections[key]}</span>
                                            <button onClick={() => handleS3Change(key, 1)} className="bg-[#bce0fd] w-6 h-6 flex items-center justify-center font-bold text-blue-800 border border-blue-400 hover:bg-[#87cefa]">+</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Over Runs Multiplier (2.5x) */}
                        <div className="flex items-center justify-between border-t border-gray-300 pt-4 max-w-sm mx-auto">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={s3RunsActive} onChange={() => setS3RunsActive(!s3RunsActive)} className="w-4 h-4" />
                                    Exact Total Runs
                                </label>
                                <span className="text-[10px] font-black text-green-600 block ml-6">2.5x Multiplier</span>
                            </div>
                            
                            {s3RunsActive && (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setS3Runs(Math.max(0, s3Runs - 1))} className="bg-gray-200 w-8 h-8 font-black text-gray-700 hover:bg-gray-300 border border-gray-400">-</button>
                                    <span className="font-black text-lg w-6 text-center">{s3Runs}</span>
                                    <button onClick={() => setS3Runs(s3Runs + 1)} className="bg-[#bce0fd] w-8 h-8 font-black text-blue-800 hover:bg-[#87cefa] border border-blue-400">+</button>
                                </div>
                            )}
                        </div>

                        {/* FINAL ODDS DISPLAY */}
                        <div className="bg-[#1a5b82] text-white p-3 text-center border-2 border-green-400 mt-4 max-w-sm mx-auto">
                            <span className="text-xs uppercase font-bold text-blue-200 block mb-1">Calculated Return Multiplier</span>
                            <span className="text-2xl font-black text-green-400">{calculateS3Odds()}x</span>
                        </div>

                        <button onClick={sendS3ToBetSlip} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 shadow-md flex justify-center items-center gap-2 uppercase tracking-wide">
                            <Send className="w-5 h-5" /> Send to Bet Slip
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MicroBetsPanel;