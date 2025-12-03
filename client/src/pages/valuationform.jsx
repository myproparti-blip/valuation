import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaArrowLeft, FaTimes, FaFileAlt } from "react-icons/fa";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Label, RadioGroup, RadioGroupItem } from "../components/ui";
import { v4 as uuidv4 } from "uuid";
import { submitFile } from "../services/fileService";
import { createValuation } from "../services/valuationservice";
import { addCustomOption, getCustomOptions, deleteCustomOption } from "../services/customOptionsService";
import api, { invalidateCache } from "../services/axios";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { useNotification } from "../context/NotificationContext";

const FormPage = ({ user, onLogin }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const isLoggedIn = !!user;
    const [bankName, setBankName] = useState("");
    const [city, setCity] = useState("");
    const [payment, setPayment] = useState("");
    const [dsa, setDsa] = useState("");
    const [engineerName, setEngineerName] = useState("");
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        bankName: "",
        customBankName: "",
        city: "",
        customCity: "",
        clientName: "",
        mobileNumber: "",
        address: "",
        payment: "",
        collectedBy: "",
        dsa: "",
        customDsa: "",
        engineerName: "",
        customEngineerName: "",
        notes: ""
    });

    const { showSuccess, showError } = useNotification();
    const username = user?.username || "";
    const role = user?.role || "";

    const defaultBanks = ["SBI", "HDFC", "ICICI", "Axis", "PNB", "BOB"];
    const defaultCities = ["Surat", "vadodara", "Ahmedabad", "Kheda",];
    const defaultDsaNames = ["Bhayva Shah", "Shailesh Shah", "Vijay Shah"];
    const defaultEngineers = ["Bhavesh", "Bhanu", "Ronak", "Mukesh"];

    const [banks, setBanks] = useState([...defaultBanks]);
    const [cities, setCities] = useState([...defaultCities]);
    const [dsaNames, setDsaNames] = useState([...defaultDsaNames]);
    const [engineers, setEngineers] = useState([...defaultEngineers]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const isMountedRef = useRef(true);
    const loadingRef = useRef(false);

    // Load custom options from database with fresh API call
    const loadCustomOptions = useCallback(async () => {
        // Prevent race conditions - only one load at a time
        if (loadingRef.current) return;
        loadingRef.current = true;

        try {
            // Clear entire cache before fetching
            invalidateCache("options");

            // Add timestamp to URL to bypass any remaining cache
            const timestamp = Date.now();
            const params = { _t: timestamp };

            // Fetch fresh data with timestamp parameter
            const [customBanks, customCities, customDsas, customEngineers] = await Promise.all([
                (async () => {
                    const response = await api.get(`/options/banks`, { params });
                    return response.data.data || [];
                })().catch(() => []),
                (async () => {
                    const response = await api.get(`/options/cities`, { params });
                    return response.data.data || [];
                })().catch(() => []),
                (async () => {
                    const response = await api.get(`/options/dsas`, { params });
                    return response.data.data || [];
                })().catch(() => []),
                (async () => {
                    const response = await api.get(`/options/engineers`, { params });
                    return response.data.data || [];
                })().catch(() => [])
            ]);

            // Only update if component is still mounted
            if (!isMountedRef.current) return;

            // Remove duplicates and merge with defaults
            const uniqueBanks = [...new Set([...(customBanks || []), ...defaultBanks])];
            const uniqueCities = [...new Set([...(customCities || []), ...defaultCities])];
            const uniqueDsas = [...new Set([...(customDsas || []), ...defaultDsaNames])];
            const uniqueEngineers = [...new Set([...(customEngineers || []), ...defaultEngineers])];

            setBanks(uniqueBanks);
            setCities(uniqueCities);
            setDsaNames(uniqueDsas);
            setEngineers(uniqueEngineers);
            setIsDataLoaded(true);
        } catch (error) {
            if (!isMountedRef.current) return;

            // Fallback to defaults on error
            setBanks([...defaultBanks]);
            setCities([...defaultCities]);
            setDsaNames([...defaultDsaNames]);
            setEngineers([...defaultEngineers]);
            setIsDataLoaded(true);
        } finally {
            loadingRef.current = false;
        }
    }, []);

    // Load custom options on component mount, route change, and visibility change
    useEffect(() => {
        isMountedRef.current = true;
        loadingRef.current = false;

        // Reset data loaded flag when route changes
        setIsDataLoaded(false);

        // Load immediately on mount
        loadCustomOptions();

        // Reload when browser tab becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadCustomOptions();
            }
        };

        // Reload when window gains focus
        const handleFocus = () => {
            loadCustomOptions();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            isMountedRef.current = false;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.pathname, loadCustomOptions]);

    const uniqueId = `FORM-${uuidv4()}`;
    const dateTime = new Date().toLocaleString();
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Mobile number validation - only numbers and max 10 digits
        if (name === "mobileNumber") {
            const numbersOnly = value.replace(/[^0-9]/g, '');
            if (numbersOnly.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: numbersOnly }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBankChange = (val) => {
        // Prevent unselecting custom options - only allow selection, not clearing
        if (bankName === val) return;

        if (val === "other") {
            setBankName("other");
            setFormData(prev => ({ ...prev, bankName: "other", customBankName: "" }));
        } else {
            setBankName(val);
            setFormData(prev => ({ ...prev, bankName: val, customBankName: "" }));
        }
    };

    const handleCityChange = (val) => {
        // Prevent unselecting custom options - only allow selection, not clearing
        if (city === val) return;

        if (val === "other") {
            setCity("other");
            setFormData(prev => ({ ...prev, city: "other", customCity: "" }));
        } else {
            setCity(val);
            setFormData(prev => ({ ...prev, city: val, customCity: "" }));
        }
    };

    const handleDsaChange = (val) => {
        // Prevent unselecting custom options - only allow selection, not clearing
        if (dsa === val) return;

        if (val === "other") {
            setDsa("other");
            setFormData(prev => ({ ...prev, dsa: "other", customDsa: "" }));
        } else {
            setDsa(val);
            setFormData(prev => ({ ...prev, dsa: val, customDsa: "" }));
        }
    };

    const handleEngineerChange = (val) => {
        // Prevent unselecting custom options - only allow selection, not clearing
        if (engineerName === val) return;

        if (val === "other") {
            setEngineerName("other");
            setFormData(prev => ({ ...prev, engineerName: "other", customEngineerName: "" }));
        } else {
            setEngineerName(val);
            setFormData(prev => ({ ...prev, engineerName: val, customEngineerName: "" }));
        }
    };

    const handleCustomInputChange = (e, field) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveCustomEntry = async (type, value) => {
        if (!value) return;
        try {
            await addCustomOption(type, value);
            // Clear cache after adding custom option to ensure fresh data
            invalidateCache("custom-options");
        } catch (error) {
        }
    };

    const deleteCustomEntry = async (type, value) => {
        try {
            await deleteCustomOption(type, value);

            // Clear entire cache
            invalidateCache("options");

            // Optimistically remove from UI
            if (type === "banks") {
                setBanks(prev => prev && prev.length > 0 ? prev.filter(item => item !== value) : [...defaultBanks]);
            } else if (type === "cities") {
                setCities(prev => prev && prev.length > 0 ? prev.filter(item => item !== value) : [...defaultCities]);
            } else if (type === "dsas") {
                setDsaNames(prev => prev && prev.length > 0 ? prev.filter(item => item !== value) : [...defaultDsaNames]);
            } else if (type === "engineers") {
                setEngineers(prev => prev && prev.length > 0 ? prev.filter(item => item !== value) : [...defaultEngineers]);
            }

            showSuccess(`${type} option deleted successfully`);

            // Reload fresh data after deletion
            setTimeout(() => {
                loadCustomOptions();
            }, 200);
        } catch (error) {
            showError(`Failed to delete ${type} option`);
        }
    };

    const onFinish = async (e) => {
    e.preventDefault();

    // Prevent HTML form native reset - ensure form doesn't auto-clear
    if (formRef.current) {
        formRef.current.onreset = (resetEvent) => resetEvent.preventDefault();
    }

    // Check if user has permission to submit forms
    if (role !== "user" && role !== "manager1" && role !== "manager2" && role !== "admin") {
        showError("You don't have permission to submit forms");
        return;
    }

    const finalBankName = bankName === "other" ? formData.customBankName : bankName;
    const finalCity = city === "other" ? formData.customCity : city;
    const finalDsa = dsa === "other" ? formData.customDsa : dsa;
    const finalEngineer = engineerName === "other" ? formData.customEngineerName : engineerName;

    const errors = [];

    // Collect all validation errors
    if (!finalBankName) errors.push("Bank Name");
    if (!finalCity) errors.push("City");
    if (!formData.clientName) errors.push("Client Name");
    if (!formData.mobileNumber) errors.push("Mobile Number");
    if (!formData.address) errors.push("Address");
    if (!payment) errors.push("Payment Status");
    if (!finalDsa) errors.push("Sales Agent (DSA)");
    if (!finalEngineer) errors.push("Engineer Name");

    // Show single consolidated error if any field is empty
    if (errors.length > 0) {
        showError(`Please fill all required fields: ${errors.join(", ")}`);
        // Form data remains intact in state - inputs keep their values
        return;
    }

    // Mobile number validation
    if (formData.mobileNumber.length !== 10) {
        showError("Please enter a valid 10-digit mobile number");
        // Form data remains intact in state - inputs keep their values
        return;
    }

    // If we reach here, validation passed - proceed with submission
    try {
        setLoading(true);
        dispatch(showLoader("Submitting your form..."));

        const payload = {
            bankName: finalBankName,
            customBankName: formData.customBankName,
            city: finalCity,
            customCity: formData.customCity,
            clientName: formData.clientName,
            mobileNumber: formData.mobileNumber,
            address: formData.address,
            payment: payment,
            collectedBy: formData.collectedBy,
            dsa: finalDsa,
            customDsa: formData.customDsa,
            engineerName: finalEngineer,
            customEngineerName: formData.customEngineerName,
            notes: formData.notes,
            username,
            uniqueId,
            dateTime,
            day,
            status: "pending"
        };

        // Save custom entries to database only if they don't exist
        const saveCustomPromises = [];
        
        if (bankName === "other" && formData.customBankName && !banks.includes(formData.customBankName)) {
            saveCustomPromises.push(saveCustomEntry("banks", formData.customBankName));
        }
        
        if (city === "other" && formData.customCity && !cities.includes(formData.customCity)) {
            saveCustomPromises.push(saveCustomEntry("cities", formData.customCity));
        }
        
        if (dsa === "other" && formData.customDsa && !dsaNames.includes(formData.customDsa)) {
            saveCustomPromises.push(saveCustomEntry("dsas", formData.customDsa));
        }
        
        if (engineerName === "other" && formData.customEngineerName && !engineers.includes(formData.customEngineerName)) {
            saveCustomPromises.push(saveCustomEntry("engineers", formData.customEngineerName));
        }

        // Wait for custom entries to be saved
        if (saveCustomPromises.length > 0) {
            await Promise.all(saveCustomPromises);
        }

        // Clear draft only after successful submission
        localStorage.removeItem(`valuation_draft_${username}`);

        // Run both API requests in parallel
        await Promise.all([
            submitFile(payload),
            createValuation(payload)
        ]);

        // Success - form values remain visible during success notification
        showSuccess("Form submitted successfully!");
        dispatch(hideLoader());

        // Reload custom options to include any new ones
        loadCustomOptions();

        // Navigate after success message is displayed
        setTimeout(() => {
            navigate("/dashboard", { replace: true });
        }, 300);

    } catch (err) {
        showError(err.message || "Failed to submit form");
        dispatch(hideLoader());
        setLoading(false);
        // Form data remains intact in state - no reset on error
        // User can see validation errors and correct the form
    }
};
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-6">
            {!isLoggedIn && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 max-w-sm shadow-2xl">
                        <p className="text-center font-bold text-lg text-gray-900">Please login to create a new form</p>
                        <p className="text-center text-sm text-gray-600 mt-3">You are currently viewing in read-only mode</p>
                    </div>
                </div>
            )}
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/dashboard")}
                        className="h-10 w-10 border-2 border-orange-200 hover:bg-orange-50 rounded-lg"
                    >
                        <FaArrowLeft className="h-4 w-4 text-orange-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">New Valuation Form</h1>
                        <p className="text-sm text-gray-500 mt-1">{!isLoggedIn && "(Read-Only Mode)"}</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column - Form Info Card */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b-0">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <FaFileAlt className="h-5 w-5" />
                                    Form Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted By</p>
                                    <p className="text-sm font-bold text-gray-900">{username}</p>
                                </div>
                                <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</p>
                                    <p className="text-sm font-bold text-gray-900">{day}</p>
                                </div>
                                <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</p>
                                    <p className="text-sm font-bold text-gray-900">{dateTime}</p>
                                </div>
                                <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Form ID</p>
                                    <code className="bg-orange-50 px-3 py-2 rounded-lg text-xs font-mono break-all text-orange-700 border border-orange-200 block">{uniqueId}</code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Main Form */}
                    <div className="lg:col-span-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b-0">
                                <CardTitle className="text-xl font-bold">Property Details</CardTitle>
                                <p className="text-orange-100 text-sm mt-1">Fill in all required fields marked with *</p>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={onFinish} ref={formRef} className="space-y-8">

                                    {/* Bank Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-bold text-gray-900 mb-3 block">Bank Name *</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {banks && banks.length > 0 && banks.map(name => (
                                                    <div key={name} className="relative group">
                                                        <Button
                                                            type="button"
                                                            variant={bankName === name ? "default" : "outline"}
                                                            className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${bankName === name
                                                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                                    : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                                }`}
                                                            onClick={() => handleBankChange(name)}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            {name}
                                                        </Button>
                                                        {!defaultBanks.includes(name) && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteCustomEntry("banks", name);
                                                                }}
                                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                                disabled={!isLoggedIn}
                                                                title="Delete this custom option"
                                                            >
                                                                <FaTimes className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="relative">
                                                    {bankName === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter bank name"
                                                            value={formData.customBankName}
                                                            onChange={(e) => handleCustomInputChange(e, "customBankName")}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!isLoggedIn}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => handleBankChange("other")}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            Other
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* City Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-bold text-gray-900 mb-3 block">City *</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {cities && cities.length > 0 && cities.map(name => (
                                                    <div key={name} className="relative group">
                                                        <Button
                                                            type="button"
                                                            variant={city === name ? "default" : "outline"}
                                                            className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${city === name
                                                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                                    : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                                }`}
                                                            onClick={() => handleCityChange(name)}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            {name}
                                                        </Button>
                                                        {!defaultCities.includes(name) && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteCustomEntry("cities", name);
                                                                }}
                                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                                disabled={!isLoggedIn}
                                                                title="Delete this custom option"
                                                            >
                                                                <FaTimes className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="relative">
                                                    {city === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter city name"
                                                            value={formData.customCity}
                                                            onChange={(e) => handleCustomInputChange(e, "customCity")}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!isLoggedIn}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => handleCityChange("other")}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            Other
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client Information Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
                                        <div className="space-y-2">
                                            <Label htmlFor="clientName" className="text-sm font-bold text-gray-900">Client Name *</Label>
                                            <Input
                                                id="clientName"
                                                placeholder="Enter client name"
                                                name="clientName"
                                                value={formData.clientName}
                                                onChange={handleInputChange}
                                                className="h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                                disabled={!isLoggedIn}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mobileNumber" className="text-sm font-bold text-gray-900">Mobile Number *</Label>
                                            <Input
                                                id="mobileNumber"
                                                placeholder="10-digit number"
                                                name="mobileNumber"
                                                value={formData.mobileNumber}
                                                onChange={handleInputChange}
                                                className="h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                                maxLength={10}
                                                inputMode="numeric"
                                                disabled={!isLoggedIn}
                                            />
                                        </div>

                                        {/* Address */}
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="address" className="text-sm font-bold text-gray-900">Address *</Label>
                                            <Input
                                                id="address"
                                                placeholder="Enter complete address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="h-11 text-sm w-full rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                                disabled={!isLoggedIn}
                                            />
                                        </div>
                                    </div>
                                    {/* Payment Section */}
                                    <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
                                        <Label className="text-sm font-bold text-gray-900 block">Payment Status *</Label>
                                        <RadioGroup value={payment} onValueChange={!isLoggedIn ? undefined : setPayment} className="flex gap-6">
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <RadioGroupItem value="yes" id="payment-yes" className="w-5 h-5 border-2 border-green-500" />
                                                <Label htmlFor="payment-yes" className="text-base font-semibold cursor-pointer text-gray-900">Payment Collected</Label>
                                            </div>
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <RadioGroupItem value="no" id="payment-no" className="w-5 h-5 border-2 border-red-500" />
                                                <Label htmlFor="payment-no" className="text-base font-semibold cursor-pointer text-gray-900">Pending</Label>
                                            </div>
                                        </RadioGroup>

                                        {payment === "yes" && (
                                            <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                                                <Label htmlFor="collectedBy" className="text-sm font-bold text-gray-900">Collected By *</Label>
                                                <Input
                                                    id="collectedBy"
                                                    placeholder="Enter collector's name/details"
                                                    name="collectedBy"
                                                    value={formData.collectedBy}
                                                    onChange={handleInputChange}
                                                    className="h-11 text-sm w-full rounded-xl border-2 border-green-300 focus:border-green-500 focus:ring-green-200 font-medium bg-white"
                                                    disabled={!isLoggedIn}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* DSA Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-bold text-gray-900 mb-3 block">Sales Agent (DSA) *</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {dsaNames && dsaNames.length > 0 && dsaNames.map(name => (
                                                    <div key={name} className="relative group">
                                                        <Button
                                                            type="button"
                                                            variant={dsa === name ? "default" : "outline"}
                                                            className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${dsa === name
                                                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                                    : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                                }`}
                                                            onClick={() => handleDsaChange(name)}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            {name}
                                                        </Button>
                                                        {!defaultDsaNames.includes(name) && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteCustomEntry("dsas", name);
                                                                }}
                                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                                disabled={!isLoggedIn}
                                                                title="Delete this custom option"
                                                            >
                                                                <FaTimes className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="relative">
                                                    {dsa === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter DSA name"
                                                            value={formData.customDsa}
                                                            onChange={(e) => handleCustomInputChange(e, "customDsa")}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!isLoggedIn}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => handleDsaChange("other")}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            Other
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Engineer Name Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-bold text-gray-900 mb-3 block">Engineer Name *</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {engineers && engineers.length > 0 && engineers.map(name => (
                                                    <div key={name} className="relative group">
                                                        <Button
                                                            type="button"
                                                            variant={engineerName === name ? "default" : "outline"}
                                                            className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${engineerName === name
                                                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                                    : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                                }`}
                                                            onClick={() => handleEngineerChange(name)}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            {name}
                                                        </Button>
                                                        {!defaultEngineers.includes(name) && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteCustomEntry("engineers", name);
                                                                }}
                                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                                disabled={!isLoggedIn}
                                                                title="Delete this custom option"
                                                            >
                                                                <FaTimes className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="relative">
                                                    {engineerName === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter engineer name"
                                                            value={formData.customEngineerName}
                                                            onChange={(e) => handleCustomInputChange(e, "customEngineerName")}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!isLoggedIn}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => handleEngineerChange("other")}
                                                            disabled={!isLoggedIn}
                                                        >
                                                            Other
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Section */}
                                    <div className="space-y-3">
                                        <Label htmlFor="notes" className="text-sm font-bold text-gray-900">Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Add any additional notes or comments here..."
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            className="text-sm rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium min-h-[120px]"
                                            disabled={!isLoggedIn}
                                        />
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex gap-3 pt-6 border-t-2 border-gray-200 mt-2">
                                        <Button
                                            type="submit"
                                            disabled={loading || !isLoggedIn}
                                            className="flex-1 h-12 text-base font-bold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {!isLoggedIn ? "Login to Submit" : loading ? "Submitting..." : "Submit Form"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigate("/dashboard")}
                                            disabled={loading}
                                            className="flex-1 h-12 text-base font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormPage;
