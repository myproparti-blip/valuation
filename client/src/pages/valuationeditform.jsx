import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import exifr from 'exifr';
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaUpload,
    FaPrint,
    FaDownload,
    FaUser,
    FaFileAlt,
    FaDollarSign,
    FaCog,
    FaCompass,
    FaBuilding,
    FaImage,
    FaLocationArrow,
    FaCheckCircle,
    FaTimesCircle,
    FaSave,
    FaThumbsUp,
    FaThumbsDown
} from "react-icons/fa";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea, Label, Badge, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, RadioGroup, RadioGroupItem } from "../components/ui";
import { getValuationById, updateValuation, managerSubmit } from "../services/valuationservice";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { useNotification } from "../context/NotificationContext";
import { uploadPropertyImages, uploadLocationImages } from "../services/imageService";
import { invalidateCache } from "../services/axios";

const EditValuationPage = ({ user, onLogin }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [valuation, setValuation] = useState(null);
    const isLoggedIn = !!user;
    const [bankName, setBankName] = useState("");
    const [city, setCity] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [modalFeedback, setModalFeedback] = useState("");
    const [formData, setFormData] = useState({
        directions: {
            north1: '',
            east1: '',
            south1: '',
            west1: '',
            north2: '',
            east2: '',
            south2: '',
            west2: ''
        },
        propertyImages: [],
        locationImages: [],
        coordinates: {
            latitude: '',
            longitude: ''
        },
        clientName: '',
        mobileNumber: '',
        address: '',
        payment: '',
        collectedBy: '',
        dsa: '',
        engineerName: '',
        notes: ''
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [locationImagePreviews, setLocationImagePreviews] = useState([]);

    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);
    const fileInputRef3 = useRef(null);
    const fileInputRef4 = useRef(null);
    const locationFileInputRef = useRef(null);

    const { showSuccess, showError } = useNotification();
    const username = user?.username || "";
    const role = user?.role || "";

    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

   
    const banks = ["SBI", "HDFC", "ICICI", "Axis", "PNB", "BOB"];
    const cities = ["Surat", "vadodara", "Ahmedabad", "Kheda",];
    const dsaNames = ["John Doe", "Jane Smith", "Mike Johnson"];

    useEffect(() => {
        if (id) fetchValuation();
    }, [id]);

    const fetchValuation = async () => {
        const savedData = localStorage.getItem(`valuation_draft_${username}`);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.uniqueId === id) {
                setValuation(parsedData);
                setBankName(parsedData.bankName || "");
                setCity(parsedData.city || "");
                setFormData(prev => ({
                    ...prev,
                    ...parsedData,
                    directions: parsedData.directions || prev.directions,
                    coordinates: parsedData.coordinates || prev.coordinates
                }));
                return;
            }
        }

        try {
            const dbData = await getValuationById(id);
            setValuation(dbData);
            setBankName(dbData.bankName || "");
            setCity(dbData.city || "");
            setFormData(prev => ({
                ...prev,
                ...dbData,
                directions: dbData.directions || prev.directions,
                coordinates: dbData.coordinates || prev.coordinates,
                propertyImages: dbData.propertyImages || [],
                locationImages: dbData.locationImages || []
            }));

            // Restore property image previews from database
            if (dbData.propertyImages && Array.isArray(dbData.propertyImages)) {
                const propertyPreviews = dbData.propertyImages
                    .filter(img => img && typeof img === 'object')
                    .map((img, idx) => {
                        let previewUrl = '';
                        if (img.url) {
                            // Direct Cloudinary URL
                            previewUrl = img.url;
                        } else if (img.path) {
                            const fileName = img.path.split('\\').pop() || img.path.split('/').pop();
                            previewUrl = `/api/uploads/${fileName}`;
                        } else if (img.fileName) {
                            previewUrl = `/api/uploads/${img.fileName}`;
                        }
                        return {
                            preview: previewUrl,
                            file: null,
                            inputNumber: img.inputNumber || 1
                        };
                    })
                    .filter(preview => preview.preview); // Only keep those with valid URLs
                if (propertyPreviews.length > 0) {
                    setImagePreviews(propertyPreviews);
                }
            }

            // Restore location image previews from database
            if (dbData.locationImages && Array.isArray(dbData.locationImages)) {
                const locationPreviews = dbData.locationImages
                    .filter(img => img && typeof img === 'object')
                    .map((img, idx) => {
                        let previewUrl = '';
                        if (img.url) {
                            // Direct Cloudinary URL
                            previewUrl = img.url;
                        } else if (img.path) {
                            const fileName = img.path.split('\\').pop() || img.path.split('/').pop();
                            previewUrl = `/api/uploads/${fileName}`;
                        } else if (img.fileName) {
                            previewUrl = `/api/uploads/${img.fileName}`;
                        }
                        return {
                            preview: previewUrl,
                            file: null
                        };
                    })
                    .filter(preview => preview.preview); // Only keep those with valid URLs
                if (locationPreviews.length > 0) {
                    setLocationImagePreviews(locationPreviews);
                }
            }
        } catch (err) {
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setValuation(parsedData);
                setBankName(parsedData.bankName || "");
                setCity(parsedData.city || "");
                setFormData(prev => ({
                    ...prev,
                    ...parsedData,
                    directions: parsedData.directions || prev.directions,
                    coordinates: parsedData.coordinates || prev.coordinates
                }));
            } else {
                setValuation({
                    username: username,
                    uniqueId: id,
                    dateTime: new Date().toLocaleString(),
                    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
                    status: "pending"
                });
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDirectionChange = (direction, value) => {
        setFormData(prev => ({
            ...prev,
            directions: {
                ...prev.directions,
                [direction]: value
            }
        }));
    };

    const handleCoordinateChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            coordinates: {
                ...prev.coordinates,
                [field]: value
            }
        }));
    };

    const handleLocationImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        // Only take the first file for location images (single image only)
        if (files.length === 0) return;

        const file = files[0];
        let gpsCoordinates = null;

        try {
            // Try to extract GPS from EXIF
            const exifData = await exifr.parse(file);

            if (exifData?.latitude && exifData?.longitude) {
                gpsCoordinates = {
                    latitude: String(exifData.latitude),
                    longitude: String(exifData.longitude)
                };
                alert(`✓ GPS found\nLat: ${parseFloat(gpsCoordinates.latitude).toFixed(6)}\nLng: ${parseFloat(gpsCoordinates.longitude).toFixed(6)}`);
            }
        } catch (error) {
            // Error reading EXIF data
        }

        const preview = URL.createObjectURL(file);

        // Remove old location image and add new one (replace instead of append)
        if (locationImagePreviews.length > 0) {
            URL.revokeObjectURL(locationImagePreviews[0].preview);
        }

        setLocationImagePreviews([{ file, preview }]);

        setFormData(prev => {
            const newCoordinates = gpsCoordinates ? gpsCoordinates : prev.coordinates;
            return {
                ...prev,
                locationImages: [file],
                coordinates: newCoordinates
            };
        });
    };

    const handleImageUpload = async (e, inputNumber) => {
        const files = Array.from(e.target.files);

        for (const file of files) {
            // No GPS extraction for property images - only for location images
            const preview = URL.createObjectURL(file);
            setImagePreviews(prev => [...prev, { file, preview, inputNumber }]);
            setFormData(prev => ({
                ...prev,
                propertyImages: [...prev.propertyImages, { file, inputNumber }]
            }));
        }
    };
    const removeLocationImage = (index) => {
        setLocationImagePreviews(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });

        setFormData(prev => ({
            ...prev,
            locationImages: prev.locationImages.filter((_, i) => i !== index)
        }));
    };

    const removeImage = (index) => {
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });

        setFormData(prev => ({
            ...prev,
            propertyImages: prev.propertyImages.filter((_, i) => i !== index)
        }));
    };


    // Validation function
    const validateForm = () => {
        const errors = [];

        // === CLIENT INFORMATION ===
        if (!formData.clientName || !formData.clientName.trim()) {
            errors.push("Client Name is required");
        }

        if (!formData.mobileNumber || !formData.mobileNumber.trim()) {
            errors.push("Mobile Number is required");
        } else {
            // Mobile number validation - exactly 10 digits
            const mobileDigits = formData.mobileNumber.replace(/\D/g, '');
            if (mobileDigits.length !== 10) {
                errors.push("Mobile Number must be 10 digits");
            }
        }

        if (!formData.address || !formData.address.trim()) {
            errors.push("Address is required");
        }

        // === BANK & CITY ===
        if (!bankName || bankName === "") {
            errors.push("Bank Name is required");
        }

        if (!city || city === "") {
            errors.push("City is required");
        }

        // === DSA ===
        if (!formData.dsa || !formData.dsa.trim()) {
            errors.push("DSA (Sales Agent) is required");
        }



        // === PAYMENT INFORMATION ===
        if (formData.payment === "yes" && (!formData.collectedBy || !formData.collectedBy.trim())) {
            errors.push("Collected By name is required when payment is collected");
        }

        // === GPS COORDINATES ===
        if (formData.coordinates.latitude || formData.coordinates.longitude) {
            if (formData.coordinates.latitude) {
                const lat = parseFloat(formData.coordinates.latitude);
                if (isNaN(lat) || lat < -90 || lat > 90) {
                    errors.push("Latitude must be a valid number between -90 and 90");
                }
            }

            if (formData.coordinates.longitude) {
                const lng = parseFloat(formData.coordinates.longitude);
                if (isNaN(lng) || lng < -180 || lng > 180) {
                    errors.push("Longitude must be a valid number between -180 and 180");
                }
            }
        }

        // === PROPERTY IMAGES ===
        if (imagePreviews.length === 0) {
            errors.push("At least one property image is required");
        }

        // === LOCATION IMAGES ===
        if (locationImagePreviews.length === 0) {
            errors.push("At least one location image is required");
        }

        return errors;
    };

    const onFinish = async (e) => {
        e.preventDefault();

        const isUserUpdate = role === "user" && (valuation.status === "pending" || valuation.status === "rejected");
        const isManagerUpdate = (role === "manager1" || role === "manager2") && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "on-progress");
        const isAdminUpdate = role === "admin";

        if (!isUserUpdate && !isManagerUpdate && !isAdminUpdate) {
            showError("You don't have permission to update this form");
            return;
        }

        // Validate form
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            // Show single consolidated error instead of multiple notifications
            showError(` ${validationErrors.join(", ")}`);
            return;
        }

        try {
            setLoading(true);
            dispatch(showLoader("Saving your changes..."));

            // Build regular JSON payload
            const payload = {
                ...formData,
                bankName: bankName === "other" ? formData.customBankName : bankName,
                city: city === "other" ? formData.customCity : city,
            };

            // Remove immutable/system fields
            delete payload._id;
            delete payload.__v;
            delete payload.uniqueId;
            delete payload.createdAt;
            delete payload.username;

            // Parallel image uploads
            const [uploadedPropertyImages, uploadedLocationImages] = await Promise.all([
                (async () => {
                    const newPropertyImages = imagePreviews.filter(p => p && p.file);
                    if (newPropertyImages.length > 0) {
                        return await uploadPropertyImages(newPropertyImages, valuation.uniqueId);
                    }
                    return [];
                })(),
                (async () => {
                    const newLocationImages = locationImagePreviews.filter(p => p && p.file);
                    if (newLocationImages.length > 0) {
                        return await uploadLocationImages(newLocationImages, valuation.uniqueId);
                    }
                    return [];
                })()
            ]);

            // Combine previously saved images with newly uploaded Cloudinary URLs
            const previousPropertyImages = imagePreviews
                .filter(p => p && !p.file && p.preview)
                .map((preview, idx) => ({
                    url: preview.preview,
                    inputNumber: preview.inputNumber,
                    index: idx
                }));

            // For location images: if new image uploaded, use only the new one; otherwise use previous
            const previousLocationImages = (uploadedLocationImages.length === 0)
                ? locationImagePreviews
                    .filter(p => p && !p.file && p.preview)
                    .map((preview, idx) => ({
                        url: preview.preview,
                        index: idx
                    }))
                : [];

            payload.propertyImages = [...previousPropertyImages, ...uploadedPropertyImages];
            payload.locationImages = uploadedLocationImages.length > 0 ? uploadedLocationImages : previousLocationImages;

            // Clear draft before API call
            localStorage.removeItem(`valuation_draft_${username}`);

            // Call API to update valuation with JSON payload
            const apiResponse = await updateValuation(id, payload);
            
            // Invalidate cache to ensure fresh data on dashboard
            invalidateCache("/valuations");

            // Status always updates to on-progress for admin/managers on save
            let newStatus = "on-progress";

            // Update local state with API response and new status
            const updatedValuation = {
                ...valuation,
                ...(apiResponse || {}),
                ...payload,
                status: newStatus,
                lastUpdatedBy: username,
                lastUpdatedByRole: role,
                lastUpdatedAt: new Date().toISOString()
            };

            // Update component state
            setValuation(updatedValuation);
            setBankName(payload.bankName);
            setCity(payload.city);

            // Show success and navigate
            showSuccess("Form saved successfully!");
            dispatch(hideLoader());
            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 300);
        } catch (err) {
            const errorMessage = err.message || "Failed to update form";
            showError(errorMessage);
            dispatch(hideLoader());
            setLoading(false);
        }
    };

    const handleManagerAction = (action) => {
        setModalAction(action);
        setModalFeedback("");
        setModalOpen(true);
    };

    const handleModalOk = async () => {
        const statusValue = modalAction === "approve" ? "approved" : "rejected";
        const actionLabel = modalAction === "approve" ? "Approve" : "Reject";

        if (statusValue === "rejected" && !modalFeedback.trim()) {
            showError("Please provide feedback for rejection");
            return;
        }

        try {
            setLoading(true);
            dispatch(showLoader(`${actionLabel}ing form...`));

            const payload = {
                status: statusValue,
                managerFeedback: modalFeedback.trim()
            };

            const responseData = await managerSubmit(id, payload);
            
            // Invalidate cache to ensure fresh data on dashboard
            invalidateCache("/valuations");

            const updatedValuation = {
                ...valuation,
                ...(responseData?.data || responseData),
                status: statusValue,
                managerFeedback: modalFeedback.trim(),
                submittedByManager: true,
                lastUpdatedBy: user.username,
                lastUpdatedByRole: user.role
            };
            setValuation(updatedValuation);
            setModalOpen(false);

            showSuccess(`Form ${statusValue} successfully!`);
            setTimeout(() => {
                dispatch(hideLoader());
                setLoading(false);
                navigate("/dashboard");
            }, 1000);
        } catch (err) {
            showError(err.message || `Failed to ${actionLabel.toLowerCase()} form`);
            dispatch(hideLoader());
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!valuation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-80">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-muted-foreground">Loading</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            "pending": "warning",
            "on-progress": "default",
            "approved": "success",
            "rejected": "destructive"
        };
        return colors[status] || "default";
    };

    // Permission checks
    const canEdit = isLoggedIn && ((role === "admin") ||
        (role === "manager1" || role === "manager2") && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "on-progress") ||
        (role === "user") && (valuation.status === "rejected" || valuation.status === "pending"));

    // Admin and managers can edit client information
    const canEditClientInfo = isLoggedIn && (role === "admin" || role === "manager1" || role === "manager2");

    const canApprove = isLoggedIn && (role === "manager1" || role === "manager2" || role === "admin") &&
        (valuation.status === "pending" || valuation.status === "on-progress" || valuation.status === "rejected");

    return (
        <div className="min-h-screen p-4">
            {!isLoggedIn && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
                        <p className="text-center font-semibold">Please login to edit this valuation</p>
                        <p className="text-center text-sm text-muted-foreground mt-2">You are currently viewing in read-only mode</p>
                    </div>
                </div>
            )}
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigate("/dashboard")}
                                className="rounded-lg"
                            >
                                <FaArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit Valuation Form</h1>
                                <p className="text-sm text-gray-600 mt-1 font-mono bg-gray-100 px-3 py-1 rounded inline-block">ID: {valuation.uniqueId}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Client Information Card */}
                    <Card className={`${!canEditClientInfo ? 'opacity-75' : ''}`}>
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3">
                                    <FaUser className="h-5 w-5" />
                                    Client Information
                                </CardTitle>
                                {!canEditClientInfo && (
                                    <Badge variant="destructive" className="text-xs">
                                        Admin Only
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {!canEditClientInfo && (
                                <div className="mb-4 p-3 border rounded-lg">
                                    <p className="text-sm">
                                        <strong>Note:</strong> Only administrators can edit client information.
                                    </p>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="info-field">
                                        <Label className="text-sm font-medium text-gray-600">Client Name</Label>
                                        <Input
                                            placeholder="Enter client name"
                                            name="clientName"
                                            value={formData.clientName || ""}
                                            onChange={handleInputChange}
                                            disabled={!canEditClientInfo}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="info-field">
                                        <Label className="text-sm font-medium text-gray-600">Mobile Number</Label>
                                        <Input
                                            placeholder="Enter mobile number"
                                            name="mobileNumber"
                                            maxLength={10}
                                            value={formData.mobileNumber || ""}
                                            onChange={handleInputChange}
                                            disabled={!canEditClientInfo}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
                                    <div className="flex gap-2 flex-wrap mb-3">
                                        {banks.map(name => (
                                            <Button
                                                key={name}
                                                type="button"
                                                variant={bankName === name ? "default" : "outline"}
                                                className="text-sm"
                                                onClick={() => { setBankName(name); handleInputChange({ target: { name: "bankName", value: name } }); }}
                                                disabled={!canEditClientInfo}
                                            >
                                                {name}
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            variant={bankName === "other" ? "default" : "outline"}
                                            className="text-sm"
                                            onClick={() => setBankName("other")}
                                            disabled={!canEditClientInfo}
                                        >
                                            Other
                                        </Button>
                                    </div>
                                    {bankName === "other" && (
                                        <Input
                                            placeholder="Enter bank name"
                                            name="customBankName"
                                            value={formData.customBankName || ""}
                                            onChange={handleInputChange}
                                            disabled={!canEditClientInfo}
                                        />
                                    )}
                                </div>

                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">City</Label>
                                    <div className="flex gap-2 flex-wrap mb-3">
                                        {cities.map(name => (
                                            <Button
                                                key={name}
                                                type="button"
                                                variant={city === name ? "default" : "outline"}
                                                className="text-sm"
                                                onClick={() => { setCity(name); handleInputChange({ target: { name: "city", value: name } }); }}
                                                disabled={!canEditClientInfo}
                                            >
                                                {name}
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            variant={city === "other" ? "default" : "outline"}
                                            className="text-sm"
                                            onClick={() => setCity("other")}
                                            disabled={!canEditClientInfo}
                                        >
                                            Other
                                        </Button>
                                    </div>
                                    {city === "other" && (
                                        <Input
                                            placeholder="Enter city name"
                                            name="customCity"
                                            value={formData.customCity || ""}
                                            onChange={handleInputChange}
                                            disabled={!canEditClientInfo}
                                        />
                                    )}
                                </div>

                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">DSA</Label>
                                    <select
                                        value={formData.dsa || ""}
                                        onChange={(e) => handleInputChange({ target: { name: "dsa", value: e.target.value } })}
                                        disabled={!canEditClientInfo}
                                        className="w-full p-2 border border-gray-300 rounded-md mt-1"
                                    >
                                        <option value="">Select sales agent</option>
                                        {dsaNames.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Engineer Name</Label>
                                    <Input
                                        placeholder="Enter engineer name"
                                        name="engineerName"
                                        value={formData.engineerName || ""}
                                        onChange={handleInputChange}
                                        disabled={!canEditClientInfo}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                                    <Textarea
                                        placeholder="Enter full address"
                                        name="address"
                                        value={formData.address || ""}
                                        onChange={handleInputChange}
                                        disabled={!canEditClientInfo}
                                        rows={4}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Details Card */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-3">
                                <FaFileAlt className="h-5 w-5" />
                                Form Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="info-field">
                                        <Label className="text-sm font-medium text-gray-600">Submitted By</Label>
                                        <p className="font-semibold text-gray-900 mt-1">{valuation.username}</p>
                                    </div>
                                    <div className="info-field">
                                        <Label className="text-sm font-medium text-gray-600">Form ID</Label>
                                        <code className="px-3 py-1 rounded-lg text-sm font-mono mt-1 block border">{valuation.uniqueId}</code>
                                    </div>
                                </div>
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                                    <p className="font-semibold text-gray-900 mt-1">{valuation.dateTime}</p>
                                </div>
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Day</Label>
                                    <p className="font-semibold text-gray-900 mt-1">{valuation.day}</p>
                                </div>
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                                    <Badge
                                        variant={getStatusColor(valuation.status)}
                                        className="mt-1 text-sm px-3 py-1"
                                    >
                                        {valuation.status === "pending" ? "Pending Review" :
                                            valuation.status === "on-progress" ? "On Progress" :
                                                valuation.status === "approved" ? "Approved" : "Rejected"}
                                    </Badge>
                                </div>
                                {valuation.managerFeedback && (
                                    <div className="info-field">
                                        <Label className="text-sm font-medium text-gray-600">Manager Feedback</Label>
                                        <div className="p-3 rounded-lg mt-1 border">
                                            <p className="text-sm">{valuation.managerFeedback}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information Card */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-3">
                                <FaDollarSign className="h-5 w-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Payment Collected</Label>
                                    <RadioGroup value={formData.payment} onValueChange={(val) => setFormData(prev => ({ ...prev, payment: val }))} disabled={!canEdit} className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="yes" id="payment-yes" disabled={!canEdit} />
                                            <Label htmlFor="payment-yes" className="font-normal cursor-pointer">Yes, Payment Collected</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="no" id="payment-no" disabled={!canEdit} />
                                            <Label htmlFor="payment-no" className="font-normal cursor-pointer">No, Payment Pending</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {formData.payment === "yes" && (
                                    <div className="info-field">
                                        <Label className="text-sm font-medium text-gray-600">Collected By</Label>
                                        <Textarea
                                            placeholder="Enter name and details of person who collected payment"
                                            name="collectedBy"
                                            value={formData.collectedBy || ""}
                                            onChange={handleInputChange}
                                            disabled={!canEdit}
                                            rows={2}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Card */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-3">
                                <FaFileAlt className="h-5 w-5" />
                                Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Additional Notes</Label>
                                    <Textarea
                                        placeholder="Enter additional notes (optional)"
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        disabled={!canEdit}
                                        rows={4}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Information Card */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-3">
                                <FaCog className="h-5 w-5" />
                                System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Current User</Label>
                                    <p className="font-semibold text-gray-900 mt-1">{username} ({role})</p>
                                </div>
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                                    <p className="font-semibold text-gray-900 mt-1">{new Date().toLocaleString()}</p>
                                </div>
                                {valuation.lastUpdatedBy && (
                                    <div className="info-field">
                                        <Label className="text-sm font-medium text-gray-600">Last Updated By</Label>
                                        <p className="font-semibold text-gray-900 mt-1">{valuation.lastUpdatedBy}</p>
                                    </div>
                                )}
                                <div className="info-field">
                                    <Label className="text-sm font-medium text-gray-600">Form ID</Label>
                                    <code className="px-3 py-1 rounded-lg text-sm font-mono mt-1 block border">{id}</code>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Property Directions Card */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-3">
                            <FaCompass className="h-5 w-5" />
                            Property Directions
                        </CardTitle>
                        <CardDescription>Enter property directions as per sale deed and site visit</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* AS PER SALE DEED Card */}
                            <Card className="border">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-center">AS PER SALE DEED</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="compass-layout space-y-4">
                                        <Input
                                            placeholder="North"
                                            value={formData.directions.north1}
                                            onChange={(e) => handleDirectionChange('north1', e.target.value)}
                                            className="text-center text-lg font-medium"
                                            disabled={!canEdit}
                                        />
                                        <div className="flex gap-4 items-center justify-center">
                                            <Input
                                                placeholder="West"
                                                value={formData.directions.west1}
                                                onChange={(e) => handleDirectionChange('west1', e.target.value)}
                                                className="text-center text-lg font-medium"
                                                disabled={!canEdit}
                                            />
                                            <Card className="w-16 h-16 shadow-lg rounded-full flex items-center justify-center border">
                                                <FaCompass className="h-8 w-8" />
                                            </Card>
                                            <Input
                                                placeholder="East"
                                                value={formData.directions.east1}
                                                onChange={(e) => handleDirectionChange('east1', e.target.value)}
                                                className="text-center text-lg font-medium"
                                                disabled={!canEdit}
                                            />
                                        </div>
                                        <Input
                                            placeholder="South"
                                            value={formData.directions.south1}
                                            onChange={(e) => handleDirectionChange('south1', e.target.value)}
                                            className="text-center text-lg font-medium"
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AS PER SITE Card */}
                            <Card className="border">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-center">AS PER SITE</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="compass-layout space-y-4">
                                        <Input
                                            placeholder="North"
                                            value={formData.directions.north2}
                                            onChange={(e) => handleDirectionChange('north2', e.target.value)}
                                            className="text-center text-lg font-medium"
                                            disabled={!canEdit}
                                        />
                                        <div className="flex gap-4 items-center justify-center">
                                            <Input
                                                placeholder="West"
                                                value={formData.directions.west2}
                                                onChange={(e) => handleDirectionChange('west2', e.target.value)}
                                                className="text-center text-lg font-medium"
                                                disabled={!canEdit}
                                            />
                                            <Card className="w-16 h-16 shadow-lg rounded-full flex items-center justify-center border">
                                                <FaCompass className="h-8 w-8" />
                                            </Card>
                                            <Input
                                                placeholder="East"
                                                value={formData.directions.east2}
                                                onChange={(e) => handleDirectionChange('east2', e.target.value)}
                                                className="text-center text-lg font-medium"
                                                disabled={!canEdit}
                                            />
                                        </div>
                                        <Input
                                            placeholder="South"
                                            value={formData.directions.south2}
                                            onChange={(e) => handleDirectionChange('south2', e.target.value)}
                                            className="text-center text-lg font-medium"
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Details Card */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-3">
                            <FaMapMarkerAlt className="h-5 w-5" />
                            Location Images
                        </CardTitle>
                        <CardDescription>Upload location images</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">


                            {/* Location Images Upload */}
                            <Card className="border">
                                <CardHeader className="border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <FaImage className="h-5 w-5" />
                                        Location Images
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <input
                                            type="file"
                                            ref={locationFileInputRef}
                                            accept="image/*"
                                            onChange={handleLocationImageUpload}
                                            style={{ display: 'none' }}
                                            disabled={!canEdit}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => locationFileInputRef.current?.click()}
                                            className="flex items-center gap-2"
                                            disabled={!canEdit}
                                        >
                                            <FaUpload className="h-4 w-4" />
                                            Upload Location Images
                                        </Button>

                                        {/* Location Image Preview - Single Image Only */}
                                        {locationImagePreviews.length > 0 && (
                                            <Card className="relative w-32 h-32 border-2 border-dashed">
                                                <CardContent className="p-0 h-full">
                                                    <img
                                                        src={locationImagePreviews[0].preview}
                                                        alt="Location Preview"
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeLocationImage(0)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={!canEdit}
                                                    >
                                                        ×
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Coordinates Card - Always show if we have coordinates or location images */}
                            {(formData.coordinates.latitude || formData.coordinates.longitude || locationImagePreviews.length > 0) && (
                                <Card className="border">
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <FaLocationArrow className="h-5 w-5" />
                                            GPS Coordinates
                                            {formData.coordinates.latitude && formData.coordinates.longitude && " (from image metadata)"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            {/* Coordinate Input Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">Latitude</Label>
                                                    <Input
                                                        placeholder="Enter latitude"
                                                        value={formData.coordinates.latitude || ''}
                                                        onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                                                        className="mt-2"
                                                        disabled={!canEdit}
                                                    />
                                                    {formData.coordinates.latitude && (
                                                        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-xs">
                                                            <p className="font-semibold text-green-900">
                                                                Latitude: {parseFloat(formData.coordinates.latitude).toFixed(6)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">Longitude</Label>
                                                    <Input
                                                        placeholder="Enter longitude"
                                                        value={formData.coordinates.longitude || ''}
                                                        onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                                                        className="mt-2"
                                                        disabled={!canEdit}
                                                    />
                                                    {formData.coordinates.longitude && (
                                                        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-xs">
                                                            <p className="font-semibold text-green-900">
                                                                Longitude: {parseFloat(formData.coordinates.longitude).toFixed(6)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>



                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Property Images Card */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-3">
                            <FaUpload className="h-5 w-5" />
                            Property Images
                        </CardTitle>
                        <CardDescription>Upload property images - 4 separate upload options</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">

                            {/* 4 Upload Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((num) => (
                                    <Card key={num} className="border-2 border-dashed transition-all cursor-pointer">
                                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                                            <input
                                                type="file"
                                                ref={eval(`fileInputRef${num}`)}
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, num)}
                                                style={{ display: 'none' }}
                                                disabled={!canEdit}
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => eval(`fileInputRef${num}.current?.click()`)}
                                                variant="outline"
                                                className="flex items-center gap-2 w-full h-full min-h-[100px] border-2 border-dashed"
                                                disabled={!canEdit}
                                            >
                                                <div className="text-center">
                                                    <FaUpload className="h-8 w-8 mb-2 mx-auto" />
                                                    <div className="text-sm font-medium">Upload Images {num}</div>
                                                </div>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Combined Image Previews */}
                            {imagePreviews.length > 0 && (
                                <Card className="border">
                                    <CardHeader className="border-b">
                                        <CardTitle>
                                            Uploaded Images ({imagePreviews.length} images)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {imagePreviews.map((preview, index) => (
                                                <Card key={index} className="relative border border-gray-200 shadow-sm">
                                                    <CardContent className="p-0">
                                                        <img
                                                            src={preview.preview}
                                                            alt={`Property Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-t-lg"
                                                        />
                                                        <div className="p-3 rounded-b-lg">
                                                            <div className="text-xs flex justify-between">
                                                                <span>Option {preview.inputNumber}</span>
                                                                <span>{preview.file ? Math.round(preview.file.size / 1024) : ''}KB</span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 bg-red-500 hover:bg-red-600"
                                                            size="sm"
                                                            disabled={!canEdit}
                                                        >
                                                            ×
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Floating Action Buttons - Right Side */}
            <div className="fixed right-6 bottom-6 flex flex-col gap-4 z-40">
                {canEdit && (
                    <Button
                        type="button"
                        size="icon"
                        onClick={onFinish}
                        disabled={loading}
                        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        title="Save Changes"
                    >
                        <FaSave className="h-6 w-6" />
                    </Button>
                )}

                {canApprove && (
                    <>
                        <Button
                            type="button"
                            size="icon"
                            onClick={() => handleManagerAction("approve")}
                            disabled={loading}
                            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-green-600 hover:bg-green-700"
                            title="Approve Form"
                        >
                            <FaThumbsUp className="h-6 w-6" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            onClick={() => handleManagerAction("reject")}
                            disabled={loading}
                            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-red-600 hover:bg-red-700"
                            title="Reject Form"
                        >
                            <FaThumbsDown className="h-6 w-6" />
                        </Button>
                    </>
                )}
            </div>

            {/* Approval/Rejection Dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {modalAction === "approve" ? "Approve Form" : "Reject Form"}
                        </DialogTitle>
                        <DialogDescription>
                            {modalAction === "approve" ? "Enter approval notes (optional)" : "Please provide feedback for rejection"}
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        placeholder={modalAction === "approve" ? "Enter approval notes (optional)" : "Please provide feedback for rejection"}
                        value={modalFeedback}
                        onChange={(e) => setModalFeedback(e.target.value)}
                        rows={4}
                        autoFocus
                    />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={modalAction === "approve" ? "default" : "destructive"}
                            onClick={handleModalOk}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : (modalAction === "approve" ? "Approve" : "Reject")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditValuationPage;