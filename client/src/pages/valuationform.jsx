import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
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
    const defaultCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];
    const defaultDsaNames = ["John Doe", "Jane Smith", "Mike Johnson"];
    const defaultEngineers = ["Engineer A", "Engineer B", "Engineer C"];

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
            console.log("✓ Custom options loaded successfully");
        } catch (error) {
            console.error("Error loading custom options:", error);
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
            console.error(`Error saving custom ${type}:`, error);
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
            console.error(`Error deleting ${type}:`, error);
            showError(`Failed to delete ${type} option`);
        }
    };

    const onFinish = async (e) => {
        e.preventDefault();

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
            return;
        }

        // Mobile number validation
        if (formData.mobileNumber.length !== 10) {
            showError("Please enter a valid 10-digit mobile number");
            return;
        }

        // Save custom entries to database and update state (prevent duplicates)
        if (bankName === "other" && formData.customBankName) {
            if (!banks.includes(formData.customBankName)) {
                await saveCustomEntry("banks", formData.customBankName);
                setBanks(prev => [formData.customBankName, ...prev]);
            }
        }

        if (city === "other" && formData.customCity) {
            if (!cities.includes(formData.customCity)) {
                await saveCustomEntry("cities", formData.customCity);
                setCities(prev => [formData.customCity, ...prev]);
            }
        }

        if (dsa === "other" && formData.customDsa) {
            if (!dsaNames.includes(formData.customDsa)) {
                await saveCustomEntry("dsas", formData.customDsa);
                setDsaNames(prev => [formData.customDsa, ...prev]);
            }
        }

        if (engineerName === "other" && formData.customEngineerName) {
            if (!engineers.includes(formData.customEngineerName)) {
                await saveCustomEntry("engineers", formData.customEngineerName);
                setEngineers(prev => [formData.customEngineerName, ...prev]);
            }
        }

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

            // Clear draft before API call to avoid race conditions
            localStorage.removeItem(`valuation_draft_${username}`);

            // Run both requests in parallel
            const [fileResponse, valuationResponse] = await Promise.all([
                submitFile(payload),
                createValuation(payload)
            ]);

            showSuccess("Form submitted successfully!");
            dispatch(hideLoader());
            
            // Keep custom options in state before navigating
            // This ensures they persist for future use
            loadCustomOptions();
            
            // Navigate after success message
            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 300);
        } catch (err) {
            showError(err.message || "Failed to submit form");
            dispatch(hideLoader());
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 overflow-hidden">
            {!isLoggedIn && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
                        <p className="text-center font-semibold">Please login to create a new form</p>
                        <p className="text-center text-sm text-muted-foreground mt-2">You are currently viewing in read-only mode</p>
                    </div>
                </div>
            )}
            <div className="h-full max-w-6xl mx-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/dashboard")}
                        className="h-8 w-8"
                    >
                        <FaArrowLeft className="h-3 w-3" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold">Create New Valuation Form {!isLoggedIn && "(Read-Only)"}</h1>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-2 h-full flex-1 overflow-hidden">
                    {/* Left Column - Form Info */}
                    <div className="col-span-3">
                        <Card className="h-full">
                            <CardHeader className="p-3 pb-2">
                                <CardTitle className="text-sm">Form Information</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3 text-xs">
                                <div>
                                    <p className="text-muted-foreground mb-1">Submitted By</p>
                                    <p className="font-semibold">{username}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Day</p>
                                    <p className="font-semibold">{day}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Date & Time</p>
                                    <p className="font-semibold">{dateTime}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Form ID</p>
                                    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono break-all">{uniqueId}</code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Main Form */}
                    <div className="col-span-9 overflow-y-auto">
                        <Card className="h-full">
                            <CardContent className="p-4">
                                <form onSubmit={onFinish} className="grid grid-cols-2 gap-4">

                                    {/* Bank Section */}
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-sm font-semibold">Bank Name *</Label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {banks && banks.length > 0 && banks.map(name => (
                                                <div key={name} className="relative group">
                                                    <Button
                                                        type="button"
                                                        variant={bankName === name ? "default" : "outline"}
                                                        className="text-xs h-8 w-full"
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
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                        placeholder="Type bank name"
                                                        value={formData.customBankName}
                                                        onChange={(e) => handleCustomInputChange(e, "customBankName")}
                                                        className="h-8 text-xs"
                                                        autoFocus
                                                        disabled={!isLoggedIn}
                                                    />
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="text-xs h-8 w-full"
                                                        onClick={() => handleBankChange("other")}
                                                        disabled={!isLoggedIn}
                                                    >
                                                        Other
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* City Section */}
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-sm font-semibold">City *</Label>
                                        <div className="grid grid-cols-3 gap-1">
                                            {cities && cities.length > 0 && cities.map(name => (
                                                <div key={name} className="relative group">
                                                    <Button
                                                        type="button"
                                                        variant={city === name ? "default" : "outline"}
                                                        className="text-xs h-8 w-full"
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
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                        placeholder="Type city name"
                                                        value={formData.customCity}
                                                        onChange={(e) => handleCustomInputChange(e, "customCity")}
                                                        className="h-8 text-xs"
                                                        autoFocus
                                                        disabled={!isLoggedIn}
                                                    />
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="text-xs h-8 w-full"
                                                        onClick={() => handleCityChange("other")}
                                                        disabled={!isLoggedIn}
                                                    >
                                                        Other
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client Information */}
                                    <div className="space-y-2">
                                        <Label htmlFor="clientName" className="text-sm font-semibold">Client Name *</Label>
                                        <Input
                                            id="clientName"
                                            placeholder="Client name"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            className="h-8 text-sm"
                                            disabled={!isLoggedIn}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobileNumber" className="text-sm font-semibold">Mobile Number *</Label>
                                        <Input
                                            id="mobileNumber"
                                            placeholder="10-digit number"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleInputChange}
                                            className="h-8 text-sm"
                                            maxLength={10}
                                            inputMode="numeric"
                                            disabled={!isLoggedIn}
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="address" className="text-sm font-semibold">Address *</Label>
                                        <Input
                                            id="address"
                                            placeholder="Enter address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="text-sm w-full"
                                            disabled={!isLoggedIn}
                                        />
                                    </div>
                                    {/* Payment Section */}
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-sm font-semibold">Payment Collected? *</Label>
                                        <RadioGroup value={payment} onValueChange={!isLoggedIn ? undefined : setPayment} className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="yes" id="payment-yes" />
                                                <Label htmlFor="payment-yes" className="text-sm font-normal cursor-pointer">Yes</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value="no" id="payment-no" />
                                                <Label htmlFor="payment-no" className="text-sm font-normal cursor-pointer">No</Label>
                                            </div>
                                        </RadioGroup>

                                        {payment === "yes" && (
                                            <div className="space-y-1">
                                                <Label htmlFor="collectedBy" className="text-sm font-semibold">Collected By</Label>
                                                <Input
                                                    id="collectedBy"
                                                    placeholder="Collector details"
                                                    name="collectedBy"
                                                    value={formData.collectedBy}
                                                    onChange={handleInputChange}
                                                    className="text-sm w-full"
                                                    disabled={!isLoggedIn}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* DSA Section */}
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-sm font-semibold">Sales Agent (DSA) *</Label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {dsaNames && dsaNames.length > 0 && dsaNames.map(name => (
                                                <div key={name} className="relative group">
                                                    <Button
                                                        type="button"
                                                        variant={dsa === name ? "default" : "outline"}
                                                        className="text-xs h-8 w-full"
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
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                        placeholder="Type DSA name"
                                                        value={formData.customDsa}
                                                        onChange={(e) => handleCustomInputChange(e, "customDsa")}
                                                        className="h-8 text-xs"
                                                        autoFocus
                                                        disabled={!isLoggedIn}
                                                    />
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="text-xs h-8 w-full"
                                                        onClick={() => handleDsaChange("other")}
                                                        disabled={!isLoggedIn}
                                                    >
                                                        Other
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Engineer Name Section */}
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-sm font-semibold">Engineer Name *</Label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {engineers && engineers.length > 0 && engineers.map(name => (
                                                <div key={name} className="relative group">
                                                    <Button
                                                        type="button"
                                                        variant={engineerName === name ? "default" : "outline"}
                                                        className="text-xs h-8 w-full"
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
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                        placeholder="Type engineer name"
                                                        value={formData.customEngineerName}
                                                        onChange={(e) => handleCustomInputChange(e, "customEngineerName")}
                                                        className="h-8 text-xs"
                                                        autoFocus
                                                        disabled={!isLoggedIn}
                                                    />
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="text-xs h-8 w-full"
                                                        onClick={() => handleEngineerChange("other")}
                                                        disabled={!isLoggedIn}
                                                    >
                                                        Other
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Section */}
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="notes" className="text-sm font-semibold">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Additional notes (optional)"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            className="text-sm"
                                            rows={3}
                                            disabled={!isLoggedIn}
                                        />
                                    </div>

                                    {/* Submit Buttons - Fixed at bottom */}
                                    <div className="col-span-2 flex gap-2 pt-4 border-t mt-auto">
                                        <Button
                                            type="submit"
                                            disabled={loading || !isLoggedIn}
                                            className="flex-1 h-8 text-sm"
                                        >
                                            {!isLoggedIn ? "Login to Submit" : loading ? "Submitting..." : "Submit Form"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigate("/dashboard")}
                                            disabled={loading}
                                            className="flex-1 h-8 text-sm"
                                        >
                                            Back to Dashboard
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