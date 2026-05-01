import { useState, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import axios from 'axios';

const DepositModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('BANK');
    const [transferType, setTransferType] = useState('IMPS');
    const [utr, setUtr] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeAccount, setActiveAccount] = useState(null);

    useEffect(() => {
        if (isOpen) {
            axios.get('/api/active-bank/')
                .then(res => setActiveAccount(res.data))
                .catch(err => console.error("Error fetching bank info:", err));
        }
    }, [isOpen]);

    const presetAmounts = [500, 1000, 5000, 10000, 25000, 50000, 100000];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e) => {
        setScreenshot(e.target.files?.[0] || null);
        setErrorMsg('');
    };

    const getDepositErrorMessage = (errorData) => {
        if (!errorData) {
            return '';
        }

        if (typeof errorData === 'string') {
            return errorData;
        }

        if (typeof errorData.error === 'string') {
            return errorData.error;
        }

        return Object.entries(errorData)
            .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
    };

    const submitDeposit = async () => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const normalizedUtr = utr.trim();

        if (!token) {
            alert("Session expired. Please login again.");
            return;
        }

        if (!normalizedUtr) {
            alert("Please enter your UTR / reference ID.");
            return;
        }

        if (!screenshot) {
            setErrorMsg('Please upload a payment screenshot to proceed.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('utr_number', normalizedUtr);
            formData.append('method', method);
            formData.append('transferType', transferType);
            formData.append('screenshot', screenshot);

            await axios.post('/api/deposit-request/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            alert("Deposit request and screenshot submitted!");
            onClose();
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = getDepositErrorMessage(errorData);

            if (err.response && err.response.status === 401) {
                alert("Your session has expired. Please log out and log back in to continue.");
            } else {
                console.error("Deposit Error:", errorData || err.message);
                alert(errorMessage || "Error submitting request. Please check the console for details.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
            <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-[#0f1113] p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider italic">Deposit Amount</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex flex-wrap gap-2">
                                {['BANK', 'UPI', 'CRYPTO', 'WHATSAPP'].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setMethod(m)}
                                        className={`px-6 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all ${
                                            method === m 
                                            ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            
                            <p className="text-xs text-red-400 italic">Disclaimer: For faster and more reliable payments, please use the bank transfer option.</p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {presetAmounts.map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => setAmount(amt.toString())}
                                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm py-2 px-4 rounded-full border border-gray-700 transition-all"
                                    >
                                        +{amt}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4">
                                <label className="block text-gray-400 text-sm mb-2 uppercase font-bold tracking-tighter">Enter Amount (INR)</label>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter Amount"
                                    className="w-full bg-black/50 border border-gray-700 text-white p-4 rounded-lg focus:outline-none focus:border-[#22c55e] font-mono text-xl"
                                />
                                <button onClick={() => setAmount('')} className="text-[#22c55e] text-xs mt-2 hover:underline">Clear</button>
                            </div>

                            <button 
                                onClick={() => setStep(2)}
                                disabled={!amount || amount < 500}
                                className="w-full bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest py-4 rounded-lg mt-4 disabled:opacity-50 transition-all active:scale-[0.98]"
                            >
                                Next
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* 2. BACK BUTTON: Allows user to change amount */}
                            <button 
                                onClick={() => setStep(1)} 
                                className="text-gray-500 hover:text-white text-[10px] mb-2 flex items-center gap-1 uppercase font-bold transition-colors"
                            >
                                ← Change Amount
                            </button>

                            <div className="bg-black/50 border border-gray-700 rounded-lg p-4">
                                <h3 className="text-[#22c55e] font-bold mb-4 border-b border-gray-800 pb-2 uppercase tracking-wider text-sm">Active Account Details</h3>
                                {activeAccount ? (
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Bank Account Holder', value: activeAccount.option_name },
                                            { label: 'Account Info / UPI', value: activeAccount.account_info },
                                            { label: 'IFSC Code', value: activeAccount.ifsc },
                                            { label: 'Bank Name', value: activeAccount.bank_name },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center group">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-600 uppercase font-bold">{item.label}</span>
                                                    <span className="text-white font-mono tracking-tight">{item.value}</span>
                                                </div>
                                                <button onClick={() => handleCopy(item.value)} className="text-gray-500 hover:text-white bg-gray-800/50 p-2 rounded transition-colors">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-xs italic text-center py-4">Fetching active bank data...</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {['IMPS', 'NEFT', 'RTGS'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => setTransferType(type)}
                                        className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${
                                            transferType === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-gray-400 text-[10px] font-bold uppercase mb-2">Enter Reference ID / UTR (12 Digits)</label>
                                <input 
                                    type="text" 
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                    placeholder="e.g. 312345678901"
                                    className="w-full bg-black/50 border border-gray-700 text-white p-4 rounded-lg focus:outline-none focus:border-[#22c55e] font-mono tracking-[0.2em]"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-[10px] font-bold uppercase mb-2">Upload Payment Screenshot</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-white"
                                />
                            </div>

                            {errorMsg && (
                                <p className="text-center text-sm text-red-500">
                                    {errorMsg}
                                </p>
                            )}

                            <button 
                                onClick={submitDeposit}
                                disabled={utr.length < 12}
                                className="w-full bg-[#22c55e] hover:bg-green-500 text-black font-black uppercase tracking-widest py-4 rounded-lg mt-4 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(34,197,94,0.2)] active:scale-[0.98]"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {copied && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#22c55e] text-black px-6 py-2 rounded-full font-bold animate-bounce shadow-xl z-[110]">
                    Copied to Clipboard!
                </div>
            )}
        </div>
    );
};

export default DepositModal;
