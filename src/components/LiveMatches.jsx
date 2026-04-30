import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radio, ChevronRight, Zap } from 'lucide-react';

const LiveMatches = () => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await axios.get('/api/matches/');
                setMatches(res.data);
            } catch (err) {
                console.error("API Error:", err);
            }
        };
        fetchMatches();
        const interval = setInterval(fetchMatches, 1000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4 pb-10">
            {matches.map(match => (
                <div key={match.id} className="bg-cric-dark border border-gray-800 rounded-xl overflow-hidden shadow-2xl transition-all">
                    
                    {/* Header: League & Live Indicator */}
                    <div className="bg-black/40 p-2.5 flex justify-between items-center border-b border-gray-800/50">
                        <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <Radio className="w-3.5 h-3.5 text-red-600 mr-2 animate-pulse" /> 
                            {match.league}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    match.is_betting_open
                                        ? 'text-cric-green bg-cric-green/10'
                                        : 'text-red-400 bg-red-900/50'
                                }`}
                            >
                                {match.is_betting_open ? 'MARKET OPEN' : 'MARKET SUSPENDED'}
                            </span>
                        </div>
                    </div>

                    {/* Main Match Content */}
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            {/* Scoreboard Section */}
                            <div className="flex-1">
                                <h3 className="text-white font-black text-lg lg:text-xl tracking-tight uppercase">
                                    {match.title}
                                </h3>
                                <div className="flex items-center mt-2 space-x-4">
                                    <div className="flex items-center">
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        <p className="text-cric-green font-mono text-2xl lg:text-3xl font-black">
                                            {match.runs}/{match.wickets}
                                        </p>
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-bold bg-white/5 px-3 py-1 rounded-full border border-gray-700">
                                        OVER {match.overs}
                                    </span>
                                </div>
                            </div>

                            {/* Prediction Modes Quick Access */}
                            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                                <div className="bg-black/40 border border-gray-800 p-2 rounded-lg text-center">
                                    <span className="block text-[8px] text-gray-500 font-bold uppercase">Ball-By-Ball</span>
                                    <span className="text-xs font-black text-yellow-500">10x</span>
                                </div>
                                <div className="bg-black/40 border border-gray-800 p-2 rounded-lg text-center">
                                    <span className="block text-[8px] text-gray-500 font-bold uppercase">Over Dist</span>
                                    <span className="text-xs font-black text-sky-400">5x</span>
                                </div>
                                <div className="bg-black/40 border border-gray-800 p-2 rounded-lg text-center">
                                    <span className="block text-[8px] text-gray-500 font-bold uppercase">Custom</span>
                                    <span className="text-xs font-black text-cric-green">2x</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Area: This opens the unique betting modes */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            {match.is_betting_open ? (
                                <button className="flex-1 bg-green-500 hover:bg-green-400 text-black font-black py-3 px-4 rounded-lg flex items-center justify-between group transition-all active:scale-[0.98] shadow-lg shadow-green-900/20">
                                    <span className="flex items-center uppercase text-xs tracking-tighter">
                                        <Zap className="w-4 h-4 mr-2 fill-current" />
                                        Enter Betting Terminal
                                    </span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="flex-1 bg-red-900/50 text-red-400 border border-red-900/50 font-black py-3 px-4 rounded-lg flex items-center justify-center cursor-not-allowed uppercase text-xs tracking-widest"
                                >
                                    Market Suspended
                                </button>
                            )}
                            
                            <button className="sm:w-32 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-xs uppercase transition-all">
                                Win Odds
                            </button>
                        </div>
                    </div>

                    {/* Bottom Ticker: Social/Live Proof */}
                    <div className="bg-black/60 px-4 py-2 flex items-center justify-between border-t border-gray-800">
                        <span className="text-[9px] text-gray-500 font-bold italic">
                            Next Over: {Math.floor(match.overs) + 1}.1 Prediction Starting Soon...
                        </span>
                        <div className="flex -space-x-2">
                             {[1,2,3].map(i => (
                                 <div key={i} className="w-4 h-4 rounded-full bg-gray-700 border border-cric-dark flex items-center justify-center text-[6px] font-bold">
                                     {i}
                                 </div>
                             ))}
                             <span className="text-[8px] text-gray-500 ml-4">+412 betting now</span>
                        </div>
                    </div>
                </div>
            ))}
            
            {matches.length === 0 && (
                <div className="text-center py-20 bg-cric-dark rounded-xl border border-dashed border-gray-800">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Searching for Live Feeds...</p>
                </div>
            )}
        </div>
    );
};

export default LiveMatches;
