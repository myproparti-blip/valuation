import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaPlus, FaDownload, FaSyncAlt, FaEye, FaSort, FaChartBar, FaLock, FaComments, FaClock, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui";
import { getAllValuations } from "../services/valuationservice";
import { useLoading } from "../context/LoadingContext";
import { generateRecordPDF } from "../services/pdfExport";
import { logoutUser } from "../services/auth";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { setCurrentPage, setTotalItems } from "../redux/slices/paginationSlice";
import Pagination from "../components/Pagination";
import LoginModal from "../components/LoginModal";
import ChatModal from "../components/Chat/ChatModal";

const DashboardPage = ({ user, onLogout, onLogin }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const { hideLoading } = useLoading();
    const username = user?.username || "";
    const role = user?.role || "";
    const isLoggedIn = !!user;
    const pollIntervalRef = useRef(null);
    const durationIntervalRef = useRef(null);
    const isMountedRef = useRef(false);

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
            if (record.status === "pending" || record.status === "on-progress" || record.status === "rejected") {
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

    useEffect(() => {
        // Fetch files on component mount only
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            fetchFiles(true);
            hideLoading();
        }
    }, [hideLoading]);

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
                dispatch(showLoader("Fetching valuations..."));
            }
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
            if (!isInitial && showLoadingIndicator) {
                setLoading(false);
                dispatch(hideLoader());
            }
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        dispatch(showLoader("Logging out..."));
        try {
            await logoutUser();
            if (onLogout) onLogout();
            setTimeout(() => {
                dispatch(hideLoader());
                navigate("/dashboard");
            }, 500);
        } catch (error) {
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

    const handleDownloadPDF = (record) => {
        try {
            generateRecordPDF(record);
        } catch (error) {
            // PDF generation error
        }
    };

    const pendingCount = files.filter(f => f.status === "pending").length;
    const onProgressCount = files.filter(f => f.status === "on-progress").length;
    const approvedCount = files.filter(f => f.status === "approved").length;
    const rejectedCount = files.filter(f => f.status === "rejected").length;
    const totalCount = files.length;
    const completionRate = totalCount > 0 ? Math.round(((approvedCount + rejectedCount) / totalCount) * 100) : 0;

    const StatCard = ({ title, value, color, status, icon: Icon }) => (
        <Card
            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            className={`overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:scale-105 ${statusFilter === status ? 'ring-2 ring-primary shadow-xl' : ''}`}
        >
            <div className={`h-2 sm:h-3 bg-gradient-to-r ${color}`}></div>
            <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2 truncate uppercase tracking-wider">{title}</p>
                        <p className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
                    </div>
                    {Icon && <Icon className={`h-6 w-6 sm:h-8 sm:w-8 opacity-20 flex-shrink-0`} />}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600 text-white shadow-2xl sticky top-0 z-40 border-b-4 border-blue-800">
                <div className="px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between flex-wrap gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="text-2xl sm:text-3xl flex-shrink-0 text-emerald-300 drop-shadow-lg">
                                <FaChartBar />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">Valuation Dashboard</h1>
                                <p className="text-xs sm:text-sm text-white/85 truncate font-medium">
                                    {!isLoggedIn ? "📊 Read-Only Mode" : role === "user" ? "📝 Manage Your Submissions" : ["manager1", "manager2"].includes(role) ? "✅ Review User Submissions" : "⚙️ System Administrator"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                        {isLoggedIn && (role === "user" || role === "admin" || ["manager1", "manager2"].includes(role)) && (
                            <>
                                <Button
                                    onClick={() => navigate("/valuationform")}
                                    className="bg-white text-blue-600 hover:bg-emerald-100 hover:text-emerald-700 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                    <FaPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">New Form</span>
                                </Button>

                                <div className="h-8 sm:h-10 w-px bg-white/30"></div>
                            </>
                        )}

                        {!isLoggedIn ? (
                            <Button
                                onClick={() => setLoginModalOpen(true)}
                                className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 flex items-center gap-1 sm:gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                                title="Login"
                            >
                                <FaLock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Login</span>
                            </Button>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 py-1 rounded-lg">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-300 to-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-blue-900 shadow-md">
                                        <span className="text-xs sm:text-sm">{username[0]?.toUpperCase()}</span>
                                    </div>
                                    <div className="hidden sm:block min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold truncate">{username}</p>
                                        <p className="text-xs text-white/75 uppercase tracking-wider truncate font-medium">{role}</p>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-red-500/20 hover:text-red-200 h-8 w-8 sm:h-10 sm:w-10 transition-colors"
                                    onClick={() => setLogoutModalOpen(true)}
                                    title="Logout"
                                >
                                    <FaSignOutAlt className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    <StatCard
                        title="Pending"
                        value={pendingCount}
                        color="from-orange-400 to-orange-600"
                        status="pending"
                        icon={FaClock}
                    />
                    <StatCard
                        title="In Progress"
                        value={onProgressCount}
                        color="from-blue-400 to-blue-600"
                        status="on-progress"
                        icon={FaSpinner}
                    />
                    <StatCard
                        title="Approved"
                        value={approvedCount}
                        color="from-green-400 to-green-600"
                        status="approved"
                        icon={FaCheckCircle}
                    />
                    <StatCard
                        title="Rejected"
                        value={rejectedCount}
                        color="from-red-400 to-red-600"
                        status="rejected"
                        icon={FaTimesCircle}
                    />
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <Card className="hover:shadow-lg transition-all">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <FaChartBar className="text-primary" />
                                Total Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalCount}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Forms submitted in total</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <FaCheckCircle className="text-success" />
                                Completion Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="w-full h-4 bg-muted rounded-full overflow-hidden shadow-sm">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 rounded-full"
                                                style={{ width: `${completionRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-3xl sm:text-4xl font-bold text-emerald-600 min-w-max">{completionRate}%</p>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{approvedCount + rejectedCount} of {totalCount} completed</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                        <div>
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <FaEye className="text-primary" />
                                Valuation Forms
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-1">{sortedFiles.length} records {statusFilter && `filtered`}</CardDescription>
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
                                    className="text-xs sm:text-sm px-2 sm:px-3"
                                >
                                    Clear Filters
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchFiles(false)}
                                disabled={loading}
                                className="text-xs sm:text-sm px-2 sm:px-3"
                            >
                                <FaSyncAlt className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
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
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="min-w-[120px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("uniqueId")}>
                                                    <div className="flex items-center gap-1">Form ID {sortField === "uniqueId" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[100px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("clientName")}>
                                                    <div className="flex items-center gap-1">Client Name {sortField === "clientName" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[140px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("address")}>
                                                    <div className="flex items-center gap-1"> Client Address {sortField === "address" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[100px] text-xs sm:text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            value={cityFilter || ""}
                                                            onChange={(e) => setCityFilter(e.target.value || null)}
                                                            className="text-xs px-2 py-1 border rounded bg-white cursor-pointer"
                                                        >
                                                            <option value="">All Cities</option>
                                                            {uniqueCities.map(city => (
                                                                <option key={city} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="min-w-[100px] text-xs sm:text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            value={bankFilter || ""}
                                                            onChange={(e) => setBankFilter(e.target.value || null)}
                                                            className="text-xs px-2 py-1 border rounded bg-white cursor-pointer"
                                                        >
                                                            <option value="">All Banks</option>
                                                            {uniqueBanks.map(bank => (
                                                                <option key={bank} value={bank}>{bank}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="min-w-[120px] text-xs sm:text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            value={engineerFilter || ""}
                                                            onChange={(e) => setEngineerFilter(e.target.value || null)}
                                                            className="text-xs px-2 py-1 border rounded bg-white cursor-pointer"
                                                        >
                                                            <option value="">All Engineers</option>
                                                            {uniqueEngineers.map(engineer => (
                                                                <option key={engineer} value={engineer}>{engineer}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="min-w-[90px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("mobileNumber")}>
                                                    <div className="flex items-center gap-1">Mobile {sortField === "mobileNumber" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[80px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("payment")}>
                                                    <div className="flex items-center gap-1">Payment {sortField === "payment" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[70px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("status")}>
                                                    <div className="flex items-center gap-1">Status {sortField === "status" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[80px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("duration")}>
                                                    <div className="flex items-center gap-1">Duration {sortField === "duration" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[140px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("createdAt")}>
                                                    <div className="flex items-center gap-1">Date & Time {sortField === "createdAt" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[200px] text-xs sm:text-sm">Notes</TableHead>
                                                <TableHead className="min-w-[180px] text-xs sm:text-sm">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedFiles.map((record) => (
                                                <TableRow key={record._id}>
                                                    <TableCell className="font-mono text-xs">{record.uniqueId?.substring(0, 10)}...</TableCell>
                                                    <TableCell className={`text-sm font-bold text-slate-950 ${record.address && record.address.length > 50 ? 'whitespace-normal' : ''}`}>{record.clientName}</TableCell>
                                                    <TableCell className={`text-sm font-semibold text-slate-950 ${record.address && record.address.length > 50 ? 'max-w-[200px] whitespace-normal break-words' : 'max-w-[140px] truncate'}`}>{record.address}</TableCell>
                                                    <TableCell className="text-sm">{record.city}</TableCell>
                                                    <TableCell className="text-sm">{record.bankName}</TableCell>
                                                    <TableCell className="text-sm">{record.engineerName}</TableCell>
                                                    <TableCell className="text-sm">{record.mobileNumber}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={record.payment === "yes" ? "success" : "warning"}>
                                                            {record.payment === "yes" ? "yes" : "no"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                                                    <TableCell>
                                                        {timeDurations[record._id] ? (
                                                            <Badge variant="outline" className="text-xs bg-slate-50">{timeDurations[record._id].days}:{timeDurations[record._id].hours}:{timeDurations[record._id].minutes}:{timeDurations[record._id].seconds}</Badge>
                                                        ) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm">
                                                        {record.dateTime || record.createdAt ? (
                                                            <>
                                                                <div>{new Date(record.dateTime || record.createdAt).toLocaleDateString()}</div>
                                                                <div>{new Date(record.dateTime || record.createdAt).toLocaleTimeString()}</div>
                                                            </>
                                                        ) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-xs sm:text-sm max-w-[200px]">
                                                        {record.notes ? (
                                                            <div className="whitespace-normal break-words line-clamp-2" title={record.notes}>
                                                                {record.notes}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {role === "user" && record.status === "pending" && (
                                                                <Badge
                                                                    variant="warning"
                                                                    className="text-xs px-2 py-1 cursor-pointer hover:opacity-80"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                >
                                                                    Edit
                                                                </Badge>
                                                            )}
                                                            {role === "user" && record.status === "on-progress" && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="text-xs px-2 py-1 cursor-pointer hover:opacity-80"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                >
                                                                    Edit
                                                                </Badge>
                                                            )}
                                                            {role === "user" && record.status === "rejected" && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-xs px-2 py-1 cursor-pointer hover:opacity-80"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                >
                                                                    Edit
                                                                </Badge>
                                                            )}
                                                            {record.status === "approved" && (
                                                                <Badge
                                                                    variant="success"
                                                                    className="text-xs px-2 py-1 cursor-pointer hover:opacity-80"
                                                                    onClick={() => handleDownloadPDF(record)}
                                                                >
                                                                    <FaDownload className="h-3 w-3 mr-0.5" />
                                                                    PDF
                                                                </Badge>
                                                            )}
                                                            {(["manager1", "manager2"].includes(role) || role === "admin") && (record.status === "pending" || record.status === "on-progress") && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="text-xs px-2 py-1 cursor-pointer hover:opacity-80"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                >
                                                                    Review
                                                                </Badge>
                                                            )}
                                                            {(["manager1", "manager2"].includes(role) || role === "admin") && record.status === "rejected" && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="text-xs px-2 py-1 cursor-pointer hover:opacity-80"
                                                                    onClick={() => navigate(`/valuationeditform/${record.uniqueId}`)}
                                                                >
                                                                    Edit
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {(record.status === "approved" || record.status === "rejected") && (
                                                            <div className="mt-1 sm:mt-2 text-xs text-muted-foreground space-y-1">
                                                                <p className="truncate">{`${record.status === "approved" ? "✓ Approved" : "✗ Rejected"} by ${record.lastUpdatedBy || "System"}`}</p>
                                                                {record.managerFeedback && (
                                                                    <p className="italic line-clamp-2">{record.managerFeedback.substring(0, 50)}...</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => dispatch(setCurrentPage(page))}
                                />
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <FaEye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">No data found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Chat Modal */}
            {isLoggedIn && (
                <>
                    <ChatModal
                        isOpen={chatModalOpen}
                        onClose={() => setChatModalOpen(false)}
                        user={user}
                    />

                    {/* Floating Chat Button */}
                    <button
                        onClick={() => setChatModalOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
                        title="Chat Support"
                    >
                        <FaComments className="w-8 h-8" />
                    </button>
                </>
            )}

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
        </div>
    );
};

export default DashboardPage;
