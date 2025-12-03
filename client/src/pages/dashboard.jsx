import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaPlus, FaDownload, FaSyncAlt, FaEye, FaSort, FaChartBar, FaLock, FaClock, FaSpinner, FaCheckCircle, FaTimesCircle, FaEdit, FaFileAlt, FaCreditCard, FaRedo } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui";
import { getAllValuations, requestRework } from "../services/valuationservice";
import { generateRecordPDF } from "../services/pdfExport";
import { logoutUser } from "../services/auth";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { setCurrentPage, setTotalItems } from "../redux/slices/paginationSlice";
import { invalidateCache } from "../services/axios";
import { useNotification } from "../context/NotificationContext";
import Pagination from "../components/Pagination";
import LoginModal from "../components/LoginModal";
import SearchBar from "../components/SearchBar";
import ReworkModal from "../components/ReworkModal";

const DashboardPage = ({ user, onLogout, onLogin }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showSuccess } = useNotification();
    const { currentPage, itemsPerPage, totalItems } = useSelector((state) => state.pagination);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [timeDurations, setTimeDurations] = useState({});
    const [statusFilter, setStatusFilter] = useState(null);
    const [cityFilter, setCityFilter] = useState(null);
    const [bankFilter, setBankFilter] = useState(null);
    const [engineerFilter, setEngineerFilter] = useState(null);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [copiedRows, setCopiedRows] = useState(new Map()); // Map<id, rowData>
    const [reworkModalOpen, setReworkModalOpen] = useState(false);
    const [reworkingRecordId, setReworkingRecordId] = useState(null);
    const [reworkLoading, setReworkLoading] = useState(false);
    const username = user?.username || "";
    const role = user?.role || "";
    const isLoggedIn = !!user;
    const pollIntervalRef = useRef(null);
    const durationIntervalRef = useRef(null);
    const isMountedRef = useRef(false);
    const { showError } = useNotification();
    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        dispatch(setCurrentPage(1));
    };

    // Filter files based on status, city, bank, and engineer filters
    const filteredFiles = files.filter(f => {
        if (statusFilter && f.status !== statusFilter) return false;
        if (cityFilter && f.city !== cityFilter) return false;
        if (bankFilter && f.bankName !== bankFilter) return false;
        if (engineerFilter && f.engineerName !== engineerFilter) return false;
        return true;
    });

    // Sort filtered files
    const sortedFiles = [...filteredFiles].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Handle duration sorting
        if (sortField === "duration") {
            const aDuration = timeDurations[a._id];
            const bDuration = timeDurations[b._id];

            const aSeconds = aDuration ? (aDuration.days * 86400 + aDuration.hours * 3600 + aDuration.minutes * 60 + aDuration.seconds) : 0;
            const bSeconds = bDuration ? (bDuration.days * 86400 + bDuration.hours * 3600 + bDuration.minutes * 60 + bDuration.seconds) : 0;

            return sortOrder === "asc" ? aSeconds - bSeconds : bSeconds - aSeconds;
        }

        // Handle date sorting
        if (sortField === "createdAt" || sortField === "dateTime") {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }

        // Handle string sorting
        if (typeof aVal === "string") {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
            return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        // Handle numeric sorting 
        if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
    const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFiles = sortedFiles.slice(startIndex, endIndex);

    const calculateTimeDurations = (filesList) => {
        const durations = {};
        filesList.forEach(record => {
            if (record.status === "pending" || record.status === "on-progress" || record.status === "rejected" || record.status === "rework") {
                const createdTime = new Date(record.createdAt).getTime();
                const now = new Date().getTime();
                const diffMs = now - createdTime;
                const diffSecs = Math.floor(diffMs / 1000);
                const diffMins = Math.floor(diffSecs / 60);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);

                durations[record._id] = {
                    days: diffDays,
                    hours: diffHours % 24,
                    minutes: diffMins % 60,
                    seconds: diffSecs % 60
                };
            }
        });
        setTimeDurations(durations);
    };

    // Get unique values for dropdown filters
    const uniqueCities = [...new Set(files.map(f => f.city).filter(c => c && c.trim()))].sort();
    const uniqueBanks = [...new Set(files.map(f => f.bankName).filter(b => b && b.trim()))].sort();
    const uniqueEngineers = [...new Set(files.map(f => f.engineerName).filter(e => e && e.trim()))].sort();


    // Reset to page 1 when filter changes
    useEffect(() => {
        dispatch(setCurrentPage(1));
    }, [statusFilter, cityFilter, bankFilter, engineerFilter, dispatch]);

    // Handle logout - clear files when user logs out
    useEffect(() => {
        if (!isLoggedIn) {
            setFiles([]);
            setTimeDurations({});
            setStatusFilter(null);
            setCityFilter(null);
            setBankFilter(null);
            setEngineerFilter(null);
            setSortField("createdAt");
            setSortOrder("desc");
            setSelectedRows(new Set());
            setCopiedRows(new Map());
            dispatch(setTotalItems(0));
            dispatch(setCurrentPage(1));
        }
    }, [isLoggedIn, dispatch]);

    // Handle login - refetch files when user logs in
    useEffect(() => {
        if (isLoggedIn && isMountedRef.current) {
            // Refetch when user logs in
            invalidateCache("/valuations");
            dispatch(showLoader("Loading Data..."));
            fetchFiles(true);
        } else if (!isMountedRef.current && isLoggedIn) {
            // Initial mount with logged in user
            isMountedRef.current = true;
            invalidateCache("/valuations");
            dispatch(showLoader("Loading Data..."));
            fetchFiles(true);
        }
    }, [isLoggedIn, dispatch]);

    useEffect(() => {
        // Duration update interval - update every second for real-time display
        const durationInterval = setInterval(() => {
            calculateTimeDurations(files);
        }, 1000); // Update durations every second

        return () => {
            clearInterval(durationInterval);
        };
    }, [files]);

    const fetchFiles = async (isInitial = false, showLoadingIndicator = true) => {
        try {
            if (!isInitial && showLoadingIndicator) {
                setLoading(true);
                dispatch(showLoader("Loading Data..."));
            }
            // Invalidate cache before fetching to ensure fresh data
            invalidateCache("/valuations");
            const data = await getAllValuations();
            const filesList = Array.isArray(data) ? data : [];
            setFiles(filesList);
            dispatch(setTotalItems(filesList.length));
            if (isInitial) {
                dispatch(setCurrentPage(1));
            }
            calculateTimeDurations(filesList);
        } catch (err) {
            // Error fetching valuations
        } finally {
            if (showLoadingIndicator) {
                setLoading(false);
                dispatch(hideLoader());
            }
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        dispatch(showLoader("Loading Data..."));
        try {
            await logoutUser();
            // Clear files immediately
            setFiles([]);
            setTimeDurations({});
            if (onLogout) onLogout();
            setTimeout(() => {
                dispatch(hideLoader());
                navigate("/dashboard");
            }, 500);
        } catch (error) {
            // Clear files even on error
            setFiles([]);
            setTimeDurations({});
            if (onLogout) onLogout();
            dispatch(hideLoader());
            navigate("/dashboard");
        } finally {
            setLoggingOut(false);
            setLogoutModalOpen(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            "pending": { variant: "warning", label: "PR", fullLabel: "Pending Review" },
            "on-progress": { variant: "default", label: "OP", fullLabel: "On Progress" },
            "approved": { variant: "success", label: "App", fullLabel: "Approved" },
            "rejected": { variant: "destructive", label: "Rej", fullLabel: "Rejected" },
            "rework": { variant: "outline", label: "RW", fullLabel: "Rework" },
        };
        const config = variants[status] || variants["pending"];
        return <Badge variant={config.variant} title={config.fullLabel}>{config.label}</Badge>;
    };

    const getPaymentBadge = (payment) => {
        return (
            <Badge variant={payment === "yes" ? "success" : "warning"}>
                {payment === "yes" ? "Collected" : "Not Collected"}
            </Badge>
        );
    };

    const handleDownloadPDF = async (record) => {
        try {
            await generateRecordPDF(record);
        } catch (error) {
            console.error('❌ PDF generation failed:', error.message);
            alert(`Error generating PDF: ${error.message}`);
        }
    };

    const handleReworkRequest = (record) => {
        setReworkingRecordId(record.uniqueId);
        setReworkModalOpen(true);
    };

    const handleReworkSubmit = async (reworkComments) => {
        try {
            setReworkLoading(true);
            dispatch(showLoader("Requesting rework..."));
            await requestRework(reworkingRecordId, reworkComments);
            showSuccess("Rework requested successfully!");
            setReworkModalOpen(false);
            setReworkingRecordId(null);
            invalidateCache("/valuations");
            await fetchFiles(false, true);
        } catch (error) {
            showError(error.message || "Failed to request rework");
        } finally {
            setReworkLoading(false);
            dispatch(hideLoader());
        }
    };
    // Bulletproof checkbox → copy logic with atomic state management
    const handleCheckboxChange = (recordId) => {
        setSelectedRows(prev => {
            const newSelected = new Set(prev);
            let isAdding = false;

            if (newSelected.has(recordId)) {
                // UNCHECKING: delete and remove from copied data
                newSelected.delete(recordId);
            } else {
                // CHECKING: add and copy row data
                newSelected.add(recordId);
                isAdding = true;
            }

            // ATOMIC UPDATE: modify copiedRows in sync with selectedRows
            setCopiedRows(prevCopied => {
                const newCopied = new Map(prevCopied);

                if (isAdding) {
                    // Find the row data from authoritative source (files) at moment of state update
                    const rowData = files.find(f => f._id === recordId);
                    if (rowData) {
                        newCopied.set(recordId, rowData);
                    }
                } else {
                    // Remove copied data immediately when unchecking
                    newCopied.delete(recordId);
                }

                return newCopied;
            });

            return newSelected;
        });
    };

    const handleCopyToClipboard = (records) => {
        if (!Array.isArray(records) || records.length === 0) return;

        const textToCopy = records.map(record =>
            `Client Name: ${record.clientName}\nPhone Number: ${record.mobileNumber}\nBank Name: ${record.bankName}\nClient Address: ${record.address}`
        ).join("\n\n---\n\n");

        navigator.clipboard.writeText(textToCopy).then(() => {
            showSuccess(`${records.length} record(s) copied!`);
        }).catch(() => {
            showSuccess("Failed to copy");
        });
    };

    const pendingCount = files.filter(f => f.status === "pending").length;
    const onProgressCount = files.filter(f => f.status === "on-progress").length;
    const approvedCount = files.filter(f => f.status === "approved").length;
    const rejectedCount = files.filter(f => f.status === "rejected").length;
    const reworkCount = files.filter(f => f.status === "rework").length;
    const totalCount = files.length;
    const completionRate = totalCount > 0 ? Math.round(((approvedCount + rejectedCount) / totalCount) * 100) : 0;

    const StatCard = ({ title, value, color, status, icon: Icon }) => (
        <Card
            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            className={`overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 relative group ${statusFilter === status ? `border-l-${color.split('-')[1]} ring-2 ring-blue-200 shadow-2xl scale-105` : 'border-l-gray-200 hover:border-l-blue-500'}`}
        >
            <div className={`h-1 sm:h-1.5 bg-gradient-to-r ${color} group-hover:h-2 transition-all duration-300`}></div>
            <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-600 mb-2 sm:mb-3 truncate uppercase tracking-widest letter-spacing-1">{title}</p>
                        <p className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
                    </div>
                    {Icon && <Icon className={`h-8 w-8 sm:h-10 sm:w-10 opacity-30 flex-shrink-0 group-hover:opacity-50 transition-opacity`} />}
                </div>
                <div className={`mt-4 h-1 bg-gradient-to-r ${color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#F36E21] to-[#EC5E25] text-white shadow-2xl sticky top-0 z-40 border-b-4 border-[#7A1F14]">
                <div className="px-3 sm:px-6 py-3 sm:py-5 flex flex-col gap-3 sm:gap-4">
                    {/* Top Row - Logo, Search, and Controls */}
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <div className="text-3xl sm:text-4xl flex-shrink-0 text-white drop-shadow-lg transform hover:scale-110 transition-transform duration-300">
                                <FaChartBar />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white whitespace-nowrap drop-shadow-md">Valuation Dashboard</h1>
                                <p className="text-xs text-white font-semibold mt-0.5 hidden sm:block drop-shadow-sm">
                                    {!isLoggedIn ? "📊 Read-Only Mode" : role === "user" ? "📝 Manage Your Submissions" : ["manager1", "manager2"].includes(role) ? "✅ Review User Submissions" : "⚙️ System Administrator"}
                                </p>
                                
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 mx-4">
                            <SearchBar data={files} />
                        </div>

                        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                             <button
                                 onClick={() => navigate("/valuationform")}
                                 className="bg-white text-[#F36E21] hover:bg-orange-50 hover:text-[#EC5E25] hover:shadow-xl h-9 w-9 sm:h-10 sm:w-10 shadow-lg transition-all duration-300 border-2 border-orange-100 inline-flex items-center justify-center flex-shrink-0 rounded-lg"
                                 title="New Form"
                             >
                                 <FaPlus style={{ fontSize: "18px" }} />
                             </button>
                             <button
                                 onClick={() => navigate("/bills")}
                                 className="bg-white text-[#F36E21] hover:bg-orange-50 hover:text-[#EC5E25] hover:shadow-xl h-9 w-9 sm:h-10 sm:w-10 shadow-lg transition-all duration-300 border-2 border-orange-100 inline-flex items-center justify-center flex-shrink-0 rounded-lg"
                                 title="Bills"
                             >
                                 <FaCreditCard style={{ fontSize: "16px" }} />
                             </button>
                             <div className="h-8 sm:h-10 w-px bg-white/30"></div>

                            {!isLoggedIn ? (
                                <Button
                                    onClick={() => setLoginModalOpen(true)}
                                    className="bg-gradient-to-r from-[#F36E21] to-[#EC5E25] text-white hover:from-[#EC5E25] hover:to-[#D94A1E] hover:shadow-xl text-xs sm:text-sm px-3 sm:px-5 h-9 sm:h-10 flex items-center gap-2 font-bold shadow-lg transition-all duration-300 border border-[#EC5E25]"
                                    title="Login"
                                >
                                    <FaLock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Login</span>
                                </Button>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center flex-shrink-0 font-bold text-white shadow-lg border border-orange-200">
                                            <span className="text-xs sm:text-sm font-black">{username[0]?.toUpperCase()}</span>
                                        </div>
                                        <div className="hidden sm:block min-w-0">
                                            <p className="text-xs sm:text-sm font-semibold truncate">{username}</p>
                                            <p className="text-xs text-white/75 uppercase tracking-wider truncate font-medium">{role}</p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-red-500/30 hover:text-red-100 h-9 w-9 sm:h-10 sm:w-10 transition-all duration-300 hover:shadow-lg rounded-lg"
                                        onClick={() => setLogoutModalOpen(true)}
                                        title="Logout"
                                    >
                                        <FaSignOutAlt className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-5 md:space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    <StatCard
                        title="Pending"
                        value={pendingCount}
                        color="from-[#F36E21] to-[#EC5E25]"
                        status="pending"
                        icon={FaClock}
                    />
                    <StatCard
                        title="In Progress"
                        value={onProgressCount}
                        color="from-[#F36E21] to-[#EC5E25]"
                        status="on-progress"
                        icon={FaSpinner}
                    />
                    <StatCard
                        title="Approved"
                        value={approvedCount}
                        color="from-emerald-600 to-emerald-800"
                        status="approved"
                        icon={FaCheckCircle}
                    />
                    <StatCard
                        title="Rejected"
                        value={rejectedCount}
                        color="from-rose-600 to-rose-800"
                        status="rejected"
                        icon={FaTimesCircle}
                    />
                    <StatCard
                        title="Rework"
                        value={reworkCount}
                        color="from-amber-600 to-amber-800"
                        status="rework"
                        icon={FaRedo}
                    />
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-8">
                    <Card className="hover:shadow-2xl transition-all duration-300 border-l-4 border-l-[#F36E21] group">
                        <CardHeader className="pb-3 sm:pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                    <FaChartBar className="text-[#F36E21] text-lg" />
                                </div>
                                Total Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="space-y-3">
                                <p className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-slate-800 to-[#F36E21] bg-clip-text text-transparent">{totalCount}</p>
                                <p className="text-xs sm:text-sm text-slate-600 font-semibold">Forms submitted in total</p>
                                <div className="h-1 bg-gradient-to-r from-[#F36E21] to-[#EC5E25] rounded-full w-12 group-hover:w-20 transition-all duration-300"></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-2xl transition-all duration-300 border-l-4 border-l-green-500 group">
                        <CardHeader className="pb-3 sm:pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <FaCheckCircle className="text-green-600 text-lg" />
                                </div>
                                Completion Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-sm border border-slate-300">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 rounded-full shadow-md"
                                                style={{ width: `${completionRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-4xl sm:text-5xl font-black text-green-600 min-w-max">{completionRate}%</p>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 font-semibold">{approvedCount + rejectedCount} of {totalCount} completed</p>
                                <div className="h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full w-12 group-hover:w-20 transition-all duration-300"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-t-[#F36E21]">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-orange-50 via-white to-slate-50 border-b-2 border-orange-200 py-5 sm:py-6">
                        <div>
                            <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FaEye className="text-[#F36E21] text-lg" />
                                </div>
                                Valuation Forms
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-2 text-slate-600 font-semibold">{sortedFiles.length} records {statusFilter && `filtered`}</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {(statusFilter || cityFilter || bankFilter || engineerFilter) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setStatusFilter(null);
                                        setCityFilter(null);
                                        setBankFilter(null);
                                        setEngineerFilter(null);
                                    }}
                                    className="text-xs sm:text-sm px-3 sm:px-4 font-bold border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 hover:text-[#F36E21] transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    Clear Filters
                                </Button>
                            )}
                            {selectedRows.size > 0 && (
                                <>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                            const selectedRecords = files.filter(r => selectedRows.has(r._id));
                                            if (selectedRecords.length > 0) {
                                                handleCopyToClipboard(selectedRecords);
                                            }
                                        }}
                                        className="text-xs sm:text-sm px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold shadow-md hover:shadow-lg transition-all duration-300"
                                    >
                                        Copy {selectedRows.size}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedRows(new Set())}
                                        className="text-xs sm:text-sm px-3 sm:px-4 font-bold border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                        Clear Selection
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchFiles(false, true)}
                                disabled={loading}
                                className="text-xs sm:text-sm px-3 sm:px-4 font-bold border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
                            >
                                <FaSyncAlt className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {paginatedFiles.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-blue-300">
                                                <TableHead className="min-w-[35px] text-xs sm:text-sm px-1 font-black text-slate-800">
                                                    <div className="flex items-center gap-1 justify-center text-lg">✓</div>
                                                </TableHead>
                                                <TableHead className="min-w-[65px] text-xs sm:text-sm cursor-pointer hover:bg-blue-200 px-1 font-black text-slate-800 transition-colors duration-200" onClick={() => handleSort("clientName")}>
                                                    <div className="flex items-center gap-1">Clnt {sortField === "clientName" && <FaSort className="h-3 w-3 text-blue-600" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[70px] text-xs sm:text-sm cursor-pointer hover:bg-blue-200 px-1 font-black text-slate-800 transition-colors duration-200" onClick={() => handleSort("address")}>
                                                    <div className="flex items-center gap-1">Addr {sortField === "address" && <FaSort className="h-3 w-3 text-blue-600" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[65px] text-xs sm:text-sm cursor-pointer hover:bg-blue-200 px-1 font-black text-slate-800 transition-colors duration-200" onClick={() => handleSort("mobileNumber")}>
                                                    <div className="flex items-center gap-1">Mobile {sortField === "mobileNumber" && <FaSort className="h-3 w-3 text-blue-600" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[60px] text-xs sm:text-sm px-1">
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            value={bankFilter || ""}
                                                            onChange={(e) => setBankFilter(e.target.value || null)}
                                                            className="text-xs px-1 py-0.5 border rounded bg-white cursor-pointer w-full"
                                                        >
                                                            <option value="">Bank</option>
                                                            {uniqueBanks.map(bank => (
                                                                <option key={bank} value={bank}>{bank}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="min-w-[65px] text-xs sm:text-sm px-1">
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            value={engineerFilter || ""}
                                                            onChange={(e) => setEngineerFilter(e.target.value || null)}
                                                            className="text-xs px-1 py-0.5 border rounded bg-white cursor-pointer w-full"
                                                        >
                                                            <option value="">Eng</option>
                                                            {uniqueEngineers.map(engineer => (
                                                                <option key={engineer} value={engineer}>{engineer}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="min-w-[60px] text-xs sm:text-sm px-1">
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            value={cityFilter || ""}
                                                            onChange={(e) => setCityFilter(e.target.value || null)}
                                                            className="text-xs px-1 py-0.5 border rounded bg-white cursor-pointer w-full"
                                                        >
                                                            <option value="">City</option>
                                                            {uniqueCities.map(city => (
                                                                <option key={city} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="min-w-[50px] text-xs sm:text-sm cursor-pointer hover:bg-blue-200 px-1 font-black text-slate-800 transition-colors duration-200" onClick={() => handleSort("payment")}>
                                                    <div className="flex items-center gap-1">Pay {sortField === "payment" && <FaSort className="h-3 w-3 text-blue-600" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[50px] text-xs sm:text-sm cursor-pointer hover:bg-blue-200 px-1 font-black text-slate-800 transition-colors duration-200" onClick={() => handleSort("status")}>
                                                    <div className="flex items-center gap-1">Sts {sortField === "status" && <FaSort className="h-3 w-3 text-blue-600" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[60px] text-xs sm:text-sm cursor-pointer hover:bg-blue-200 px-1 font-black text-slate-800 transition-colors duration-200" onClick={() => handleSort("duration")}>
                                                    <div className="flex items-center gap-1">Dur {sortField === "duration" && <FaSort className="h-3 w-3 text-blue-600" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[85px] text-xs sm:text-sm cursor-pointer hover:bg-blue-200 px-1 font-black text-slate-800 transition-colors duration-200" onClick={() => handleSort("createdAt")}>
                                                    <div className="flex items-center gap-1">Date {sortField === "createdAt" && <FaSort className="h-3 w-3 text-blue-600" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[100px] text-xs sm:text-sm px-1">Notes</TableHead>
                                                <TableHead className="min-w-[70px] text-xs sm:text-sm px-1">Acts</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedFiles.map((record) => (
                                                <TableRow key={record._id} className="hover:bg-blue-50 border-b border-slate-100 transition-colors duration-200">
                                                    <TableCell className="text-sm text-center px-1 py-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.has(record._id)}
                                                            onChange={() => handleCheckboxChange(record._id)}
                                                            className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
                                                        />



                                                    </TableCell>
                                                    <TableCell className={`text-sm font-black text-slate-900 ${record.address && record.address.length > 50 ? 'whitespace-normal' : ''}`}>{record.clientName}</TableCell>
                                                    <TableCell className={`text-sm font-semibold text-slate-700 ${record.address && record.address.length > 50 ? 'max-w-[200px] whitespace-normal break-words' : 'max-w-[140px] truncate'}`}>{record.address}</TableCell>
                                                    <TableCell className="text-xs px-1 py-2 truncate font-semibold text-slate-700">{record.mobileNumber}</TableCell>
                                                    <TableCell className="text-xs px-1 py-2 truncate font-semibold text-slate-700">{record.bankName}</TableCell>
                                                    <TableCell className="text-xs px-1 py-2 truncate font-semibold text-slate-700">{record.engineerName}</TableCell>
                                                    <TableCell className="text-xs px-1 py-2 truncate font-semibold text-slate-700">{record.city}</TableCell>
                                                    <TableCell className="px-1 py-2">
                                                        <Badge variant={record.payment === "yes" ? "success" : "warning"} className="text-xs px-2 py-1 font-bold shadow-sm">
                                                            {record.payment === "yes" ? "Y" : "N"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-1 py-2 text-center">{getStatusBadge(record.status)}</TableCell>
                                                    <TableCell className="px-1 py-2">
                                                        {timeDurations[record._id] ? (
                                                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-slate-100 px-2 py-1 font-bold border-blue-300 shadow-sm">{timeDurations[record._id].days}:{timeDurations[record._id].hours}:{timeDurations[record._id].minutes}:{timeDurations[record._id].seconds}</Badge>
                                                        ) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm px-1 py-2 font-semibold text-slate-700">
                                                        {record.dateTime || record.createdAt ? (
                                                            <>
                                                                <div>{new Date(record.dateTime || record.createdAt).toLocaleDateString()}</div>
                                                                <div className="text-slate-600 text-xs">{new Date(record.dateTime || record.createdAt).toLocaleTimeString()}</div>
                                                            </>
                                                        ) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-xs max-w-[100px] px-1 py-2">
                                                        {record.notes ? (
                                                            <div className="whitespace-normal break-words line-clamp-1 text-xs font-semibold text-slate-700" title={record.notes}>
                                                                {record.notes}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-500 font-medium">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-1 py-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {role === "user" && record.status === "pending" && (
                                                                <Badge
                                                                    variant="warning"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 flex items-center gap-1.5"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                    title="Edit Form"
                                                                >
                                                                    <FaEdit className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            {role === "user" && record.status === "on-progress" && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 bg-blue-600 flex items-center gap-1.5"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                    title="Edit Form"
                                                                >
                                                                    <FaEdit className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            {role === "user" && record.status === "rejected" && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 flex items-center gap-1.5"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                    title="Edit Form"
                                                                >
                                                                    <FaEdit className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            {record.status === "approved" && (
                                                                <Badge
                                                                    variant="success"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 flex items-center gap-1.5"
                                                                    onClick={() => handleDownloadPDF(record)}
                                                                    title="Download PDF"
                                                                >
                                                                    <FaDownload className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            {(["manager1", "manager2"].includes(role) || role === "admin") && (record.status === "pending" || record.status === "on-progress") && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 bg-blue-600 flex items-center gap-1.5"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                    title="Review Form"
                                                                >
                                                                    <FaEye className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            {(["manager1", "manager2"].includes(role) || role === "admin") && (record.status === "rejected" || record.status === "rework") && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 flex items-center gap-1.5"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                    title="Edit Form"
                                                                >
                                                                    <FaEdit className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            {(["manager1", "manager2"].includes(role) || role === "admin") && record.status === "approved" && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 bg-purple-50 border-purple-400 text-purple-700 flex items-center gap-1.5"
                                                                    onClick={() => handleReworkRequest(record)}
                                                                    title="Request Rework"
                                                                >
                                                                    <FaRedo className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            {role === "user" && record.status === "rework" && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs px-2.5 py-1.5 cursor-pointer hover:shadow-lg hover:scale-110 font-bold transition-all duration-200 bg-orange-50 border-orange-400 text-orange-700 flex items-center gap-1.5"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                    title="Rework Form"
                                                                >
                                                                    <FaRedo className="h-3 w-3" />
                                                                </Badge>
                                                            )}
                                                            
                                                            </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="flex-shrink-0 border-t-2 border-blue-300 bg-gradient-to-r from-blue-50 to-white">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={(page) => dispatch(setCurrentPage(page))}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-4 bg-blue-100 rounded-full">
                                        <FaEye className="h-12 w-12 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-slate-600 font-semibold text-lg">No data found</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or create a new record</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Login Modal */}
            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onLogin={(userData) => {
                    if (onLogin) {
                        onLogin(userData);
                    }
                    setLoginModalOpen(false);
                }}
            />

            {/* Logout Confirmation Dialog */}
            <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to logout? You will be redirected to the login page.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setLogoutModalOpen(false)}
                            disabled={loggingOut}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            disabled={loggingOut}
                        >
                            {loggingOut ? "Logging out..." : "Logout"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rework Modal */}
            <ReworkModal
                isOpen={reworkModalOpen}
                onClose={() => {
                    setReworkModalOpen(false);
                    setReworkingRecordId(null);
                }}
                onSubmit={handleReworkSubmit}
                isLoading={reworkLoading}
            />
        </div>
    );
};
export default DashboardPage;