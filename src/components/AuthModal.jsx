import React, { useState } from 'react';
import axios from 'axios';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            // REAL LOGIN CONNECTION TO DJANGO
            try {
                const response = await axios.post('/api/token/', {
                    username: formData.username,
                    password: formData.password
                });

                // Save the REAL tokens returned by Django securely
                localStorage.setItem('access_token', response.data.access);
                if (response.data.refresh) {
                    localStorage.setItem('refresh_token', response.data.refresh);
                }
                localStorage.setItem('username', formData.username);

                onLoginSuccess();
                onClose();
            } catch (err) {
                console.error("Login Error:", err.response?.data);
                setError('Invalid username or password. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            // REAL REGISTRATION
            try {
                const response = await axios.post('/api/register/', formData);
                alert("Account created successfully! Please log in.");
                setIsLogin(true);
                setFormData({ ...formData, password: '' });
            } catch (err) {
                console.error("Register Error:", err.response?.data);
                // Extract error message from Django if possible
                const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Error creating account";
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
            <div className="bg-[#121212] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
                
                {/* Header & Tabs */}
                <div className="flex border-b border-gray-800">
                    <button 
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-[#22c55e] text-black' : 'bg-gray-900 text-gray-500 hover:text-gray-300'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-[#22c55e] text-black' : 'bg-gray-900 text-gray-500 hover:text-gray-300'}`}
                    >
                        Register
                    </button>
                    <button onClick={onClose} className="bg-gray-900 px-4 text-gray-500 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-500 text-xs p-3 rounded mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="text" name="username" placeholder="Username" required
                                value={formData.username} onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-800 text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-[#22c55e] font-mono text-sm"
                            />
                        </div>

                        {!isLogin && (
                            <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="email" name="email" placeholder="Email Address" required={!isLogin}
                                    value={formData.email} onChange={handleChange}
                                    className="w-full bg-black/50 border border-gray-800 text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-[#22c55e] font-mono text-sm"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="password" name="password" placeholder="Password" required
                                value={formData.password} onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-800 text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-[#22c55e] font-mono text-sm"
                            />
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest py-3 sm:py-4 rounded-lg mt-2 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-[0.98]"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Account')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
