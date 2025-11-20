import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaPlus, FaDownload, FaSyncAlt, FaEye, FaSort } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui";
import { getAllValuations } from "../services/valuationservice";
import { useLoading } from "../context/LoadingContext";
import { generateRecordPDF } from "../services/pdfExport";
import { logoutUser } from "../services/auth";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";
import { setCurrentPage, setTotalItems } from "../redux/slices/paginationSlice";
import Pagination from "../components/Pagination";

const DashboardPage = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentPage, itemsPerPage, totalItems } = useSelector((state) => state.pagination);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [timeDurations, setTimeDurations] = useState({});
    const [statusFilter, setStatusFilter] = useState(null);
    const [cityFilter, setCityFilter] = useState(null);
    const [bankFilter, setBankFilter] = useState(null);
    const [engineerFilter, setEngineerFilter] = useState(null);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const { hideLoading } = useLoading();
    const username = user?.username || "";
    const role = user?.role || "";
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
                navigate("/login");
            }, 500);
        } catch (error) {
            if (onLogout) onLogout();
            dispatch(hideLoader());
            navigate("/login");
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

    const StatCard = ({ title, value, color, status }) => (
        <Card
            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer ${statusFilter === status ? 'ring-2 ring-primary shadow-lg' : ''}`}
        >
            <div className={`h-1 sm:h-2 bg-gradient-to-r ${color}`}></div>
            <CardContent className="p-2 sm:p-3 md:p-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1 truncate">{title}</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-40">
                <div className="px-3 sm:px-6 py-2 sm:py-4 flex items-center justify-between flex-wrap gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="text-xl sm:text-2xl flex-shrink-0">📊</div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold truncate">Valuation Dashboard</h1>
                                <p className="text-xs sm:text-sm text-white/80 truncate">
                                    {role === "user" ? "Manage Your Submissions" : ["manager1", "manager2"].includes(role) ? "Review User Submissions" : "System Administrator"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                        {role === "user" && (
                            <Button
                                onClick={() => navigate("/valuationform")}
                                className="bg-white text-blue-600 hover:bg-slate-100 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
                            >
                                <FaPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden xs:inline">New Form</span>
                            </Button>
                        )}

                        <div className="h-8 sm:h-10 w-px bg-white/20"></div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs sm:text-sm font-bold">{username[0]?.toUpperCase()}</span>
                            </div>
                            <div className="hidden sm:block min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">{username}</p>
                                <p className="text-xs text-white/80 uppercase tracking-wider truncate">{role}</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setLogoutModalOpen(true)}
                            title="Logout"
                        >
                            <FaSignOutAlt className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
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
                    />
                    <StatCard
                        title="In Progress"
                        value={onProgressCount}
                        color="from-blue-400 to-blue-600"
                        status="on-progress"
                    />
                    <StatCard
                        title="Approved"
                        value={approvedCount}
                        color="from-green-400 to-green-600"
                        status="approved"
                    />
                    <StatCard
                        title="Rejected"
                        value={rejectedCount}
                        color="from-red-400 to-red-600"
                        status="rejected"
                    />
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Total Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary mb-2">{totalCount}</p>
                            <p className="text-sm text-muted-foreground">Total forms submitted</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Completion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                            style={{ width: `${completionRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-primary">{completionRate}%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <CardTitle className="text-base sm:text-lg">Valuation Forms</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">{sortedFiles.length} records {statusFilter && `(${statusFilter})`}</CardDescription>
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
                                                 <TableHead className="min-w-[80px] text-xs sm:text-sm">Duration</TableHead>
                                                 <TableHead className="min-w-[140px] text-xs sm:text-sm cursor-pointer hover:bg-slate-100" onClick={() => handleSort("createdAt")}>
                                                     <div className="flex items-center gap-1">Date & Time {sortField === "createdAt" && <FaSort className="h-3 w-3" />}</div>
                                                </TableHead>
                                                <TableHead className="min-w-[180px] text-xs sm:text-sm">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedFiles.map((record) => (
                                                <TableRow key={record._id}>
                                                    <TableCell className="font-mono text-xs">{record.uniqueId?.substring(0, 10)}...</TableCell>
                                                    <TableCell className={`text-sm font-semibold text-slate-900 ${record.address && record.address.length > 50 ? 'whitespace-normal' : ''}`}>{record.clientName}</TableCell>
                                                    <TableCell className={`text-sm ${record.address && record.address.length > 50 ? 'max-w-[200px] whitespace-normal break-words' : 'max-w-[140px] truncate'}`}>{record.address}</TableCell>
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
