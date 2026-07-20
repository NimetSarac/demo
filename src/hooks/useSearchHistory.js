import { useState, useEffect } from 'react';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 5;

export function useSearchHistory() {

    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
        setHistory(saved);
    }, []);

    const addToHistory = (keyword) => {
        if (!keyword.trim()) return;

        const saved = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');

        // Aynı kelime varsa önce kaldır
        const filtered = saved.filter(k => k.toLowerCase() !== keyword.toLowerCase());

        // Başa ekle
        const updated = [keyword, ...filtered].slice(0, MAX_HISTORY);

        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
        setHistory(updated);
    };

    const removeFromHistory = (keyword) => {
        const updated = history.filter(k => k !== keyword);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
        setHistory(updated);
    };

    const clearHistory = () => {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
        setHistory([]);
    };

    return { history, addToHistory, removeFromHistory, clearHistory };
}