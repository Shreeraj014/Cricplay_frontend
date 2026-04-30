import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DepositRequestList = () => {
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('/api/my-deposits/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(
                Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.results)
                        ? res.data.results
                        : []
            );
        };

        fetchRequests();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-3 py-4 pb-24 text-white sm:px-4">
            <div className="mx-auto w-full max-w-4xl">
                <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-gray-800 bg-[#1a1c23] p-2">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-black uppercase italic tracking-wide sm:text-xl sm:tracking-widest">My Deposits</h1>
                </div>

                <div className="space-y-4">
                    {requests?.map((req) => (
                        <div key={req.id} className="rounded-2xl border border-gray-800 bg-[#121417] p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</p>
                                    <p className="font-mono text-lg font-black text-white sm:text-xl">Rs {req.amount}</p>
                                </div>
                                <div className={`flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
                                    req.status === 'approved'
                                        ? 'border-green-500 bg-green-500/10 text-green-500'
                                        : req.status === 'rejected'
                                            ? 'border-red-500 bg-red-500/10 text-red-500'
                                            : 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                                }`}>
                                    {req.status === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    {req.status}
                                </div>
                            </div>
                            <div className="mt-4 border-t border-gray-800 pt-4">
                                <p className="break-all text-[10px] font-bold uppercase text-gray-500">
                                    UTR:
                                    <span className="ml-2 font-mono text-gray-300">{req.utr_number}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DepositRequestList;
