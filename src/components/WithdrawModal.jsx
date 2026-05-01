import React, { useState, useEffect } from 'react';
import { X, Plus, Landmark, ShieldCheck, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const MIN_WITHDRAWAL_AMOUNT = 1000;

const WithdrawModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('list'); // 'list' or 'add'
    const [savedAccounts, setSavedAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [amount, setAmount] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    // Form State for new bank
    const [newBank, setNewBank] = useState({
        account_holder: '',
        account_number: '',
        ifsc_code: '',
        bank_name: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchBanks();
            setStep('list');
            setErrorMsg('');
        }
    }, [isOpen]);

    const fetchBanks = () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        axios.get('/api/my-bank-accounts/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setSavedAccounts(
            Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.results)
                    ? res.data.results
                    : []
        ))
        .catch(err => console.log("Fetch Banks Error:", err));
    };

    const handleAddBank = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            alert("Authentication missing. Please login again.");
            return;
        }

        axios.post('/api/my-bank-accounts/', newBank, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            fetchBanks(); // Refresh the list
            setStep('list'); // Go back to selection screen
            setNewBank({ account_holder: '', account_number: '', ifsc_code: '', bank_name: '' });
        })
        .catch(err => {
            if (err.response && err.response.status === 401) {
                alert("Your session has expired. Please log out and log back in to continue.");
            } else {
                console.error("Backend Error Response:", err.response?.data);
                const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Network Error";
                alert(`Error saving bank details: ${errorMsg}`);
            }
        });
    };

    const handleWithdraw = () => {
        setErrorMsg('');
        const token = localStorage.getItem('access_token');

        if (!token) {
            setErrorMsg("Authentication missing. Please login again.");
            return;
        }

        const withdrawalAmount = Number(amount);

        if (!Number.isFinite(withdrawalAmount) || withdrawalAmount < MIN_WITHDRAWAL_AMOUNT) {
            setErrorMsg(`Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT}.`);
            return;
        }

        if (!selectedAccount) {
            setErrorMsg("Please select a bank account.");
            return;
        }

        axios.post('/api/request-withdrawal/', {
            amount: withdrawalAmount,
            bank_id: selectedAccount
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            alert("Withdrawal Request Placed!");
            onClose();
            setAmount('');
            setErrorMsg('');
        })
        .catch(err => {
            if (err.response && err.response.status === 401) {
                alert("Your session has expired. Please log out and log back in to continue.");
            } else {
                setErrorMsg(err.response?.data?.error || "Error placing request");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex justify-center items-center p-4">
            <div className="bg-[#121417] w-full max-w-xl rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="p-4 bg-red-500/5 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {step === 'add' && <ArrowLeft onClick={() => setStep('list')} className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />}
                        <h2 className="text-white font-black italic uppercase tracking-tighter">Withdraw Funds</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6">
                    {step === 'list' ? (
                        <div className="space-y-6">
                            {/* Saved Accounts Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {savedAccounts?.map(acc => (
                                    <div 
                                        key={acc.id}
                                        onClick={() => {
                                            setSelectedAccount(acc.id);
                                            setErrorMsg('');
                                        }}
                                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                            selectedAccount === acc.id ? 'border-red-500 bg-red-500/5' : 'border-gray-800 bg-black/40'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Landmark className="text-gray-600 w-4 h-4" />
                                            {selectedAccount === acc.id && <ShieldCheck className="text-red-500 w-4 h-4" />}
                                        </div>
                                        <p className="text-white font-mono font-bold text-sm">{acc.account_number}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{acc.bank_name}</p>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => setStep('add')}
                                    className="border-2 border-dashed border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-all text-gray-500 hover:text-white"
                                >
                                    <Plus className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-bold uppercase">Add Bank</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase">Amount to Withdraw</label>
                                <input 
                                    type="number"
                                    min={MIN_WITHDRAWAL_AMOUNT}
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setErrorMsg('');
                                    }}
                                    placeholder={`Min: ${MIN_WITHDRAWAL_AMOUNT}`}
                                    className="w-full bg-black border border-gray-800 p-4 rounded text-white font-mono text-xl focus:border-red-500 outline-none"
                                />
                            </div>

                            {errorMsg && (
                                <p className="text-center text-sm font-bold text-red-500">
                                    {errorMsg}
                                </p>
                            )}

                            <button 
                                onClick={handleWithdraw}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-lg shadow-lg active:scale-95 transition-all uppercase tracking-widest"
                            >
                                Request Withdrawal
                            </button>
                        </div>
                    ) : (
                        /* ADD BANK FORM */
                        <form onSubmit={handleAddBank} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Account Holder Name</label>
                                    <input required type="text" value={newBank.account_holder} onChange={(e) => setNewBank({...newBank, account_holder: e.target.value})} className="w-full bg-black border border-gray-800 p-3 rounded text-white text-sm outline-none focus:border-blue-500" placeholder="e.g. John Doe" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Account Number</label>
                                    <input required type="text" value={newBank.account_number} onChange={(e) => setNewBank({...newBank, account_number: e.target.value})} className="w-full bg-black border border-gray-800 p-3 rounded text-white text-sm outline-none focus:border-blue-500" placeholder="0000 0000 0000" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">IFSC Code / Swift</label>
                                    <input required type="text" value={newBank.ifsc_code} onChange={(e) => setNewBank({...newBank, ifsc_code: e.target.value})} className="w-full bg-black border border-gray-800 p-3 rounded text-white text-sm outline-none focus:border-blue-500" placeholder="BANK000123" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Bank Name</label>
                                    <input required type="text" value={newBank.bank_name} onChange={(e) => setNewBank({...newBank, bank_name: e.target.value})} className="w-full bg-black border border-gray-800 p-3 rounded text-white text-sm outline-none focus:border-blue-500" placeholder="Main Street Bank" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-lg uppercase tracking-widest text-xs transition-all">Save Bank Account</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;
