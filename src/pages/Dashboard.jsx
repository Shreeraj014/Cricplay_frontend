import React from 'react';
import { Home, Trophy, List, User } from 'lucide-react';
import Header from '../components/Header';
import DashboardContent from '../components/Dashboard';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-24 lg:pb-0">
            <Header />

            <div className="mx-auto mt-2 w-full max-w-7xl px-2 sm:px-3 lg:mt-4 lg:px-4">
                <div className="grid grid-cols-12 gap-3 lg:gap-4">
                    <aside className="hidden xl:block xl:col-span-3">
                        <div className="bg-cric-dark sticky top-20 rounded-lg border border-gray-800 p-4">
                            <h3 className="mb-4 border-b border-gray-800 pb-2 text-xs font-bold tracking-widest text-gray-500">SPORTS</h3>
                            <ul className="space-y-1 text-sm text-gray-300">
                                <li className="cursor-pointer rounded bg-cric-green/10 p-2 font-bold text-cric-green">
                                    Cricket
                                </li>
                                <li className="cursor-pointer rounded p-2 transition-all hover:bg-white/5 hover:text-cric-green">Soccer</li>
                                <li className="cursor-pointer rounded p-2 transition-all hover:bg-white/5 hover:text-cric-green">Tennis</li>
                            </ul>
                        </div>
                    </aside>

                    <main className="col-span-12 space-y-3 xl:col-span-9">
                        <div className="flex items-center justify-between gap-3 rounded-lg border-l-4 border-cric-green bg-cric-dark px-3 py-2.5 shadow-lg sm:p-3">
                            <h2 className="text-sm font-bold uppercase tracking-tight sm:text-base lg:text-lg">In-Play Cricket</h2>
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 animate-ping rounded-full bg-cric-green"></span>
                                <span className="text-[10px] font-mono text-gray-400">LIVE</span>
                            </div>
                        </div>

                        <DashboardContent />
                    </main>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-800 bg-cric-dark px-4 py-2.5 lg:hidden">
                <div className="flex flex-col items-center text-cric-green">
                    <Home className="h-5 w-5" />
                    <span className="mt-1 text-[10px]">Home</span>
                </div>
                <div className="flex flex-col items-center text-gray-500">
                    <Trophy className="h-5 w-5" />
                    <span className="mt-1 text-[10px]">Sports</span>
                </div>
                <div className="flex flex-col items-center text-gray-500">
                    <List className="h-5 w-5" />
                    <span className="mt-1 text-[10px]">My Bets</span>
                </div>
                <div className="flex flex-col items-center text-gray-500">
                    <User className="h-5 w-5" />
                    <span className="mt-1 text-[10px]">Account</span>
                </div>
            </nav>
        </div>
    );
};

export default Dashboard;
