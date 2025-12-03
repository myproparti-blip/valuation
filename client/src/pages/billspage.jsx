import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBills, deleteBill } from "../services/billService";
import { invalidateCache } from "../services/axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/dialog";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import Badge from "../components/ui/badge";
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { FaSyncAlt, FaPlus, FaFileInvoice, FaArrowLeft } from "react-icons/fa";

const BillsPage = ({ user }) => {
    const navigate = useNavigate();
    const role = user?.role || "";
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, billNumber: null });

    const itemsPerPage = 10;

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        try {
            setLoading(true);
            setError("");
            invalidateCache("/bills");
            const response = await getAllBills();
            if (response.success === true && response.data) {
                setBills(response.data);
                setFilteredBills(response.data);
            } else if (response.success === true) {
                setBills([]);
                setFilteredBills([]);
            } else {
                setError(response.message || "Error loading bills");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error loading bills");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        filterBills(term);
        setCurrentPage(1);
    };



    const filterBills = (term) => {
        let filtered = bills;

        if (term) {
            const searchLower = term.toLowerCase();
            filtered = filtered.filter((bill) => {
                return (
                    bill.billNumber?.toLowerCase().includes(searchLower) ||
                    bill.billMonth?.toLowerCase().includes(searchLower) ||
                    bill.billDate?.toLowerCase().includes(searchLower) ||
                    bill.vendorName?.toLowerCase().includes(searchLower) ||
                    bill.vendorPan?.toLowerCase().includes(searchLower) ||
                    bill.vendorGst?.toLowerCase().includes(searchLower) ||
                    bill.billToName?.toLowerCase().includes(searchLower) ||
                    bill.billToPan?.toLowerCase().includes(searchLower) ||
                    bill.billToGstin?.toLowerCase().includes(searchLower) ||
                    bill.bankDetails?.beneficiary?.toLowerCase().includes(searchLower) ||
                    bill.bankDetails?.bankName?.toLowerCase().includes(searchLower) ||
                    bill.bankDetails?.accountNo?.toLowerCase().includes(searchLower) ||
                    bill.bankDetails?.ifscCode?.toLowerCase().includes(searchLower) ||
                    bill.signerName?.toLowerCase().includes(searchLower) ||
                    bill.place?.toLowerCase().includes(searchLower) ||
                    bill.grandTotal?.toString().includes(term)
                );
            });
        }

        setFilteredBills(filtered);
    };

    const handleDeleteClick = (billNumber) => {
        setDeleteModal({ isOpen: true, billNumber });
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await deleteBill(deleteModal.billNumber);
            if (response.success) {
                setDeleteModal({ isOpen: false, billNumber: null });
                loadBills();
            } else {
                alert(response.message || "Error deleting bill");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting bill");
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, billNumber: null });
    };





    // Pagination
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBills = filteredBills.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block p-3 bg-orange-100 rounded-full mb-4">
                        <FaFileInvoice className="h-8 w-8 text-[#F36E21]" />
                    </div>
                    <p className="text-slate-600 font-semibold">Loading bills...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/")}
                        className="h-10 w-10 border-2 border-orange-200 hover:bg-orange-50 rounded-lg"
                    >
                        <FaArrowLeft className="h-4 w-4 text-orange-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bills Management</h1>
                        <p className="text-sm text-gray-500 mt-1">View and manage all bills</p>
                    </div>
                </div>

                {/* Main Content */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}



                {/* Bills Table */}
                <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b-0">
                        {/* Title */}
                        <CardTitle className="text-lg font-bold flex items-center gap-2 mb-4">
                            <FaFileInvoice className="h-5 w-5" />
                            Bills List
                        </CardTitle>

                         {/* Header Row 1: Search and Actions */}
                         <div className="flex items-center gap-3 mb-3 flex-wrap lg:flex-nowrap">
                             {/* Search Bar */}
                             <div className="w-full lg:flex-1 lg:max-w-xs">
                                <SearchBar
                                    placeholder="Search by bill number, month, vendor, receiver, PAN, GST, bank details, amount, or signer..."
                                    onSearch={handleSearch}
                                />
                            </div>

                             {/* Action Buttons */}
                             <div className="flex gap-2 ml-auto">
                                 <Button
                                     onClick={loadBills}
                                     className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold transition-all duration-300 bg-transparent whitespace-nowrap"
                                     size="sm"
                                 >
                                     <FaSyncAlt className="h-4 w-4 mr-2" />
                                     Refresh
                                 </Button>
                                 {(role === "manager1" || role === "manager2" || role === "admin") && (
                                     <Button
                                         onClick={() => navigate("/bills/create")}
                                         className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold transition-all duration-300 bg-transparent whitespace-nowrap"
                                         size="sm"
                                     >
                                         <FaPlus className="h-4 w-4 mr-2" />
                                         Create Bill
                                     </Button>
                                 )}
                             </div>
                         </div>

                         {/* Header Row 2: Stats */}
                         <div className="flex items-center gap-4 flex-wrap">
                             <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                 <span className="text-sm font-semibold">Total Bills:</span>
                                 <span className="text-lg font-black">{bills.length}</span>
                                 {searchTerm && filteredBills.length !== bills.length && (
                                     <>
                                         <span className="text-orange-200">|</span>
                                         <span className="text-sm font-semibold">Showing:</span>
                                         <span className="font-bold">{filteredBills.length}</span>
                                     </>
                                 )}
                             </div>
                             <p className="text-orange-100 text-sm">{paginatedBills.length} of {filteredBills.length} bills displayed</p>
                         </div>
                    </CardHeader>
                    <CardContent>
                        {paginatedBills.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-blue-300">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-black text-slate-800">
                                                    Bill Number
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-black text-slate-800">
                                                    Bill Month
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-black text-slate-800">
                                                    Vendor
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-black text-slate-800">
                                                    Bill To
                                                </th>
                                                <th className="px-6 py-3 text-right text-sm font-black text-slate-800">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-sm font-black text-slate-800">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedBills.map((bill) => (
                                                <tr
                                                    key={bill._id}
                                                    className="border-b hover:bg-blue-50 transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                                                            {bill.billNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                        {bill.billMonth}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                        {bill.vendorName}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                        {bill.billToName}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-black text-right">
                                                        <span className="text-[#F36E21]">₹{bill.grandTotal?.toFixed(2) || "0.00"}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex gap-3 items-center">
                                                            <button
                                                                onClick={() =>
                                                                    navigate(`/bills/${bill.billNumber}`)
                                                                }
                                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                                title="View"
                                                            >
                                                                <AiOutlineEye size={18} />
                                                            </button>
                                                            {(role === "manager1" || role === "manager2" || role === "admin") && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            navigate(`/bills/edit/${bill.billNumber}`)
                                                                        }
                                                                        className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                                                        title="Review and Update"
                                                                    >
                                                                        <AiOutlineEdit size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(bill.billNumber)}
                                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                                        title="Delete"
                                                                    >
                                                                        <AiOutlineDelete size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="border-t-2 border-blue-300 bg-gradient-to-r from-blue-50 to-white mt-4">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-4 bg-orange-100 rounded-full">
                                        <FaFileInvoice className="h-12 w-12 text-[#F36E21]" />
                                    </div>
                                </div>
                                <p className="text-slate-600 font-semibold text-lg">No bills found</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your search or create a new bill</p>
                                {(role === "manager1" || role === "manager2" || role === "admin") && (
                                    <Button
                                        onClick={() => navigate("/bills/create")}
                                        className="mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-semibold shadow-lg transition-all duration-300"
                                    >
                                        <FaPlus className="h-4 w-4 mr-2" />
                                        Create First Bill
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModal.isOpen} onOpenChange={handleDeleteCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Bill</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this bill? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDeleteCancel}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BillsPage;
