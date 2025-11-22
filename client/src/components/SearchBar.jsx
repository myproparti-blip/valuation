import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ data = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Generate searchable items from table data - includes ALL table columns
    const getSearchableItems = () => {
        return data.map(item => ({
            id: item._id,
            uniqueId: item.uniqueId,
            clientName: item.clientName,
            city: item.city,
            bankName: item.bankName,
            engineerName: item.engineerName,
            address: item.address,
            status: item.status,
            mobileNumber: item.mobileNumber,
            payment: item.payment,
            notes: item.notes,
            createdAt: item.createdAt,
            dateTime: item.dateTime,
            lastUpdatedBy: item.lastUpdatedBy,
            managerFeedback: item.managerFeedback
        }));
    };

    // Real-time search and filtering
    const handleSearch = (value) => {
        setSearchTerm(value);

        if (value.trim().length === 0) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const searchableItems = getSearchableItems();
        const searchLower = value.toLowerCase();

        // Filter items based on search term matching ANY field in the table
        const filtered = searchableItems.filter(item => {
            return (
                item.clientName?.toLowerCase().includes(searchLower) ||
                item.city?.toLowerCase().includes(searchLower) ||
                item.bankName?.toLowerCase().includes(searchLower) ||
                item.engineerName?.toLowerCase().includes(searchLower) ||
                item.address?.toLowerCase().includes(searchLower) ||
                item.mobileNumber?.toLowerCase().includes(searchLower) ||
                item.payment?.toLowerCase().includes(searchLower) ||
                item.notes?.toLowerCase().includes(searchLower) ||
                item.status?.toLowerCase().includes(searchLower) ||
                item.createdAt?.toLowerCase().includes(searchLower) ||
                item.dateTime?.toLowerCase().includes(searchLower) ||
                item.lastUpdatedBy?.toLowerCase().includes(searchLower) ||
                item.managerFeedback?.toLowerCase().includes(searchLower)
            );
        });

        // Limit to top 8 suggestions
        setSuggestions(filtered.slice(0, 8));
        setIsOpen(filtered.length > 0);
    };

    // Navigate to record details
    const handleSelectSuggestion = (item) => {
        navigate(`/valuationeditform/${item.uniqueId}`);
        setSearchTerm("");
        setSuggestions([]);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clear search
    const handleClear = () => {
        setSearchTerm("");
        setSuggestions([]);
        setIsOpen(false);
    };

    const getHighlightedText = (text, highlight) => {
        if (!text) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase()
                ? <mark key={index} className="bg-yellow-200 font-semibold">{part}</mark>
                : part
        );
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative flex items-center">
                <FaSearch className="absolute left-3 h-4 w-4 text-white/60 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search client, city, bank..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchTerm.trim().length > 0 && setIsOpen(true)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/15 text-white placeholder-white/60 border border-white/20 focus:border-white/40 focus:bg-white/20 focus:outline-none transition-all text-sm"
                    aria-label="Search valuations"
                />
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 text-white/60 hover:text-white transition-colors"
                        aria-label="Clear search"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <button
                            key={`${item.id}-${index}`}
                            onClick={() => handleSelectSuggestion(item)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors group"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                                    {getHighlightedText(item.clientName, searchTerm)}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                                    {item.address && (
                                        <span className="flex items-center gap-1">
                                            📍 {getHighlightedText(item.address.substring(0, 30), searchTerm)}
                                        </span>
                                    )}
                                    {item.city && (
                                        <span className="flex items-center gap-1">
                                            🏙️ {getHighlightedText(item.city, searchTerm)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                                    {item.bankName && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                            {getHighlightedText(item.bankName, searchTerm)}
                                        </span>
                                    )}
                                    {item.engineerName && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                            {getHighlightedText(item.engineerName, searchTerm)}
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded text-white ${item.status === "approved" ? "bg-green-600" :
                                            item.status === "pending" ? "bg-orange-600" :
                                                item.status === "on-progress" ? "bg-blue-600" :
                                                    "bg-red-600"
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results Message */}
            {isOpen && searchTerm.trim().length > 0 && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 text-center text-sm text-slate-500">
                    No results found for "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default SearchBar;
