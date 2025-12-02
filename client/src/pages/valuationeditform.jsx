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
    FaThumbsDown,
    FaRedo
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
    const [activeTab, setActiveTab] = useState("client");
    const [activeValuationSubTab, setActiveValuationSubTab] = useState("documents");
    const [formData, setFormData] = useState({
        // BASIC INFO
        uniqueId: '',
        username: '',
        dateTime: '',
        day: '',

        // BANK & CITY
        bankName: '',
        city: '',

        // CLIENT DETAILS
        clientName: '',
        mobileNumber: '',
        address: '',

        // PAYMENT
        payment: '',
        collectedBy: '',

        // DSA
        dsa: '',
        customDsa: '',

        // ENGINEER
        engineerName: '',
        customEngineerName: '',

        // NOTES
        notes: '',

        // PROPERTY BASIC DETAILS
        elevation: '',
        // DIRECTIONS
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

        // COORDINATES
        coordinates: {
            latitude: '',
            longitude: ''
        },

        // IMAGES
        propertyImages: [],
        locationImages: [],
        photos: {
            elevationImages: [],
            siteImages: []
        },

        // STATUS
        status: 'pending',
        managerFeedback: '',
        submittedByManager: false,
        lastUpdatedBy: '',
        lastUpdatedByRole: '',

        // PDF DETAILS (AUTO-EXTRACTED)
        pdfDetails: {
            formId: '',
            branch: '',
            valuationPurpose: '',
            inspectionDate: '',
            valuationMadeDate: '',

            mortgageDeed: '',
            mortgageDeedBetween: '',
            previousValuationReport: '',
            previousValuationInFavorOf: '',
            approvedPlanNo: '',

            ownerName: '',

            // PROPERTY DESCRIPTION
            plotSurveyBlockNo: '',
            doorShopNo: '',
            tpVillage: '',
            wardTaluka: '',
            mandalDistrict: '',
            layoutPlanIssueDate: '',
            approvedMapAuthority: '',
            authenticityVerified: '',
            valuerCommentOnAuthenticity: '',

            postalAddress: '',
            cityTown: '',
            residentialArea: '',
            commercialArea: '',
            industrialArea: '',
            locationOfProperty: '',

            // AREA DETAILS
            classificationArea: '',
            urbanType: '',
            underCorporation: '',
            govtEnactmentCover: '',

            boundariesDocument: {
                east: '',
                west: '',
                north: '',
                south: ''
            },
            boundariesActual: {
                east: '',
                west: '',
                north: '',
                south: ''
            },

            builtUpArea: '',
            carpetArea: '',
            udsLand: '',

            latitudeLongitude: '',
            siteConsideredArea: '',
            occupancyStatus: '',

            // APARTMENT DETAILS
            apartmentNature: '',
            apartmentLocation: '',
            surveyBlockNo: '',
            tpFpNo: '',
            villageMunicipality: '',
            doorStreet: '',
            localityDescription: '',
            constructionYear: '',
            numberOfFloors: '',
            structureType: '',
            dwellingUnits: '',
            qualityOfConstruction: '',
            buildingAppearance: '',
            buildingMaintenance: '',

            facilities: {
                lift: false,
                waterSupply: false,
                sewerage: false,
                parking: false,
                compoundWall: false,
                pavement: false
            },

            flatFloor: '',
            flatDoorNo: '',
            flatSpecifications: {
                specifications: '',
                roof: '',
                flooring: '',
                doors: '',
                windows: '',
                fittings: '',
                finishing: ''
            },

            houseTax: {
                assessmentNo: '',
                taxPaidBy: '',
                taxAmount: ''
            },
            electricityConnection: {
                connectionNo: '',
                meterName: ''
            },

            flatMaintenance: '',
            saleDeedName: '',
            undividedLandArea: '',
            plinthArea: '',
            fsi: '',
            carpetAreaValuation: '',
            flatClass: '',
            usage: '',
            occupancy: '',
            rent: '',

            // MARKET VALUE ANALYSIS
            marketability: '',
            positiveFactors: '',
            negativeFactors: '',
            compositeRate: '',

            jantriRate: '',
            basicCompositeRate: '',
            buildingServiceRate: '',
            landOtherRate: '',

            depreciatedBuildingRate: '',
            replacementCost: '',
            buildingAge: '',
            buildingLife: '',
            depreciationPercentage: '',
            depreciatedRatio: '',

            finalCompositeRate: '',
            presentValue: '',
            furnitureFixtureValue: '',
            totalValue: '',

            fairMarketValue: '',
            realizableValue: '',
            distressValue: '',
            saleDeedValue: '',
            insurableValue: '',
            totalJantriValue: '',

            // FLAT SPECIFICATIONS EXTENDED
            areaUsage: '',
            carpetAreaFlat: '',

            // SIGNATURE & REPORT DETAILS
            place: '',
            signatureDate: '',
            signerName: '',
            reportDate: '',
            fairMarketValueWords: ''
        },

        // CUSTOM FIELDS FOR DROPDOWN HANDLING
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

    const handleLettersOnlyInputChange = (e, callback) => {
        const { name, value } = e.target;
        const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
        if (callback) {
            callback(lettersOnly);
        } else {
            setFormData(prev => ({ ...prev, [name]: lettersOnly }));
        }
    };

    const handleIntegerInputChange = (e, callback) => {
        const { name, value } = e.target;
        const numbersOnly = value.replace(/[^0-9]/g, '');
        if (callback) {
            callback(numbersOnly);
        } else {
            setFormData(prev => ({ ...prev, [name]: numbersOnly }));
        }
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

        // === MARKET APPLICATIONS / DSA (Sales Agent) ===
        const finalDsa = formData.dsa === "other" ? formData.customDsa : formData.dsa;
        if (!finalDsa || !finalDsa.trim()) {
            errors.push("Market Applications / DSA (Sales Agent) is required");
        }

        // === ENGINEER NAME ===
        const finalEngineerName = formData.engineerName === "other" ? formData.customEngineerName : formData.engineerName;
        if (!finalEngineerName || !finalEngineerName.trim()) {
            errors.push("Engineer Name is required");
        }

        // === PAYMENT INFORMATION ===
        if (formData.payment === "yes" && (!formData.collectedBy || !formData.collectedBy.trim())) {
            errors.push("Collected By name is required when payment is collected");
        }

        // === GPS COORDINATES VALIDATION ===
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

        // === PROPERTY IMAGES VALIDATION ===
        if (imagePreviews.length === 0) {
            errors.push("Property image is required");
        }

        // === LOCATION IMAGES VALIDATION ===
        if (locationImagePreviews.length === 0) {
            errors.push("Location image is required");
        }

        return errors;
    };

    const validatePdfDetails = () => {
        const errors = [];

        return errors;
    };

    const onFinish = async (e) => {
        e.preventDefault();

        const isUserUpdate = role === "user" && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "rework");
        const isManagerUpdate = (role === "manager1" || role === "manager2") && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "on-progress");
        const isAdminUpdate = role === "admin";

        if (!isUserUpdate && !isManagerUpdate && !isAdminUpdate) {
            showError("You don't have permission to update this form");
            return;
        }

        // Validate form
        const validationErrors = validateForm();
        const pdfDetailsErrors = validatePdfDetails();
        const allErrors = [...validationErrors, ...pdfDetailsErrors];
        if (allErrors.length > 0) {
            // Show single consolidated error instead of multiple notifications
            showError(` ${allErrors.join(", ")}`);
            return;
        }

        try {
            setLoading(true);
            dispatch(showLoader("Loading Data..."));

            // Build complete payload with all form data including pdfDetails
            const payload = {
                // Basic Info
                dateTime: formData.dateTime,
                day: formData.day,

                // Bank & City
                bankName: bankName === "other" ? (formData.customBankName || "").trim() : bankName,
                city: city === "other" ? (formData.customCity || "").trim() : city,

                // Client Details
                clientName: formData.clientName,
                mobileNumber: formData.mobileNumber,
                address: formData.address,

                // Payment
                payment: formData.payment,
                collectedBy: formData.collectedBy,

                // DSA & Engineer
                dsa: formData.dsa === "other" ? (formData.customDsa || "").trim() : formData.dsa,
                engineerName: formData.engineerName === "other" ? (formData.customEngineerName || "").trim() : formData.engineerName,

                // Notes
                notes: formData.notes,

                // Property Basic Details
                elevation: formData.elevation,
                longLat: formData.longLat,

                // Directions
                directions: formData.directions,

                // Coordinates
                coordinates: formData.coordinates,

                // Status fields
                status: formData.status || "pending",
                managerFeedback: formData.managerFeedback,
                submittedByManager: formData.submittedByManager,

                // Complete PDF Details with all sub-fields
                pdfDetails: {
                    formId: formData.pdfDetails?.formId || "",
                    branch: formData.pdfDetails?.branch || "",
                    valuationPurpose: formData.pdfDetails?.valuationPurpose || "",
                    inspectionDate: formData.pdfDetails?.inspectionDate || "",
                    valuationMadeDate: formData.pdfDetails?.valuationMadeDate || "",
                    mortgageDeed: formData.pdfDetails?.mortgageDeed || "",
                    mortgageDeedBetween: formData.pdfDetails?.mortgageDeedBetween || "",
                    previousValuationReport: formData.pdfDetails?.previousValuationReport || "",
                    previousValuationInFavorOf: formData.pdfDetails?.previousValuationInFavorOf || "",
                    approvedPlanNo: formData.pdfDetails?.approvedPlanNo || "",
                    ownerName: formData.pdfDetails?.ownerName || "",

                    // Property Description
                    plotSurveyBlockNo: formData.pdfDetails?.plotSurveyBlockNo || "",
                    doorShopNo: formData.pdfDetails?.doorShopNo || "",
                    tpVillage: formData.pdfDetails?.tpVillage || "",
                    wardTaluka: formData.pdfDetails?.wardTaluka || "",
                    mandalDistrict: formData.pdfDetails?.mandalDistrict || "",
                    layoutPlanIssueDate: formData.pdfDetails?.layoutPlanIssueDate || "",
                    approvedMapAuthority: formData.pdfDetails?.approvedMapAuthority || "",
                    authenticityVerified: formData.pdfDetails?.authenticityVerified || "",
                    valuerCommentOnAuthenticity: formData.pdfDetails?.valuerCommentOnAuthenticity || "",

                    // Location Details
                    postalAddress: formData.pdfDetails?.postalAddress || "",
                    cityTown: formData.pdfDetails?.cityTown || "",
                    residentialArea: formData.pdfDetails?.residentialArea || "",
                    commercialArea: formData.pdfDetails?.commercialArea || "",
                    industrialArea: formData.pdfDetails?.industrialArea || "",
                    locationOfProperty: formData.pdfDetails?.locationOfProperty || "",

                    // Area Classification
                    classificationArea: formData.pdfDetails?.classificationArea || "",
                    urbanType: formData.pdfDetails?.urbanType || "",
                    underCorporation: formData.pdfDetails?.underCorporation || "",
                    govtEnactmentCover: formData.pdfDetails?.govtEnactmentCover || "",

                    // Boundaries
                    boundariesDocument: formData.pdfDetails?.boundariesDocument || {
                        east: "",
                        west: "",
                        north: "",
                        south: ""
                    },
                    boundariesActual: formData.pdfDetails?.boundariesActual || {
                        east: "",
                        west: "",
                        north: "",
                        south: ""
                    },

                    // Area Details
                    builtUpArea: formData.pdfDetails?.builtUpArea || "",
                    carpetArea: formData.pdfDetails?.carpetArea || "",
                    udsLand: formData.pdfDetails?.udsLand || "",
                    latitudeLongitude: formData.pdfDetails?.latitudeLongitude || "",
                    siteConsideredArea: formData.pdfDetails?.siteConsideredArea || "",
                    occupancyStatus: formData.pdfDetails?.occupancyStatus || "",

                    // Apartment Details
                    apartmentNature: formData.pdfDetails?.apartmentNature || "",
                    apartmentLocation: formData.pdfDetails?.apartmentLocation || "",
                    surveyBlockNo: formData.pdfDetails?.surveyBlockNo || "",
                    tpFpNo: formData.pdfDetails?.tpFpNo || "",
                    villageMunicipality: formData.pdfDetails?.villageMunicipality || "",
                    doorStreet: formData.pdfDetails?.doorStreet || "",
                    localityDescription: formData.pdfDetails?.localityDescription || "",
                    constructionYear: formData.pdfDetails?.constructionYear || "",
                    numberOfFloors: formData.pdfDetails?.numberOfFloors || "",
                    structureType: formData.pdfDetails?.structureType || "",
                    dwellingUnits: formData.pdfDetails?.dwellingUnits || "",
                    qualityOfConstruction: formData.pdfDetails?.qualityOfConstruction || "",
                    buildingAppearance: formData.pdfDetails?.buildingAppearance || "",
                    buildingMaintenance: formData.pdfDetails?.buildingMaintenance || "",

                    // Facilities
                    facilities: formData.pdfDetails?.facilities || {
                        lift: false,
                        waterSupply: false,
                        sewerage: false,
                        parking: false,
                        compoundWall: false,
                        pavement: false
                    },

                    // Flat Details
                    flatFloor: formData.pdfDetails?.flatFloor || "",
                    flatDoorNo: formData.pdfDetails?.flatDoorNo || "",
                    flatSpecifications: formData.pdfDetails?.flatSpecifications || {
                        specifications: "",
                        roof: "",
                        flooring: "",
                        doors: "",
                        windows: "",
                        fittings: "",
                        finishing: ""
                    },

                    // House Tax & Electricity
                    houseTax: formData.pdfDetails?.houseTax || {
                        assessmentNo: "",
                        taxPaidBy: "",
                        taxAmount: ""
                    },
                    electricityConnection: formData.pdfDetails?.electricityConnection || {
                        connectionNo: "",
                        meterName: ""
                    },

                    // Additional Property Details
                    flatMaintenance: formData.pdfDetails?.flatMaintenance || "",
                    saleDeedName: formData.pdfDetails?.saleDeedName || "",
                    undividedLandArea: formData.pdfDetails?.undividedLandArea || "",
                    plinthArea: formData.pdfDetails?.plinthArea || "",
                    fsi: formData.pdfDetails?.fsi || "",
                    carpetAreaValuation: formData.pdfDetails?.carpetAreaValuation || "",
                    flatClass: formData.pdfDetails?.flatClass || "",
                    usage: formData.pdfDetails?.usage || "",
                    occupancy: formData.pdfDetails?.occupancy || "",
                    rent: formData.pdfDetails?.rent || "",

                    // Market Value Analysis - Rates & Factors
                    marketability: formData.pdfDetails?.marketability || "",
                    positiveFactors: formData.pdfDetails?.positiveFactors || "",
                    negativeFactors: formData.pdfDetails?.negativeFactors || "",
                    compositeRate: formData.pdfDetails?.compositeRate || "",
                    jantriRate: formData.pdfDetails?.jantriRate || "",
                    basicCompositeRate: formData.pdfDetails?.basicCompositeRate || "",
                    buildingServiceRate: formData.pdfDetails?.buildingServiceRate || "",
                    landOtherRate: formData.pdfDetails?.landOtherRate || "",

                    // Depreciation & Building Analysis
                    depreciatedBuildingRate: formData.pdfDetails?.depreciatedBuildingRate || "",
                    replacementCost: formData.pdfDetails?.replacementCost || "",
                    buildingAge: formData.pdfDetails?.buildingAge || "",
                    buildingLife: formData.pdfDetails?.buildingLife || "",
                    depreciationPercentage: formData.pdfDetails?.depreciationPercentage || "",
                    depreciatedRatio: formData.pdfDetails?.depreciatedRatio || "",
                    finalCompositeRate: formData.pdfDetails?.finalCompositeRate || "",
                    presentValue: formData.pdfDetails?.presentValue || "",
                    furnitureFixtureValue: formData.pdfDetails?.furnitureFixtureValue || "",
                    totalValue: formData.pdfDetails?.totalValue || "",

                    // Valuation Results
                    fairMarketValue: formData.pdfDetails?.fairMarketValue || "",
                    realizableValue: formData.pdfDetails?.realizableValue || "",
                    distressValue: formData.pdfDetails?.distressValue || "",
                    saleDeedValue: formData.pdfDetails?.saleDeedValue || "",
                    insurableValue: formData.pdfDetails?.insurableValue || "",
                    totalJantriValue: formData.pdfDetails?.totalJantriValue || "",

                    // Flat Specifications Extended
                    areaUsage: formData.pdfDetails?.areaUsage || "",
                    carpetAreaFlat: formData.pdfDetails?.carpetAreaFlat || "",

                    // Signature & Report Details
                    place: formData.pdfDetails?.place || "",
                    signatureDate: formData.pdfDetails?.signatureDate || "",
                    signerName: formData.pdfDetails?.signerName || "",
                    reportDate: formData.pdfDetails?.reportDate || "",
                    fairMarketValueWords: formData.pdfDetails?.fairMarketValueWords || ""
                }
            };

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

            // Debug: Log payload to verify pdfDetails is included
            console.log("ONFINISH - Sending payload with pdfDetails:", payload.pdfDetails ? "YES" : "NO");
            console.log("ONFINISH - pdfDetails keys count:", payload.pdfDetails ? Object.keys(payload.pdfDetails).length : 0);

            // Call API to update valuation with complete JSON payload
            const apiResponse = await updateValuation(id, payload);

            // Invalidate cache to ensure fresh data on dashboard
            invalidateCache("/valuations");

            // Get the actual status from API response (server determines correct status)
            const newStatus = apiResponse?.status || payload.status || "on-progress";

            // Update local state with API response and actual server status
            const updatedValuation = {
                ...valuation,
                ...(apiResponse || {}),
                ...payload,
                status: newStatus,
                lastUpdatedBy: apiResponse?.lastUpdatedBy || username,
                lastUpdatedByRole: apiResponse?.lastUpdatedByRole || role,
                lastUpdatedAt: apiResponse?.lastUpdatedAt || new Date().toISOString()
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
                            <p className="text-muted-foreground"></p>
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
            "rejected": "destructive",
            "rework": "outline"
        };
        return colors[status] || "default";
    };

    // Permission checks
    const canEdit = isLoggedIn && (
        (role === "admin") ||
        ((role === "manager1" || role === "manager2") && (valuation.status === "pending" || valuation.status === "rejected" || valuation.status === "on-progress")) ||
        ((role === "user") && (valuation.status === "rejected" || valuation.status === "pending" || valuation.status === "rework"))
    );

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
        "rejected": { bg: "bg-red-100", text: "text-red-800" },
        "rework": { bg: "bg-orange-100", text: "text-orange-800" }
    };

    const statusIcons = {
        "pending": <FaCog className="h-4 w-4" />,
        "on-progress": <FaArrowLeft className="h-4 w-4" />,
        "approved": <FaCheckCircle className="h-4 w-4" />,
        "rejected": <FaTimesCircle className="h-4 w-4" />,
        "rework": <FaRedo className="h-4 w-4" />
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

                {/* Rework Comments Section */}
                {valuation?.status === "rework" && valuation?.reworkComments && (
                    <Card className="border-l-4 border-l-orange-500 bg-orange-50 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-2">
                                <FaRedo className="h-5 w-5" />
                                Rework Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-4 rounded-lg border border-orange-200">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{valuation.reworkComments}</p>
                                {valuation.reworkRequestedBy && (
                                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                                        Requested by: <span className="font-semibold">{valuation.reworkRequestedBy}</span>
                                        {valuation.reworkRequestedAt && (
                                            <span> on {new Date(valuation.reworkRequestedAt).toLocaleString()}</span>
                                        )}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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

                                    {/* Tab Navigation - Below Payment Status */}
                                    <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                        <button
                                            onClick={() => setActiveTab("client")}
                                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === "client"
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                                                : "bg-white border-2 border-gray-300 text-gray-900 hover:border-orange-500"
                                                }`}
                                        >
                                            Client Info
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("property")}
                                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === "property"
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                                                : "bg-white border-2 border-gray-300 text-gray-900 hover:border-orange-500"
                                                }`}
                                        >
                                            Property & Payment
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("documents")}
                                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === "documents"
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                                                : "bg-white border-2 border-gray-300 text-gray-900 hover:border-orange-500"
                                                }`}
                                        >
                                            Documents & Notes
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("valuation")}
                                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === "valuation"
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                                                : "bg-white border-2 border-gray-300 text-gray-900 hover:border-orange-500"
                                                }`}
                                        >
                                            Valuation
                                        </button>
                                    </div>

                                    {/* CLIENT INFORMATION Section */}
                                    {activeTab === "client" && (
                                        <>

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
                                                        onChange={(e) => {
                                                            handleIntegerInputChange(e, (value) => {
                                                                setFormData(prev => ({ ...prev, mobileNumber: value }));
                                                            });
                                                        }}
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
                                                                    name="customBankName"
                                                                    value={formData.customBankName}
                                                                    onChange={handleInputChange}
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
                                                                    name="customCity"
                                                                    value={formData.customCity}
                                                                    onChange={handleInputChange}
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
                                                                    name="customDsa"
                                                                    value={formData.customDsa}
                                                                    onChange={handleInputChange}
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
                                                                    name="customEngineerName"
                                                                    value={formData.customEngineerName}
                                                                    onChange={handleInputChange}
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

                                        </>
                                    )}



                                    {/* PROPERTY & PAYMENT Section */}
                                    {activeTab === "property" && (
                                        <>

                                            {/* Property Basic Details Section */}
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <FaBuilding className="h-5 w-5 text-orange-600" />
                                                        Property Basic Details
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="elevation" className="text-sm font-bold text-gray-900">Elevation</Label>
                                                            <Input
                                                                id="elevation"
                                                                placeholder="Enter elevation details"
                                                                name="elevation"
                                                                value={formData.elevation || ""}
                                                                onChange={handleInputChange}
                                                                disabled={!canEdit}
                                                                className="h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Section */}
                                            <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 mt-6">
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

                                        </>
                                    )}

                                    {/* DOCUMENTS & NOTES Section */}
                                    {activeTab === "documents" && (
                                        <>

                                            {/* Location Images Section */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <FaMapMarkerAlt className="h-5 w-5 text-orange-600" />
                                                    Location Images & Coordinates
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
                                                        {[1, 2, 3, 4].map((num) => {
                                                            const roomNames = { 1: 'Kitchen', 2: 'Hall', 3: 'Bedroom', 4: 'Elevation' };
                                                            return (
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
                                                                                <div className="text-sm font-medium">Upload {roomNames[num]} Images</div>
                                                                            </div>
                                                                        </Button>
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        })}
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

                                            {/* Notes Section */}
                                            <div className="mt-6">
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

                                        </>
                                    )}

                                    {/* VALUATION Section */}
                                    {activeTab === "valuation" && (
                                        <>

                                            {/* Valuation Sub-Tabs Navigation */}
                                            <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-2xl border border-gray-200 mb-6">
                                                <button
                                                    onClick={() => setActiveValuationSubTab("documents")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "documents"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Documents
                                                </button>
                                                <button
                                                    onClick={() => setActiveValuationSubTab("property")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "property"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Property
                                                </button>
                                                <button
                                                    onClick={() => setActiveValuationSubTab("facilities")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "facilities"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Facilities & Flat
                                                </button>
                                                <button
                                                    onClick={() => setActiveValuationSubTab("analysis")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "analysis"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Market Analysis
                                                </button>
                                                <button
                                                    onClick={() => setActiveValuationSubTab("results")}
                                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeValuationSubTab === "results"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                                        : "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-500"
                                                        }`}
                                                >
                                                    Results & Signature
                                                </button>
                                            </div>

                                            {/* PDF Details Section */}
                                            {activeValuationSubTab === "documents" && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <FaFileAlt className="h-5 w-5 text-orange-600" />
                                                        PDF Details
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-6">Property valuation details</p>

                                                    {/* Basic Document Info */}
                                                    <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Document Information</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Branch</Label>
                                                                <Input
                                                                    placeholder="Branch"
                                                                    value={formData.pdfDetails?.branch || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, branch: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-200"
                                                                />
                                                            </div>

                                                        </div>
                                                    </div>

                                                    {/* Document References */}
                                                    <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Document References</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Mortgage Deed</Label>
                                                                <Input
                                                                    placeholder="Mortgage deed"
                                                                    value={formData.pdfDetails?.mortgageDeed || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, mortgageDeed: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Mortgage Deed Between</Label>
                                                                <Input
                                                                    placeholder="Mortgage deed between"
                                                                    value={formData.pdfDetails?.mortgageDeedBetween || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, mortgageDeedBetween: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Previous Valuation Report</Label>
                                                                <Input
                                                                    placeholder="Previous valuation report"
                                                                    value={formData.pdfDetails?.previousValuationReport || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, previousValuationReport: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Previous Valuation in Favor Of</Label>
                                                                <Input
                                                                    placeholder="Previous valuation in favor of"
                                                                    value={formData.pdfDetails?.previousValuationInFavorOf || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, previousValuationInFavorOf: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Approved Plan No</Label>
                                                                <Input
                                                                    placeholder="Approved plan no"
                                                                    value={formData.pdfDetails?.approvedPlanNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, approvedPlanNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-yellow-200 focus:border-yellow-500 focus:ring-yellow-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Valuation Dates */}
                                                    <div className="mb-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Valuation Dates</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Valuation Purpose</Label>
                                                                <Input
                                                                    placeholder="Purpose"
                                                                    value={formData.pdfDetails?.valuationPurpose || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, valuationPurpose: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-green-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Inspection Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.inspectionDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, inspectionDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-green-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Valuation Made Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.valuationMadeDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, valuationMadeDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-green-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Property Details Section */}
                                            {activeValuationSubTab === "property" && (
                                                <div>

                                                    {/* Property Owner & Description */}
                                                    <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Property Description</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Owner Name</Label>
                                                                <Input
                                                                    placeholder="Owner name"
                                                                    value={formData.pdfDetails?.ownerName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, ownerName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Plot/Survey Block No</Label>
                                                                <Input
                                                                    placeholder="Plot/Survey block no"
                                                                    value={formData.pdfDetails?.plotSurveyBlockNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, plotSurveyBlockNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Door/Shop No</Label>
                                                                <Input
                                                                    placeholder="Door/shop no"
                                                                    value={formData.pdfDetails?.doorShopNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, doorShopNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Village/Town</Label>
                                                                <Input
                                                                    placeholder="Village/town"
                                                                    value={formData.pdfDetails?.tpVillage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, tpVillage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Ward/Taluka</Label>
                                                                <Input
                                                                    placeholder="Ward/taluka"
                                                                    value={formData.pdfDetails?.wardTaluka || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, wardTaluka: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Mandal/District</Label>
                                                                <Input
                                                                    placeholder="Mandal/district"
                                                                    value={formData.pdfDetails?.mandalDistrict || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, mandalDistrict: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Layout Plan Issue Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.layoutPlanIssueDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, layoutPlanIssueDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Approved Map Authority</Label>
                                                                <Input
                                                                    placeholder="Approved map authority"
                                                                    value={formData.pdfDetails?.approvedMapAuthority || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, approvedMapAuthority: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Authenticity Verified</Label>
                                                                <Input
                                                                    placeholder="Authenticity verified"
                                                                    value={formData.pdfDetails?.authenticityVerified || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, authenticityVerified: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Valuer Comment on Authenticity</Label>
                                                                <Input
                                                                    placeholder="Valuer comment"
                                                                    value={formData.pdfDetails?.valuerCommentOnAuthenticity || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, valuerCommentOnAuthenticity: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Location Details */}
                                                    <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Location Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">City/Town</Label>
                                                                <Input
                                                                    placeholder="City/town"
                                                                    name="cityTown"
                                                                    value={formData.pdfDetails?.cityTown || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, cityTown: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Residential Area</Label>
                                                                <Input
                                                                    placeholder="Residential area"
                                                                    name="residentialArea"
                                                                    value={formData.pdfDetails?.residentialArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, residentialArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Commercial Area</Label>
                                                                <Input
                                                                    placeholder="Commercial area"
                                                                    name="commercialArea"
                                                                    value={formData.pdfDetails?.commercialArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, commercialArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Industrial Area</Label>
                                                                <Input
                                                                    placeholder="Industrial area"
                                                                    name="industrialArea"
                                                                    value={formData.pdfDetails?.industrialArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, industrialArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Location of Property</Label>
                                                                <Input
                                                                    placeholder="Location of property"
                                                                    name="locationOfProperty"
                                                                    value={formData.pdfDetails?.locationOfProperty || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, locationOfProperty: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Area Classification */}
                                                    <div className="mb-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Area Classification</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Classification Area</Label>
                                                                <Input
                                                                    placeholder="Classification area"
                                                                    value={formData.pdfDetails?.classificationArea || ""}
                                                                    onChange={(e) => {
                                                                        setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, classificationArea: e.target.value } }));
                                                                    }}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Urban Type</Label>
                                                                <Input
                                                                    placeholder="Urban type"
                                                                    value={formData.pdfDetails?.urbanType || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, urbanType: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Under Corporation</Label>
                                                                <Input
                                                                    placeholder="Under corporation"
                                                                    value={formData.pdfDetails?.underCorporation || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, underCorporation: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Govt Enactment Cover</Label>
                                                                <Input
                                                                    placeholder="Govt enactment cover"
                                                                    value={formData.pdfDetails?.govtEnactmentCover || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, govtEnactmentCover: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Boundaries */}
                                                    <div className="mb-6 p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Property Boundaries</h4>
                                                        <div className="mb-6">
                                                            <h5 className="font-semibold text-gray-700 mb-3">Boundaries (Document)</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">East</Label>
                                                                    <Input
                                                                        placeholder="East boundary"
                                                                        value={formData.pdfDetails?.boundariesDocument?.east || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesDocument: { ...prev.pdfDetails.boundariesDocument, east: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">West</Label>
                                                                    <Input
                                                                        placeholder="West boundary"
                                                                        value={formData.pdfDetails?.boundariesDocument?.west || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesDocument: { ...prev.pdfDetails.boundariesDocument, west: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">North</Label>
                                                                    <Input
                                                                        placeholder="North boundary"
                                                                        value={formData.pdfDetails?.boundariesDocument?.north || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesDocument: { ...prev.pdfDetails.boundariesDocument, north: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">South</Label>
                                                                    <Input
                                                                        placeholder="South boundary"
                                                                        value={formData.pdfDetails?.boundariesDocument?.south || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesDocument: { ...prev.pdfDetails.boundariesDocument, south: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-gray-700 mb-3">Boundaries (Actual)</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">East</Label>
                                                                    <Input
                                                                        placeholder="East boundary"
                                                                        value={formData.pdfDetails?.boundariesActual?.east || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesActual: { ...prev.pdfDetails.boundariesActual, east: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">West</Label>
                                                                    <Input
                                                                        placeholder="West boundary"
                                                                        value={formData.pdfDetails?.boundariesActual?.west || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesActual: { ...prev.pdfDetails.boundariesActual, west: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">North</Label>
                                                                    <Input
                                                                        placeholder="North boundary"
                                                                        value={formData.pdfDetails?.boundariesActual?.north || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesActual: { ...prev.pdfDetails.boundariesActual, north: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-bold text-gray-900">South</Label>
                                                                    <Input
                                                                        placeholder="South boundary"
                                                                        value={formData.pdfDetails?.boundariesActual?.south || ""}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, boundariesActual: { ...prev.pdfDetails.boundariesActual, south: e.target.value } } }))}
                                                                        disabled={!canEdit}
                                                                        className="h-10 text-sm rounded-lg border-2 border-cyan-200"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Area Details */}
                                                    <div className="mb-6 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Area Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Built-up Area</Label>
                                                                <Input
                                                                    placeholder="Built-up area"
                                                                    value={formData.pdfDetails?.builtUpArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, builtUpArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Carpet Area</Label>
                                                                <Input
                                                                    placeholder="Carpet area"
                                                                    value={formData.pdfDetails?.carpetArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, carpetArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">UDS/Land Area</Label>
                                                                <Input
                                                                    placeholder="UDS/land area"
                                                                    value={formData.pdfDetails?.udsLand || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, udsLand: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Latitude/Longitude</Label>
                                                                <Input
                                                                    placeholder="Latitude/longitude"
                                                                    value={formData.pdfDetails?.latitudeLongitude || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, latitudeLongitude: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Site Considered Area</Label>
                                                                <Input
                                                                    placeholder="Site considered area"
                                                                    value={formData.pdfDetails?.siteConsideredArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, siteConsideredArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Occupancy Status</Label>
                                                                <Input
                                                                    placeholder="Occupancy status"
                                                                    value={formData.pdfDetails?.occupancyStatus || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, occupancyStatus: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:ring-pink-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Apartment Details */}
                                                    <div className="mb-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Apartment Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Apartment Nature</Label>
                                                                <Input
                                                                    placeholder="Apartment nature"
                                                                    name="apartmentNature"
                                                                    value={formData.pdfDetails?.apartmentNature || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentNature: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Apartment Location</Label>
                                                                <Input
                                                                    placeholder="Apartment location"
                                                                    name="apartmentLocation"
                                                                    value={formData.pdfDetails?.apartmentLocation || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentLocation: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Survey Block No</Label>
                                                                <Input
                                                                    placeholder="Survey block no"
                                                                    value={formData.pdfDetails?.surveyBlockNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, surveyBlockNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">TP/FP No</Label>
                                                                <Input
                                                                    placeholder="TP/FP no"
                                                                    value={formData.pdfDetails?.tpFpNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, tpFpNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Village/Municipality</Label>
                                                                <Input
                                                                    placeholder="Village/municipality"
                                                                    name="villageMunicipality"
                                                                    value={formData.pdfDetails?.villageMunicipality || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, villageMunicipality: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Door/Street</Label>
                                                                <Input
                                                                    placeholder="Door/street"
                                                                    name="doorStreet"
                                                                    value={formData.pdfDetails?.doorStreet || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, doorStreet: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Locality Description</Label>
                                                                <Input
                                                                    placeholder="Locality description"
                                                                    name="localityDescription"
                                                                    value={formData.pdfDetails?.localityDescription || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, localityDescription: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Construction Year</Label>
                                                                <Input
                                                                    placeholder="Construction year"
                                                                    name="constructionYear"
                                                                    value={formData.pdfDetails?.constructionYear || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, constructionYear: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Number of Floors</Label>
                                                                <Input
                                                                    placeholder="Number of floors"
                                                                    name="numberOfFloors"
                                                                    value={formData.pdfDetails?.numberOfFloors || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, numberOfFloors: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Structure Type</Label>
                                                                <Input
                                                                    placeholder="Structure type"
                                                                    name="structureType"
                                                                    value={formData.pdfDetails?.structureType || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, structureType: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Dwelling Units</Label>
                                                                <Input
                                                                    placeholder="Dwelling units"
                                                                    name="dwellingUnits"
                                                                    value={formData.pdfDetails?.dwellingUnits || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, dwellingUnits: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Quality of Construction</Label>
                                                                <Input
                                                                    placeholder="Quality of construction"
                                                                    value={formData.pdfDetails?.qualityOfConstruction || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, qualityOfConstruction: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Building Appearance</Label>
                                                                <Input
                                                                    placeholder="Building appearance"
                                                                    value={formData.pdfDetails?.buildingAppearance || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingAppearance: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Building Maintenance</Label>
                                                                <Input
                                                                    placeholder="Building maintenance"
                                                                    value={formData.pdfDetails?.buildingMaintenance || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingMaintenance: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Facilities Available */}
                                                        <div className="mt-6">
                                                            <h5 className="font-semibold text-gray-900 mb-4">Facilities Available</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="lift"
                                                                        checked={formData.pdfDetails?.facilities?.lift || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, lift: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="lift" className="text-sm font-medium text-gray-900 cursor-pointer">Lift</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="waterSupply"
                                                                        checked={formData.pdfDetails?.facilities?.waterSupply || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, waterSupply: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="waterSupply" className="text-sm font-medium text-gray-900 cursor-pointer">Protected Water Supply</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="sewerage"
                                                                        checked={formData.pdfDetails?.facilities?.sewerage || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, sewerage: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="sewerage" className="text-sm font-medium text-gray-900 cursor-pointer">Underground Sewerage</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="parking"
                                                                        checked={formData.pdfDetails?.facilities?.parking || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, parking: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="parking" className="text-sm font-medium text-gray-900 cursor-pointer">Car Parking (Open/Covered)</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="compoundWall"
                                                                        checked={formData.pdfDetails?.facilities?.compoundWall || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, compoundWall: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="compoundWall" className="text-sm font-medium text-gray-900 cursor-pointer">Compound Wall Existing</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="pavement"
                                                                        checked={formData.pdfDetails?.facilities?.pavement || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, pavement: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="pavement" className="text-sm font-medium text-gray-900 cursor-pointer">Pavement Around Building</Label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Floor</Label>
                                                                <Input
                                                                    placeholder="Flat floor"
                                                                    value={formData.pdfDetails?.flatFloor || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatFloor: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Door No</Label>
                                                                <Input
                                                                    placeholder="Flat door no"
                                                                    value={formData.pdfDetails?.flatDoorNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatDoorNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Flat Specifications & House Tax */}
                                                    <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Flat Specifications & House Tax</h4>
                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">Flat Specifications</h5>
                                                                <div className="space-y-2">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Specification of the Flat</Label>
                                                                        <Input
                                                                            placeholder="Specifications"
                                                                            value={formData.pdfDetails?.flatSpecifications?.specifications || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, specifications: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Roof</Label>
                                                                        <Input
                                                                            placeholder="Roof"
                                                                            value={formData.pdfDetails?.flatSpecifications?.roof || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, roof: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Flooring</Label>
                                                                        <Input
                                                                            placeholder="Flooring"
                                                                            value={formData.pdfDetails?.flatSpecifications?.flooring || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, flooring: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Doors</Label>
                                                                        <Input
                                                                            placeholder="Doors"
                                                                            value={formData.pdfDetails?.flatSpecifications?.doors || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, doors: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Windows</Label>
                                                                        <Input
                                                                            placeholder="Windows"
                                                                            value={formData.pdfDetails?.flatSpecifications?.windows || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, windows: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Fittings</Label>
                                                                        <Input
                                                                            placeholder="Fittings"
                                                                            value={formData.pdfDetails?.flatSpecifications?.fittings || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, fittings: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Finishing</Label>
                                                                        <Input
                                                                            placeholder="Finishing"
                                                                            value={formData.pdfDetails?.flatSpecifications?.finishing || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, finishing: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">House Tax & Electricity</h5>
                                                                <div className="space-y-2">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Assessment No</Label>
                                                                        <Input
                                                                            placeholder="Assessment no"
                                                                            value={formData.pdfDetails?.houseTax?.assessmentNo || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, houseTax: { ...prev.pdfDetails.houseTax, assessmentNo: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Tax Paid By</Label>
                                                                        <Input
                                                                            placeholder="Tax paid by"
                                                                            value={formData.pdfDetails?.houseTax?.taxPaidBy || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, houseTax: { ...prev.pdfDetails.houseTax, taxPaidBy: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Tax Amount</Label>
                                                                        <Input
                                                                            placeholder="Tax amount"
                                                                            value={formData.pdfDetails?.houseTax?.taxAmount || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, houseTax: { ...prev.pdfDetails.houseTax, taxAmount: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Connection No</Label>
                                                                        <Input
                                                                            placeholder="Connection no"
                                                                            value={formData.pdfDetails?.electricityConnection?.connectionNo || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, electricityConnection: { ...prev.pdfDetails.electricityConnection, connectionNo: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Meter Name</Label>
                                                                        <Input
                                                                            placeholder="Meter name"
                                                                            value={formData.pdfDetails?.electricityConnection?.meterName || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, electricityConnection: { ...prev.pdfDetails.electricityConnection, meterName: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Property Details */}
                                                    <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Additional Property Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Maintenance</Label>
                                                                <Input
                                                                    placeholder="Flat maintenance"
                                                                    value={formData.pdfDetails?.flatMaintenance || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatMaintenance: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Sale Deed Name</Label>
                                                                <Input
                                                                    placeholder="Sale deed name"
                                                                    value={formData.pdfDetails?.saleDeedName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, saleDeedName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Undivided Land Area</Label>
                                                                <Input
                                                                    placeholder="Undivided land area"
                                                                    value={formData.pdfDetails?.undividedLandArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, undividedLandArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Plinth Area</Label>
                                                                <Input
                                                                    placeholder="Plinth area"
                                                                    value={formData.pdfDetails?.plinthArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, plinthArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">FSI</Label>
                                                                <Input
                                                                    placeholder="FSI"
                                                                    value={formData.pdfDetails?.fsi || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, fsi: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Carpet Area Valuation</Label>
                                                                <Input
                                                                    placeholder="Carpet area valuation"
                                                                    value={formData.pdfDetails?.carpetAreaValuation || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, carpetAreaValuation: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Class</Label>
                                                                <Input
                                                                    placeholder="Flat class"
                                                                    value={formData.pdfDetails?.flatClass || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatClass: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Usage</Label>
                                                                <Input
                                                                    placeholder="Usage"
                                                                    value={formData.pdfDetails?.usage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, usage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Occupancy</Label>
                                                                <Input
                                                                    placeholder="Occupancy"
                                                                    value={formData.pdfDetails?.occupancy || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, occupancy: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Rent</Label>
                                                                <Input
                                                                    placeholder="Rent"
                                                                    value={formData.pdfDetails?.rent || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, rent: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Facilities & Flat Section */}
                                            {activeValuationSubTab === "facilities" && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Facilities & Flat Details</h3>
                                                    <p className="text-sm text-gray-600 mb-6">Facilities, specifications, and flat details</p>

                                                    {/* Apartment Details Section */}
                                                    <div className="mb-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Apartment Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Apartment Nature</Label>
                                                                <Input
                                                                    placeholder="Apartment nature"
                                                                    value={formData.pdfDetails?.apartmentNature || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentNature: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Apartment Location</Label>
                                                                <Input
                                                                    placeholder="Apartment location"
                                                                    value={formData.pdfDetails?.apartmentLocation || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, apartmentLocation: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Facilities Available */}
                                                        <div className="mt-6">
                                                            <h5 className="font-semibold text-gray-900 mb-4">Facilities Available</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="lift"
                                                                        checked={formData.pdfDetails?.facilities?.lift || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, lift: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="lift" className="text-sm font-medium text-gray-900 cursor-pointer">Lift</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="waterSupply"
                                                                        checked={formData.pdfDetails?.facilities?.waterSupply || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, waterSupply: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="waterSupply" className="text-sm font-medium text-gray-900 cursor-pointer">Protected Water Supply</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="sewerage"
                                                                        checked={formData.pdfDetails?.facilities?.sewerage || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, sewerage: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="sewerage" className="text-sm font-medium text-gray-900 cursor-pointer">Underground Sewerage</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="parking"
                                                                        checked={formData.pdfDetails?.facilities?.parking || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, parking: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="parking" className="text-sm font-medium text-gray-900 cursor-pointer">Car Parking (Open/Covered)</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="compoundWall"
                                                                        checked={formData.pdfDetails?.facilities?.compoundWall || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, compoundWall: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="compoundWall" className="text-sm font-medium text-gray-900 cursor-pointer">Compound Wall Existing</Label>
                                                                </div>
                                                                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="pavement"
                                                                        checked={formData.pdfDetails?.facilities?.pavement || false}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, facilities: { ...prev.pdfDetails.facilities, pavement: e.target.checked } } }))}
                                                                        disabled={!canEdit}
                                                                        className="w-4 h-4 rounded border-rose-300 accent-rose-500"
                                                                    />
                                                                    <Label htmlFor="pavement" className="text-sm font-medium text-gray-900 cursor-pointer">Pavement Around Building</Label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Floor</Label>
                                                                <Input
                                                                    placeholder="Flat floor"
                                                                    value={formData.pdfDetails?.flatFloor || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatFloor: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Door No</Label>
                                                                <Input
                                                                    placeholder="Flat door no"
                                                                    value={formData.pdfDetails?.flatDoorNo || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatDoorNo: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-rose-200 focus:border-rose-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Flat Specifications & House Tax */}
                                                    <div className="mb-6 p-6 bg-lime-50 rounded-2xl border border-lime-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Flat Specifications & House Tax</h4>
                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">Flat Specifications</h5>
                                                                <div className="space-y-2">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Specification of the Flat</Label>
                                                                        <Input
                                                                            placeholder="Specifications"
                                                                            value={formData.pdfDetails?.flatSpecifications?.specifications || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, specifications: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Roof</Label>
                                                                        <Input
                                                                            placeholder="Roof"
                                                                            value={formData.pdfDetails?.flatSpecifications?.roof || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, roof: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Flooring</Label>
                                                                        <Input
                                                                            placeholder="Flooring"
                                                                            value={formData.pdfDetails?.flatSpecifications?.flooring || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, flooring: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Doors</Label>
                                                                        <Input
                                                                            placeholder="Doors"
                                                                            value={formData.pdfDetails?.flatSpecifications?.doors || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, doors: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Windows</Label>
                                                                        <Input
                                                                            placeholder="Windows"
                                                                            value={formData.pdfDetails?.flatSpecifications?.windows || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, windows: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Fittings</Label>
                                                                        <Input
                                                                            placeholder="Fittings"
                                                                            value={formData.pdfDetails?.flatSpecifications?.fittings || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, fittings: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Finishing</Label>
                                                                        <Input
                                                                            placeholder="Finishing"
                                                                            value={formData.pdfDetails?.flatSpecifications?.finishing || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatSpecifications: { ...prev.pdfDetails.flatSpecifications, finishing: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-gray-700 mb-2">House Tax & Electricity</h5>
                                                                <div className="space-y-2">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Assessment No</Label>
                                                                        <Input
                                                                            placeholder="Assessment no"
                                                                            value={formData.pdfDetails?.houseTax?.assessmentNo || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, houseTax: { ...prev.pdfDetails.houseTax, assessmentNo: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Tax Paid By</Label>
                                                                        <Input
                                                                            placeholder="Tax paid by"
                                                                            value={formData.pdfDetails?.houseTax?.taxPaidBy || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, houseTax: { ...prev.pdfDetails.houseTax, taxPaidBy: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Tax Amount</Label>
                                                                        <Input
                                                                            placeholder="Tax amount"
                                                                            value={formData.pdfDetails?.houseTax?.taxAmount || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, houseTax: { ...prev.pdfDetails.houseTax, taxAmount: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Connection No</Label>
                                                                        <Input
                                                                            placeholder="Connection no"
                                                                            value={formData.pdfDetails?.electricityConnection?.connectionNo || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, electricityConnection: { ...prev.pdfDetails.electricityConnection, connectionNo: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-bold text-gray-900">Meter Name</Label>
                                                                        <Input
                                                                            placeholder="Meter name"
                                                                            value={formData.pdfDetails?.electricityConnection?.meterName || ""}
                                                                            onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, electricityConnection: { ...prev.pdfDetails.electricityConnection, meterName: e.target.value } } }))}
                                                                            disabled={!canEdit}
                                                                            className="h-10 text-sm rounded-lg border-2 border-lime-200"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Property Details */}
                                                    <div className="mb-6 p-6 bg-violet-50 rounded-2xl border border-violet-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Additional Property Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Maintenance</Label>
                                                                <Input
                                                                    placeholder="Flat maintenance"
                                                                    value={formData.pdfDetails?.flatMaintenance || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatMaintenance: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Sale Deed Name</Label>
                                                                <Input
                                                                    placeholder="Sale deed name"
                                                                    value={formData.pdfDetails?.saleDeedName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, saleDeedName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Undivided Land Area</Label>
                                                                <Input
                                                                    placeholder="Undivided land area"
                                                                    value={formData.pdfDetails?.undividedLandArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, undividedLandArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Plinth Area</Label>
                                                                <Input
                                                                    placeholder="Plinth area"
                                                                    value={formData.pdfDetails?.plinthArea || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, plinthArea: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">FSI</Label>
                                                                <Input
                                                                    placeholder="FSI"
                                                                    value={formData.pdfDetails?.fsi || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, fsi: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Carpet Area Valuation</Label>
                                                                <Input
                                                                    placeholder="Carpet area valuation"
                                                                    value={formData.pdfDetails?.carpetAreaValuation || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, carpetAreaValuation: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Flat Class</Label>
                                                                <Input
                                                                    placeholder="Flat class"
                                                                    value={formData.pdfDetails?.flatClass || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, flatClass: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Usage</Label>
                                                                <Input
                                                                    placeholder="Usage"
                                                                    value={formData.pdfDetails?.usage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, usage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Occupancy</Label>
                                                                <Input
                                                                    placeholder="Occupancy"
                                                                    value={formData.pdfDetails?.occupancy || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, occupancy: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Rent</Label>
                                                                <Input
                                                                    placeholder="Rent"
                                                                    value={formData.pdfDetails?.rent || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, rent: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-violet-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Market Value Analysis - Part 1 */}
                                            {activeValuationSubTab === "analysis" && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Market Value Analysis</h3>
                                                    <div className="mb-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Market Value Analysis - Rates & Factors</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Marketability</Label>
                                                                <Input
                                                                    placeholder="Marketability"
                                                                    value={formData.pdfDetails?.marketability || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, marketability: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Positive Factors</Label>
                                                                <Input
                                                                    placeholder="Positive factors"
                                                                    value={formData.pdfDetails?.positiveFactors || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, positiveFactors: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Negative Factors</Label>
                                                                <Input
                                                                    placeholder="Negative factors"
                                                                    value={formData.pdfDetails?.negativeFactors || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, negativeFactors: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Composite Rate</Label>
                                                                <Input
                                                                    placeholder="Composite rate"
                                                                    value={formData.pdfDetails?.compositeRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, compositeRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Jantri Rate</Label>
                                                                <Input
                                                                    placeholder="Jantri rate"
                                                                    value={formData.pdfDetails?.jantriRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, jantriRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Basic Composite Rate</Label>
                                                                <Input
                                                                    placeholder="Basic composite rate"
                                                                    value={formData.pdfDetails?.basicCompositeRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, basicCompositeRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Building Service Rate</Label>
                                                                <Input
                                                                    placeholder="Building service rate"
                                                                    value={formData.pdfDetails?.buildingServiceRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingServiceRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Land Other Rate</Label>
                                                                <Input
                                                                    placeholder="Land other rate"
                                                                    value={formData.pdfDetails?.landOtherRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, landOtherRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Market Value Analysis - Part 2 */}
                                                    <div className="mb-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Depreciation & Building Analysis</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Depreciated Building Rate</Label>
                                                                <Input
                                                                    placeholder="Depreciated building rate"
                                                                    value={formData.pdfDetails?.depreciatedBuildingRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, depreciatedBuildingRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Replacement Cost</Label>
                                                                <Input
                                                                    placeholder="Replacement cost"
                                                                    value={formData.pdfDetails?.replacementCost || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, replacementCost: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Building Age</Label>
                                                                <Input
                                                                    placeholder="Building age"
                                                                    value={formData.pdfDetails?.buildingAge || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingAge: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Building Life</Label>
                                                                <Input
                                                                    placeholder="Building life"
                                                                    value={formData.pdfDetails?.buildingLife || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, buildingLife: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Depreciation Percentage</Label>
                                                                <Input
                                                                    placeholder="Depreciation percentage"
                                                                    value={formData.pdfDetails?.depreciationPercentage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, depreciationPercentage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Depreciated Ratio</Label>
                                                                <Input
                                                                    placeholder="Depreciated ratio"
                                                                    value={formData.pdfDetails?.depreciatedRatio || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, depreciatedRatio: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Final Composite Rate</Label>
                                                                <Input
                                                                    placeholder="Final composite rate"
                                                                    value={formData.pdfDetails?.finalCompositeRate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, finalCompositeRate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Present Value</Label>
                                                                <Input
                                                                    placeholder="Present value"
                                                                    value={formData.pdfDetails?.presentValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, presentValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Furniture Fixture Value</Label>
                                                                <Input
                                                                    placeholder="Furniture fixture value"
                                                                    value={formData.pdfDetails?.furnitureFixtureValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, furnitureFixtureValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Total Value</Label>
                                                                <Input
                                                                    placeholder="Total value"
                                                                    value={formData.pdfDetails?.totalValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, totalValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-sky-200 focus:border-sky-500 focus:ring-sky-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Valuation Results & Signature Section */}
                                            {activeValuationSubTab === "results" && (
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Results & Signature</h3>

                                                    {/* Valuation Results */}
                                                    <div className="mb-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Valuation Results</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Fair Market Value</Label>
                                                                <Input
                                                                    placeholder="Fair market value"
                                                                    value={formData.pdfDetails?.fairMarketValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, fairMarketValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Realizable Value</Label>
                                                                <Input
                                                                    placeholder="Realizable value"
                                                                    value={formData.pdfDetails?.realizableValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, realizableValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Distress Value</Label>
                                                                <Input
                                                                    placeholder="Distress value"
                                                                    value={formData.pdfDetails?.distressValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, distressValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Sale Deed Value</Label>
                                                                <Input
                                                                    placeholder="Sale deed value"
                                                                    value={formData.pdfDetails?.saleDeedValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, saleDeedValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Insurable Value</Label>
                                                                <Input
                                                                    placeholder="Insurable value"
                                                                    value={formData.pdfDetails?.insurableValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, insurableValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Total Jantri Value</Label>
                                                                <Input
                                                                    placeholder="Total jantri value"
                                                                    value={formData.pdfDetails?.totalJantriValue || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, totalJantriValue: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Fair Market Value (in Words)</Label>
                                                                <Input
                                                                    placeholder="Fair market value in words"
                                                                    value={formData.pdfDetails?.fairMarketValueWords || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, fairMarketValueWords: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Flat Details */}
                                                    <div className="mb-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Additional Flat Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Area Usage</Label>
                                                                <Input
                                                                    placeholder="Area usage"
                                                                    value={formData.pdfDetails?.areaUsage || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, areaUsage: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Carpet Area (Flat)</Label>
                                                                <Input
                                                                    placeholder="Carpet area flat"
                                                                    value={formData.pdfDetails?.carpetAreaFlat || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, carpetAreaFlat: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-purple-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Signature & Report Details */}
                                                    <div className="mb-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                                        <h4 className="font-bold text-gray-900 mb-4">Signature & Report Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Place</Label>
                                                                <Input
                                                                    placeholder="Place"
                                                                    value={formData.pdfDetails?.place || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, place: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-amber-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Signature Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.signatureDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, signatureDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-amber-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Signer Name</Label>
                                                                <Input
                                                                    placeholder="Signer name"
                                                                    value={formData.pdfDetails?.signerName || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, signerName: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-amber-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-bold text-gray-900">Report Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={formData.pdfDetails?.reportDate || ""}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, pdfDetails: { ...prev.pdfDetails, reportDate: e.target.value } }))}
                                                                    disabled={!canEdit}
                                                                    className="h-10 text-sm rounded-lg border-2 border-amber-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </>
                                    )}

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
