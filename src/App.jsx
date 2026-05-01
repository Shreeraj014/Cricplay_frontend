import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BetHistory from './pages/BetHistory';
import TransactionHistory from './pages/TransactionHistory';
import DepositRequestList from './pages/DepositRequestList';
import AccountSettings from './pages/AccountSettings';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/sports" element={<Dashboard />} />
                <Route path="/bet-history" element={<BetHistory />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/deposit-requests" element={<DepositRequestList />} />
                <Route path="/settings" element={<AccountSettings />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
