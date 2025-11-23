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
        customDsa: '',
        engineerName: '',
        customEngineerName: '',
        notes: '',
        customBankName: '',
        customCity: ''
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
                const bankValue = banks.includes(parsedData.bankName) ? parsedData.bankName : "other";
                const cityValue = cities.includes(parsedData.city) ? parsedData.city : "other";
                const dsaValue = ["John Doe", "Jane Smith", "Mike Johnson"].includes(parsedData.dsa) ? parsedData.dsa : "other";
                const engineerValue = ["Bhavesh", "Bhanu", "Ronak", "Mukesh"].includes(parsedData.engineerName) ? parsedData.engineerName : "other";
                setBankName(bankValue);
                setCity(cityValue);
                setFormData(prev => ({
                    ...prev,
                    ...parsedData,
                    directions: parsedData.directions || prev.directions,
                    coordinates: parsedData.coordinates || prev.coordinates,
                    customBankName: bankValue === "other" ? (parsedData.bankName || parsedData.customBankName || "") : "",
                    customCity: cityValue === "other" ? (parsedData.city || parsedData.customCity || "") : "",
                    customDsa: dsaValue === "other" ? (parsedData.dsa || parsedData.customDsa || "") : "",
                    customEngineerName: engineerValue === "other" ? (parsedData.engineerName || parsedData.customEngineerName || "") : "",
                    dsa: dsaValue,
                    engineerName: engineerValue
                }));
                return;
            }
        }

        try {
            const dbData = await getValuationById(id);
            setValuation(dbData);
            const bankValue = banks.includes(dbData.bankName) ? dbData.bankName : "other";
            const cityValue = cities.includes(dbData.city) ? dbData.city : "other";
            const dsaValue = ["John Doe", "Jane Smith", "Mike Johnson"].includes(dbData.dsa) ? dbData.dsa : "other";
            const engineerValue = ["Bhavesh", "Bhanu", "Ronak", "Mukesh"].includes(dbData.engineerName) ? dbData.engineerName : "other";
            setBankName(bankValue);
            setCity(cityValue);
            setFormData(prev => ({
                ...prev,
                ...dbData,
                directions: dbData.directions || prev.directions,
                coordinates: dbData.coordinates || prev.coordinates,
                propertyImages: dbData.propertyImages || [],
                locationImages: dbData.locationImages || [],
                customBankName: bankValue === "other" ? (dbData.bankName || dbData.customBankName || "") : "",
                customCity: cityValue === "other" ? (dbData.city || dbData.customCity || "") : "",
                customDsa: dsaValue === "other" ? (dbData.dsa || dbData.customDsa || "") : "",
                customEngineerName: engineerValue === "other" ? (dbData.engineerName || dbData.customEngineerName || "") : "",
                dsa: dsaValue,
                engineerName: engineerValue
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
                const bankValue = banks.includes(parsedData.bankName) ? parsedData.bankName : "other";
                const cityValue = cities.includes(parsedData.city) ? parsedData.city : "other";
                const dsaValue = ["John Doe", "Jane Smith", "Mike Johnson"].includes(parsedData.dsa) ? parsedData.dsa : "other";
                const engineerValue = ["Bhavesh", "Bhanu", "Ronak", "Mukesh"].includes(parsedData.engineerName) ? parsedData.engineerName : "other";
                setBankName(bankValue);
                setCity(cityValue);
                setFormData(prev => ({
                    ...prev,
                    ...parsedData,
                    directions: parsedData.directions || prev.directions,
                    coordinates: parsedData.coordinates || prev.coordinates,
                    customBankName: bankValue === "other" ? (parsedData.bankName || parsedData.customBankName || "") : "",
                    customCity: cityValue === "other" ? (parsedData.city || parsedData.customCity || "") : "",
                    customDsa: dsaValue === "other" ? (parsedData.dsa || parsedData.customDsa || "") : "",
                    customEngineerName: engineerValue === "other" ? (parsedData.engineerName || parsedData.customEngineerName || "") : "",
                    dsa: dsaValue,
                    engineerName: engineerValue
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
        const finalBankName = bankName === "other" ? formData.customBankName : bankName;
        if (!finalBankName || !finalBankName.trim()) {
            errors.push("Bank Name is required");
        }

        const finalCity = city === "other" ? formData.customCity : city;
        if (!finalCity || !finalCity.trim()) {
            errors.push("City is required");
        }

        // === DSA ===
        const finalDsa = formData.dsa === "other" ? formData.customDsa : formData.dsa;
        if (!finalDsa || !finalDsa.trim()) {
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
            errors.push("property image is required");
        }

        // === LOCATION IMAGES ===
        if (locationImagePreviews.length === 0) {
            errors.push("location image is required");
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
            dispatch(showLoader("Loading Data..."));

            // Build regular JSON payload with trimmed custom values
            const payload = {
                ...formData,
                bankName: bankName === "other" ? (formData.customBankName || "").trim() : bankName,
                city: city === "other" ? (formData.customCity || "").trim() : city,
                dsa: formData.dsa === "other" ? (formData.customDsa || "").trim() : formData.dsa,
                engineerName: formData.engineerName === "other" ? (formData.customEngineerName || "").trim() : formData.engineerName,
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
            // Set bank and city states based on whether they're in default lists
            const bankState = banks.includes(payload.bankName) ? payload.bankName : "other";
            const cityState = cities.includes(payload.city) ? payload.city : "other";
            setBankName(bankState);
            setCity(cityState);
            // Update formData with trimmed custom values
            setFormData(prev => ({
                ...prev,
                ...payload,
                customBankName: bankState === "other" ? payload.bankName : "",
                customCity: cityState === "other" ? payload.city : "",
                customDsa: formData.dsa === "other" ? (payload.dsa || "").trim() : "",
                customEngineerName: formData.engineerName === "other" ? (payload.engineerName || "").trim() : ""
            }));

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
            invalidateCache("/valuations");

            // Update the valuation state with new status
            const updatedValuation = {
                ...valuation,
                status: statusValue,
                managerFeedback: modalFeedback.trim()
            };
            setValuation(updatedValuation);

            showSuccess(`Form ${statusValue} successfully!`);
            dispatch(hideLoader());
            setModalOpen(false);

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 300);
        } catch (err) {
            showError(err.message || `Failed to ${actionLabel.toLowerCase()} form`);
            dispatch(hideLoader());
            setLoading(false);
        }
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

    const canApprove = isLoggedIn && (role === "manager1" || role === "manager2" || role === "admin") &&
        (valuation.status === "pending" || valuation.status === "on-progress" || valuation.status === "rejected");

    // Fields that only managers and admin can edit (users can only read)
    const restrictedEditFields = ["bankName", "city", "clientName", "mobileNumber", "address", "payment", "collectedBy", "dsa", "engineerName"];

    // Check if a specific field is editable for the current user
    const canEditField = (fieldName) => {
        // If user is admin or manager, they can edit all fields
        if (role === "admin" || role === "manager1" || role === "manager2") {
            return canEdit;
        }
        // If user is regular user, they cannot edit restricted fields
        if (role === "user") {
            return canEdit && !restrictedEditFields.includes(fieldName);
        }
        return canEdit;
    };

    const statusColors = {
        "pending": { bg: "bg-yellow-100", text: "text-yellow-800" },
        "on-progress": { bg: "bg-blue-100", text: "text-blue-800" },
        "approved": { bg: "bg-green-100", text: "text-green-800" },
        "rejected": { bg: "bg-red-100", text: "text-red-800" }
    };

    const statusIcons = {
        "pending": <FaCog className="h-4 w-4" />,
        "on-progress": <FaArrowLeft className="h-4 w-4" />,
        "approved": <FaCheckCircle className="h-4 w-4" />,
        "rejected": <FaTimesCircle className="h-4 w-4" />
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-6">
            {!isLoggedIn && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 max-w-sm shadow-2xl">
                        <p className="text-center font-bold text-lg text-gray-900">Please login to edit this valuation</p>
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
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Valuation Form</h1>
                        <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
                    </div>
                </div>

                {/* Status Badge */}
                {valuation?.status && (
                    <Badge className={`w-fit px-4 py-2 rounded-full font-bold ${statusColors[valuation.status]?.bg} ${statusColors[valuation.status]?.text}`}>
                        {statusIcons[valuation.status]} {valuation.status.charAt(0).toUpperCase() + valuation.status.slice(1)}
                    </Badge>
                )}

                {/* Main Content Grid - 2 Card Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column - Form Info Card (1 column) */}
                    <div className="lg:col-span-1">
                        <Card className="h-fit border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b-0">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <FaFileAlt className="h-5 w-5" />
                                    Form Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current User</p>
                                    <p className="text-sm font-bold text-gray-900">{username} <span className="text-xs font-semibold text-orange-600">({role})</span></p>
                                </div>
                                <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Form Status</p>
                                    <p className="text-sm font-bold text-gray-900">{valuation?.status?.charAt(0).toUpperCase() + valuation?.status?.slice(1)}</p>
                                </div>
                                <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date().toLocaleString()}</p>
                                </div>
                                {valuation?.lastUpdatedBy && (
                                    <>
                                        <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated By</p>
                                            <p className="text-sm font-bold text-gray-900">{valuation.lastUpdatedBy}</p>
                                        </div>
                                    </>
                                )}
                                <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Form ID</p>
                                    <code className="bg-orange-50 px-3 py-2 rounded-lg text-xs font-mono break-all text-orange-700 border border-orange-200 block">{id}</code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Main Form Card (3 columns) */}
                    <div className="lg:col-span-3">
                        <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
                            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b-0">
                                <CardTitle className="text-xl font-bold">Property Details & Information</CardTitle>
                                <p className="text-orange-100 text-sm mt-1">Fill in all required fields marked with *</p>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-8">

                                    {/* Client Information Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
                                        <div className="space-y-2">
                                            <Label htmlFor="clientName" className="text-sm font-bold text-gray-900">Client Name *</Label>
                                            <Input
                                                id="clientName"
                                                placeholder="Enter client name"
                                                name="clientName"
                                                value={formData.clientName || ""}
                                                onChange={handleInputChange}
                                                disabled={!canEditField("clientName")}
                                                className="h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mobileNumber" className="text-sm font-bold text-gray-900">Mobile Number *</Label>
                                            <Input
                                                id="mobileNumber"
                                                placeholder="10-digit number"
                                                name="mobileNumber"
                                                value={formData.mobileNumber || ""}
                                                onChange={handleInputChange}
                                                maxLength={10}
                                                inputMode="numeric"
                                                disabled={!canEditField("mobileNumber")}
                                                className="h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="address" className="text-sm font-bold text-gray-900">Address *</Label>
                                            <Input
                                                id="address"
                                                placeholder="Enter complete address"
                                                name="address"
                                                value={formData.address || ""}
                                                onChange={handleInputChange}
                                                disabled={!canEditField("address")}
                                                className="h-11 text-sm w-full rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Bank Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-bold text-gray-900 mb-3 block">Bank Name *</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {banks.map(bank => (
                                                    <Button
                                                        key={bank}
                                                        type="button"
                                                        variant={bankName === bank ? "default" : "outline"}
                                                        className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${bankName === bank
                                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                            : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            }`}
                                                        onClick={() => setBankName(bank)}
                                                        disabled={!canEditField("bankName")}
                                                    >
                                                        {bank}
                                                    </Button>
                                                ))}
                                                <div className="relative">
                                                    {bankName === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter bank name"
                                                            value={formData.customBankName}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, customBankName: e.target.value }))}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!canEditField("bankName")}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => setBankName("other")}
                                                            disabled={!canEditField("bankName")}
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
                                                {cities.map(c => (
                                                    <Button
                                                        key={c}
                                                        type="button"
                                                        variant={city === c ? "default" : "outline"}
                                                        className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${city === c
                                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                            : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            }`}
                                                        onClick={() => setCity(c)}
                                                        disabled={!canEditField("city")}
                                                    >
                                                        {c}
                                                    </Button>
                                                ))}
                                                <div className="relative">
                                                    {city === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter city name"
                                                            value={formData.customCity}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, customCity: e.target.value }))}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!canEditField("city")}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => setCity("other")}
                                                            disabled={!canEditField("city")}
                                                        >
                                                            Other
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DSA Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-bold text-gray-900 mb-3 block">Sales Agent (DSA) *</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {dsaNames.map(dsa => (
                                                    <Button
                                                        key={dsa}
                                                        type="button"
                                                        variant={formData.dsa === dsa ? "default" : "outline"}
                                                        className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${formData.dsa === dsa
                                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                            : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            }`}
                                                        onClick={() => setFormData(prev => ({ ...prev, dsa: dsa, customDsa: "" }))}
                                                        disabled={!canEditField("dsa")}
                                                    >
                                                        {dsa}
                                                    </Button>
                                                ))}
                                                <div className="relative">
                                                    {formData.dsa === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter DSA name"
                                                            value={formData.customDsa}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, customDsa: e.target.value }))}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!canEditField("dsa")}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => setFormData(prev => ({ ...prev, dsa: "other", customDsa: "" }))}
                                                            disabled={!canEditField("dsa")}
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
                                            <Label className="text-sm font-bold text-gray-900 mb-3 block">Engineer Name</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {["Bhavesh", "Bhanu", "Ronak", "Mukesh"].map(engineer => (
                                                    <Button
                                                        key={engineer}
                                                        type="button"
                                                        variant={formData.engineerName === engineer ? "default" : "outline"}
                                                        className={`h-10 w-full text-sm font-semibold rounded-xl transition-all ${formData.engineerName === engineer
                                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
                                                            : "border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            }`}
                                                        onClick={() => setFormData(prev => ({ ...prev, engineerName: engineer, customEngineerName: "" }))}
                                                        disabled={!canEditField("engineerName")}
                                                    >
                                                        {engineer}
                                                    </Button>
                                                ))}
                                                <div className="relative">
                                                    {formData.engineerName === "other" ? (
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter engineer name"
                                                            value={formData.customEngineerName}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, customEngineerName: e.target.value }))}
                                                            className="h-10 text-sm rounded-xl border-2 border-orange-300 bg-orange-50 focus:border-orange-500 focus:ring-orange-200"
                                                            autoFocus
                                                            disabled={!canEditField("engineerName")}
                                                        />
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 w-full text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                                                            onClick={() => setFormData(prev => ({ ...prev, engineerName: "other", customEngineerName: "" }))}
                                                            disabled={!canEditField("engineerName")}
                                                        >
                                                            Other
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-gray-200"></div>

                                    {/* Payment Section */}
                                    <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
                                        <Label className="text-sm font-bold text-gray-900 block">Payment Status *</Label>
                                        <RadioGroup value={formData.payment} onValueChange={(val) => setFormData(prev => ({ ...prev, payment: val }))} disabled={!canEditField("payment")} className="flex gap-6">
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <RadioGroupItem value="yes" id="payment-yes" disabled={!canEditField("payment")} className="w-5 h-5 border-2 border-green-500" />
                                                <Label htmlFor="payment-yes" className="text-base font-semibold cursor-pointer text-gray-900">Payment Collected</Label>
                                            </div>
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <RadioGroupItem value="no" id="payment-no" disabled={!canEditField("payment")} className="w-5 h-5 border-2 border-red-500" />
                                                <Label htmlFor="payment-no" className="text-base font-semibold cursor-pointer text-gray-900">Pending</Label>
                                            </div>
                                        </RadioGroup>

                                        {formData.payment === "yes" && (
                                            <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
                                                <Label htmlFor="collectedBy" className="text-sm font-bold text-gray-900">Collected By *</Label>
                                                <Input
                                                    id="collectedBy"
                                                    placeholder="Enter collector's name/details"
                                                    name="collectedBy"
                                                    value={formData.collectedBy}
                                                    onChange={handleInputChange}
                                                    className="h-11 text-sm w-full rounded-xl border-2 border-green-300 focus:border-green-500 focus:ring-green-200 font-medium bg-white"
                                                    disabled={!canEditField("collectedBy")}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t-2 border-gray-200"></div>

                                    {/* Notes Section */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaFileAlt className="h-5 w-5 text-orange-600" />
                                            Additional Notes
                                        </h3>
                                        <div className="space-y-2">
                                            <Textarea
                                                placeholder="Enter any additional notes or comments..."
                                                name="notes"
                                                value={formData.notes || ""}
                                                onChange={handleInputChange}
                                                disabled={!canEdit}
                                                rows={4}
                                                className="rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-gray-200"></div>

                                    {/* Property Directions Section */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaCompass className="h-5 w-5 text-orange-600" />
                                            Property Directions
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">Enter property directions as per sale deed and site visit</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                            {/* AS PER SALE DEED Card */}
                                            <Card className="border-2 border-red-200 rounded-2xl">
                                                <CardHeader className="bg-red-50 border-b-2 border-red-200 p-4">
                                                    <CardTitle className="text-center text-red-700 font-bold">AS PER SALE DEED</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="compass-layout space-y-4">
                                                        <Input
                                                            placeholder="North"
                                                            value={formData.directions.north1}
                                                            onChange={(e) => handleDirectionChange('north1', e.target.value)}
                                                            className="text-center text-lg font-bold h-11 rounded-xl border-2 border-red-200 focus:border-red-500 focus:ring-red-200"
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
                                    </div>

                                    <div className="border-t-2 border-gray-200"></div>

                                    {/* Location Images Section */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaMapMarkerAlt className="h-5 w-5 text-orange-600" />
                                            Location Images
                                        </h3>
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

                                            {/* Coordinates Card */}
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-gray-200"></div>

                                    {/* Property Images Section */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaUpload className="h-5 w-5 text-orange-600" />
                                            Property Images
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">Upload property images - 4 separate upload options</p>
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
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="border-t-2 border-gray-200 pt-6 mt-6">
                                        <div className="flex gap-3">
                                            {canEdit && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        onClick={onFinish}
                                                        disabled={loading}
                                                        className="flex-1 h-12 text-base font-bold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                        title="Save Changes"
                                                    >
                                                        Save Changes
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
                                                </>
                                            )}

                                            {canApprove && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleManagerAction("approve")}
                                                        disabled={loading}
                                                        className="flex-1 h-12 text-base font-bold rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                        title="Approve Form"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleManagerAction("reject")}
                                                        disabled={loading}
                                                        className="flex-1 h-12 text-base font-bold rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
                                                        title="Reject Form"
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                        </div>

                                        </div>
                                        </CardContent>
                                        </Card>
                                        </div>
                                        </div>
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
