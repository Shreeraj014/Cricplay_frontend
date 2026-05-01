import { useEffect, useState } from 'react';
import { X, Copy } from 'lucide-react';
import axios from 'axios';

const METHOD_TABS = ['BANK', 'UPI', 'CRYPTO'];
const BANK_TRANSFER_TYPES = ['IMPS', 'NEFT', 'RTGS'];
const TELEGRAM_SUPPORT_URL = 'https://t.me/CricPlay_Official';

const normalizeMethod = (value) => String(value || '').toUpperCase();

const getMethodLabel = (method, index) => {
    if (!method) {
        return `Option ${index + 1}`;
    }

    return method.option_name
        || method.account_holder
        || method.account_name
        || method.bank_name
        || `${normalizeMethod(method.method_type || method.method) || 'PAYMENT'} ${index + 1}`;
};

const getMethodDetails = (method) => {
    if (!method) {
        return [];
    }

    const normalizedMethod = normalizeMethod(method.method_type || method.method);
    const accountHolder = method.account_holder || method.account_name || method.option_name || 'Not provided';
    const accountInfo = method.account_info || method.account_number_or_upi || 'Not provided';

    if (normalizedMethod === 'BANK') {
        return [
            { label: 'Account Holder', value: accountHolder },
            { label: 'Account Number', value: accountInfo },
            { label: 'IFSC Code', value: method.ifsc_code || 'Not provided' },
            { label: 'Bank Name', value: method.bank_name || 'Bank Transfer' },
        ];
    }

    if (normalizedMethod === 'UPI') {
        return [
            { label: 'Account Holder', value: accountHolder },
            { label: 'UPI ID', value: accountInfo },
            { label: 'Provider', value: method.bank_name || 'UPI Payment' },
        ];
    }

    return [
        { label: 'Method', value: normalizedMethod || 'Payment' },
        { label: 'Label', value: method.option_name || accountHolder },
        { label: 'Payment Info', value: accountInfo },
    ];
};

const DepositModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('');
    const [activeTab, setActiveTab] = useState('BANK');
    const [transferType, setTransferType] = useState('IMPS');
    const [utr, setUtr] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethodId, setSelectedMethodId] = useState(null);
    const [methodsLoading, setMethodsLoading] = useState(false);
    const [methodsError, setMethodsError] = useState('');

    const presetAmounts = [500, 1000, 5000, 10000, 25000, 50000, 100000];

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        let isCancelled = false;

        setStep(1);
        setAmount('');
        setActiveTab('BANK');
        setTransferType('IMPS');
        setUtr('');
        setScreenshot(null);
        setErrorMsg('');
        setCopied(false);
        setPaymentMethods([]);
        setSelectedMethodId(null);
        setMethodsLoading(true);
        setMethodsError('');

        const fetchMethods = async () => {
            try {
                const response = await axios.get('/api/admin-payment-methods/');
                const methods = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.results)
                        ? response.data.results
                        : [];

                if (isCancelled) {
                    return;
                }

                setPaymentMethods(methods);

                const initialMethod = methods.find((item) => normalizeMethod(item.method_type || item.method) === 'BANK')
                    || methods.find((item) => METHOD_TABS.includes(normalizeMethod(item.method_type || item.method)))
                    || null;
                const initialTab = initialMethod ? normalizeMethod(initialMethod.method_type || initialMethod.method) : 'BANK';

                setActiveTab(initialTab);
                setSelectedMethodId(initialMethod?.id ?? null);
                setTransferType(initialTab === 'BANK' ? 'IMPS' : initialTab);
            } catch (err) {
                if (!isCancelled) {
                    console.error('Error fetching payment methods:', err.response?.data || err.message);
                    setMethodsError('Unable to load payment methods right now.');
                }
            } finally {
                if (!isCancelled) {
                    setMethodsLoading(false);
                }
            }
        };

        fetchMethods();

        return () => {
            isCancelled = true;
        };
    }, [isOpen]);

    const filteredMethods = paymentMethods.filter((item) => normalizeMethod(item.method_type || item.method) === activeTab);
    const selectedMethod = filteredMethods.find((item) => item.id === selectedMethodId) || filteredMethods[0] || null;
    const selectedMethodDetails = getMethodDetails(selectedMethod);
    const qrCodeUrl = selectedMethod?.qr_code_url || selectedMethod?.qr_code || '';

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (filteredMethods.length === 0) {
            setSelectedMethodId(null);
            return;
        }

        const hasSelectedMethod = filteredMethods.some((item) => item.id === selectedMethodId);
        if (!hasSelectedMethod) {
            setSelectedMethodId(filteredMethods[0].id);
        }
    }, [filteredMethods, selectedMethodId, isOpen]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTransferType(tab === 'BANK' ? 'IMPS' : tab);
        setErrorMsg('');

        const nextMethod = paymentMethods.find((item) => normalizeMethod(item.method_type || item.method) === tab);
        setSelectedMethodId(nextMethod?.id ?? null);
    };

    const handleCopy = (text) => {
        if (!text || text === 'Not provided') {
            return;
        }

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
            alert('Session expired. Please login again.');
            return;
        }

        if (!selectedMethod) {
            setErrorMsg('Please choose an active payment method first.');
            return;
        }

        if (!normalizedUtr) {
            alert('Please enter your UTR / reference ID.');
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
            formData.append('method', activeTab);
            formData.append('transferType', activeTab === 'BANK' ? transferType : activeTab);
            formData.append('selected_account_id', String(selectedMethod.id));
            formData.append('screenshot', screenshot);

            await axios.post('/api/deposit-request/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Deposit request and screenshot submitted!');
            onClose();
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = getDepositErrorMessage(errorData);

            if (err.response && err.response.status === 401) {
                alert('Your session has expired. Please log out and log back in to continue.');
            } else {
                console.error('Deposit Error:', errorData || err.message);
                alert(errorMessage || 'Error submitting request. Please check the console for details.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-700 bg-[#1a1a1a] shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 bg-[#0f1113] p-4">
                    <h2 className="text-xl font-black uppercase italic tracking-wider text-white">Deposit Amount</h2>
                    <button onClick={onClose} className="text-gray-400 transition-colors hover:text-red-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="animate-in space-y-6 fade-in duration-300">
                            <div className="flex flex-wrap gap-2">
                                {METHOD_TABS.map((tab) => {
                                    const hasMethods = paymentMethods.some((item) => normalizeMethod(item.method_type || item.method) === tab);

                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => handleTabChange(tab)}
                                            className={`rounded px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                                                activeTab === tab
                                                    ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                        >
                                            {tab}
                                            {!hasMethods ? ' (0)' : ''}
                                        </button>
                                    );
                                })}
                                <a
                                    href={TELEGRAM_SUPPORT_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1 rounded-md border border-[#0088cc]/30 bg-[#0088cc]/10 px-3 py-2 text-[10px] font-bold uppercase text-[#0088cc] transition-all hover:bg-[#0088cc]/20 active:scale-95"
                                >
                                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.441-.168.572-.372.763-.576.782-.449.041-.789-.297-1.224-.582-.68-.446-1.064-.722-1.724-1.157-.763-.502-.269-.778.167-1.229.114-.118 2.086-1.914 2.124-2.077.005-.02.009-.096-.037-.137s-.112-.027-.161-.016c-.07.015-1.18.75-3.327 2.196-.315.216-.599.322-.852.317-.278-.006-.814-.157-1.212-.287-.488-.16-1.156-.245-1.122-.517.018-.142.214-.287.589-.436 2.311-1.006 3.851-1.67 4.622-1.991 2.2-.912 2.656-1.07 2.954-1.075.066-.001.213.016.309.094.08.066.103.155.107.224.004.07.001.219-.015.362z" />
                                    </svg>
                                    Support
                                </a>
                            </div>

                            <p className="text-xs italic text-red-400">
                                Disclaimer: For faster and more reliable payments, please use the bank transfer option.
                            </p>

                            {methodsError ? (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {methodsError}
                                </div>
                            ) : null}

                            {!methodsLoading && filteredMethods.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-700 bg-black/30 px-4 py-5 text-center text-sm text-gray-400">
                                    No active {activeTab} account is available right now.
                                </div>
                            ) : null}

                            <div className="flex flex-wrap gap-2">
                                {presetAmounts.map((presetAmount) => (
                                    <button
                                        key={presetAmount}
                                        onClick={() => setAmount(presetAmount.toString())}
                                        className="rounded-full border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-sm text-gray-300 transition-all hover:bg-gray-700"
                                    >
                                        +{presetAmount}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold uppercase tracking-tighter text-gray-400">Enter Amount (INR)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter Amount"
                                    className="w-full rounded-lg border border-gray-700 bg-black/50 p-4 font-mono text-xl text-white focus:border-[#22c55e] focus:outline-none"
                                />
                                <button onClick={() => setAmount('')} className="mt-2 text-xs text-[#22c55e] hover:underline">Clear</button>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!amount || Number(amount) < 500 || methodsLoading || !selectedMethod}
                                className="mt-4 w-full rounded-lg bg-white py-4 font-black uppercase tracking-widest text-black transition-all active:scale-[0.98] hover:bg-gray-200 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in space-y-6 fade-in slide-in-from-right-4 duration-300">
                            <button
                                onClick={() => setStep(1)}
                                className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500 transition-colors hover:text-white"
                            >
                                &lt; Change Amount
                            </button>

                            <div className="rounded-lg border border-gray-700 bg-black/50 p-4">
                                <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-2">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#22c55e]">Payment Destination</h3>
                                    <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                                        {activeTab}
                                    </span>
                                </div>

                                {filteredMethods.length > 1 ? (
                                    <div className="mb-4 grid gap-2 sm:grid-cols-2">
                                        {filteredMethods.map((account, index) => (
                                            <button
                                                key={account.id}
                                                onClick={() => setSelectedMethodId(account.id)}
                                                className={`rounded-lg border px-3 py-3 text-left transition-all ${
                                                    selectedMethod?.id === account.id
                                                        ? 'border-[#22c55e] bg-[#22c55e]/10 text-white'
                                                        : 'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-700'
                                                }`}
                                            >
                                                <p className="text-xs font-black uppercase tracking-wide">{getMethodLabel(account, index)}</p>
                                                <p className="mt-1 truncate font-mono text-[11px] text-gray-400">
                                                    {account.account_info || account.account_number_or_upi || 'No account info'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}

                                {methodsLoading ? (
                                    <p className="py-4 text-center text-xs italic text-gray-500">Loading active payment methods...</p>
                                ) : !selectedMethod ? (
                                    <p className="py-4 text-center text-xs italic text-gray-500">No active payment method found for this tab.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {normalizeMethod(selectedMethod.method_type || selectedMethod.method) === 'UPI' && qrCodeUrl ? (
                                            <div className="rounded-xl border border-gray-800 bg-[#121417] p-4 text-center">
                                                <p className="mb-3 text-sm font-bold text-white">Scan QR or Copy UPI ID</p>
                                                <img src={qrCodeUrl} alt="UPI QR" className="mx-auto mb-4 h-48 w-48 rounded-lg border border-gray-800 bg-white p-2 object-contain" />
                                                <button
                                                    onClick={() => handleCopy(selectedMethod.account_info || selectedMethod.account_number_or_upi)}
                                                    className="mx-auto flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-mono text-sm text-blue-300 transition-colors hover:bg-blue-500/20"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    {selectedMethod.account_info || selectedMethod.account_number_or_upi}
                                                </button>
                                            </div>
                                        ) : null}

                                        <div className="space-y-4">
                                            {selectedMethodDetails.map((item, index) => (
                                                <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 rounded-lg border border-gray-800 bg-[#121417] p-3">
                                                    <div className="min-w-0">
                                                        <span className="text-[10px] font-bold uppercase text-gray-600">{item.label}</span>
                                                        <p className="break-all font-mono tracking-tight text-white">{item.value}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(item.value)}
                                                        className="rounded bg-gray-800/70 p-2 text-gray-500 transition-colors hover:text-white"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {activeTab === 'BANK' ? (
                                <div className="flex gap-2">
                                    {BANK_TRANSFER_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setTransferType(type)}
                                            className={`flex-1 rounded py-2 text-xs font-bold uppercase transition-all ${
                                                transferType === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-gray-800 bg-[#121417] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    Transfer Type: {activeTab}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-[10px] font-bold uppercase text-gray-400">Enter Reference ID / UTR (12 Digits)</label>
                                <input
                                    type="text"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                    placeholder="e.g. 312345678901"
                                    className="w-full rounded-lg border border-gray-700 bg-black/50 p-4 font-mono tracking-[0.2em] text-white focus:border-[#22c55e] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[10px] font-bold uppercase text-gray-400">Upload Payment Screenshot</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-white"
                                />
                            </div>

                            {errorMsg ? (
                                <p className="text-center text-sm text-red-500">
                                    {errorMsg}
                                </p>
                            ) : null}

                            <button
                                onClick={submitDeposit}
                                disabled={utr.length < 12 || !selectedMethod}
                                className="mt-4 w-full rounded-lg bg-[#22c55e] py-4 font-black uppercase tracking-widest text-black shadow-[0_10px_20px_rgba(34,197,94,0.2)] transition-all active:scale-[0.98] hover:bg-green-500 disabled:opacity-50"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {copied ? (
                <div className="fixed bottom-10 left-1/2 z-[110] -translate-x-1/2 animate-bounce rounded-full bg-[#22c55e] px-6 py-2 font-bold text-black shadow-xl">
                    Copied to Clipboard!
                </div>
            ) : null}
        </div>
    );
};

export default DepositModal;
