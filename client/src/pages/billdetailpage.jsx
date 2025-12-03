import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBillById } from "../services/billService";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { FaFileInvoice, FaArrowLeft, FaPrint } from "react-icons/fa";

const BillDetailPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const role = user?.role || "";
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        loadBill();
    }, [id]);

    const loadBill = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getBillById(id);
            if (response.success) {
                setBill(response.data);
            } else {
                setError(response.message || "Error loading bill");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error loading bill");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block p-3 bg-orange-100 rounded-full mb-4">
                        <FaFileInvoice className="h-8 w-8 text-orange-600" />
                    </div>
                    <p className="text-gray-600 font-semibold">Loading bill...</p>
                </div>
            </div>
        );
    }

    const ErrorState = ({ message }) => (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/bills")}
                        className="h-10 w-10 border-2 border-orange-200 hover:bg-orange-50 rounded-lg"
                    >
                        <FaArrowLeft className="h-4 w-4 text-orange-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bill Details</h1>
                        <p className="text-sm text-gray-500 mt-1">View bill information</p>
                    </div>
                </div>
                {message && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm mt-1">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!bill) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate("/bills")}
                            className="h-10 w-10 border-2 border-orange-200 hover:bg-orange-50 rounded-lg"
                        >
                            <FaArrowLeft className="h-4 w-4 text-orange-600" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bill Details</h1>
                            <p className="text-sm text-gray-500 mt-1">View bill information</p>
                        </div>
                    </div>
                    <div className="text-center py-16">
                        <div className="mb-4 flex justify-center">
                            <div className="p-4 bg-orange-100 rounded-full">
                                <FaFileInvoice className="h-12 w-12 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-gray-600 font-semibold text-lg">Bill not found</p>
                        <Button onClick={() => navigate("/bills")} className="mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-semibold shadow-lg transition-all duration-300">
                            <FaArrowLeft className="h-4 w-4 mr-2" />
                            Back to Bills
                        </Button>
                    </div>
                </div>
            </div>
        );
    }



    const totalItems = bill.items?.length || 0;
    const totalAmount = bill.totalAmount || 0;
    const totalGst = bill.totalGst || 0;
    const grandTotal = bill.grandTotal || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate("/bills")}
                            className="h-10 w-10 border-2 border-orange-200 hover:bg-orange-50 rounded-lg"
                        >
                            <FaArrowLeft className="h-4 w-4 text-orange-600" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bill Details</h1>
                            <p className="text-sm text-gray-500 mt-1">Bill No. {bill.billNumber}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handlePrint}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-semibold shadow-lg transition-all duration-300"
                    >
                        <FaPrint className="h-4 w-4 mr-2" />
                        Print / PDF
                    </Button>
                </div>

                {/* Print-friendly Invoice with Scrolling */}
                <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden print:shadow-none print:border-0">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b-0">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FaFileInvoice className="h-5 w-5" />
                                Invoice Details
                            </CardTitle>
                            <p className="text-orange-100 text-sm mt-2">Bill Number: <span className="font-bold text-white">{bill.billNumber}</span></p>
                        </CardHeader>
                        <CardContent className="p-8">
                            {/* Invoice Header */}
                            <div className="border-b-2 pb-6 mb-6">
                                <h2 className="text-4xl font-bold text-orange-600">TAX INVOICE</h2>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-8">
                                {/* Vendor Details */}
                                <div className="bg-gradient-to-br from-red-50 to-slate-50 p-5 rounded-lg border-l-4 border-l-red-500 shadow-sm">
                                    <h3 className="font-bold text-sm mb-3 text-slate-900 flex items-center gap-2">
                                        <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                                        VENDOR DETAILS
                                    </h3>
                                    <p className="font-black text-slate-900 mb-2">{bill.vendorName}</p>
                                    <p className="text-sm whitespace-pre-wrap text-slate-700 mb-2">
                                        {bill.vendorAddress}
                                    </p>
                                    {bill.vendorPan && (
                                        <p className="text-xs mt-2 text-slate-700">
                                            <strong className="font-semibold">PAN:</strong> <span className="font-mono text-slate-800">{bill.vendorPan}</span>
                                        </p>
                                    )}
                                    {bill.vendorGst && (
                                        <p className="text-xs text-slate-700">
                                            <strong className="font-semibold">GST:</strong> <span className="font-mono text-slate-800">{bill.vendorGst}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Bill Info */}
                                <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-5 rounded-lg border-l-4 border-l-blue-500 shadow-sm">
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Bill Number</p>
                                        <p className="font-black text-slate-900 text-lg mt-1">{bill.billNumber}</p>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Bill Month</p>
                                        <p className="font-semibold text-slate-800 mt-1">{bill.billMonth}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Bill Date</p>
                                        <p className="font-semibold text-slate-800 mt-1">{bill.billDate}</p>
                                    </div>
                                </div>

                                {/* Bill To Details */}
                                <div className="bg-gradient-to-br from-green-50 to-slate-50 p-5 rounded-lg border-l-4 border-l-green-500 shadow-sm">
                                    <h3 className="font-bold text-sm mb-3 text-slate-900 flex items-center gap-2">
                                        <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                                        BILL TO (RECEIVER)
                                    </h3>
                                    <p className="font-black text-slate-900 mb-2">{bill.billToName}</p>
                                    <p className="text-sm whitespace-pre-wrap text-slate-700 mb-2">
                                        {bill.billToAddress}
                                    </p>
                                    {bill.billToGstin && (
                                        <p className="text-xs mt-2 text-slate-700">
                                            <strong className="font-semibold">GSTIN:</strong> <span className="font-mono text-slate-800">{bill.billToGstin}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                <h3 className="font-bold mb-4 text-lg text-slate-900 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-gradient-to-b from-[#F36E21] to-[#EC5E25] rounded-full"></div>
                                    PARTICULARS
                                </h3>
                                <table className="w-full border border-slate-300">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-blue-300">
                                            <th className="border border-slate-300 px-4 py-3 text-left text-sm font-black text-slate-800">
                                                Particulars
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-left text-sm font-black text-slate-800">
                                                HSN/SAC
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-black text-slate-800">
                                                Amount
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-black text-slate-800">
                                                GST %
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-black text-slate-800">
                                                CGST
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-black text-slate-800">
                                                SGST
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-black text-slate-800">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bill.items?.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-200 hover:bg-blue-50 transition-colors duration-200">
                                                <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                                    {item.particulars}
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">{item.hsn}</td>
                                                <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{item.amount?.toFixed(2) || "0.00"}
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    {item.gstRate}%
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{item.cgst?.toFixed(2) || "0.00"}
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{item.sgst?.toFixed(2) || "0.00"}
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3 text-right text-sm font-black text-[#F36E21]">
                                                    ₹{item.itemTotal?.toFixed(2) || "0.00"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tax Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Left side - empty for layout */}
                                <div></div>

                                {/* Tax Summary Table */}
                                <div className="bg-gradient-to-br from-slate-50 to-orange-50 p-6 rounded-lg border-l-4 border-l-[#F36E21] shadow-sm">
                                    <h3 className="font-bold mb-4 text-slate-900 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-gradient-to-b from-[#F36E21] to-[#EC5E25] rounded-full"></div>
                                        TAX SUMMARY
                                    </h3>
                                    <table className="w-full">
                                        <tbody>
                                            <tr className="border-b border-slate-300">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    Total Amount
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{totalAmount?.toFixed(2) || "0.00"}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-300">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    CGST (9%)
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{(bill.totalCgst || 0)?.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-300">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    SGST (9%)
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{(bill.totalSgst || 0)?.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-300">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    IGST (18%)
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{(bill.totalIgst || 0)?.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="bg-gradient-to-r from-[#F36E21] to-[#EC5E25] border-2 border-[#EC5E25]">
                                                <td className="px-4 py-3 text-sm font-black text-white">GRAND TOTAL</td>
                                                <td className="px-4 py-3 text-right text-lg font-black text-white">
                                                    ₹{grandTotal?.toFixed(2) || "0.00"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bank Details */}
                            {bill.bankDetails?.bankName && (
                                <div className="border-t-2 border-slate-300 pt-6 mb-6 bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-lg">
                                    <h3 className="font-bold mb-4 text-slate-900 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                        BANK DETAILS
                                    </h3>
                                    <table className="text-sm w-full">
                                        <tbody>
                                            {bill.bankDetails?.beneficiary && (
                                                <tr className="border-b border-slate-200">
                                                    <td className="font-semibold pr-4 py-2 text-slate-700">Beneficiary</td>
                                                    <td className="py-2 text-slate-700">{bill.bankDetails.beneficiary}</td>
                                                </tr>
                                            )}
                                            {bill.bankDetails?.bankName && (
                                                <tr className="border-b border-slate-200">
                                                    <td className="font-semibold pr-4 py-2 text-slate-700">Bank Name</td>
                                                    <td className="py-2 text-slate-700">{bill.bankDetails.bankName}</td>
                                                </tr>
                                            )}
                                            {bill.bankDetails?.accountNo && (
                                                <tr className="border-b border-slate-200">
                                                    <td className="font-semibold pr-4 py-2 text-slate-700">Account No.</td>
                                                    <td className="py-2 text-slate-700 font-mono">{bill.bankDetails.accountNo}</td>
                                                </tr>
                                            )}
                                            {bill.bankDetails?.ifscCode && (
                                                <tr>
                                                    <td className="font-semibold pr-4 py-2 text-slate-700">IFSC Code</td>
                                                    <td className="py-2 text-slate-700 font-mono">{bill.bankDetails.ifscCode}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Declaration */}
                            {bill.declaration && (
                                <div className="border-t-2 border-slate-300 pt-6 mb-6 bg-gradient-to-br from-amber-50 to-slate-50 p-6 rounded-lg border-l-4 border-l-amber-500">
                                    <p className="text-sm italic text-slate-700 font-semibold">
                                        <strong className="text-slate-900">Declaration:</strong> {bill.declaration}
                                    </p>
                                </div>
                            )}

                            {/* Signature Section */}
                            <div className="border-t pt-6 grid grid-cols-3 gap-8 mt-8">
                                <div></div>
                                <div></div>
                                <div className="text-center">
                                    <div className="border-t-2 border-black pt-2 mb-2">
                                        Seal & Signature
                                    </div>
                                    {bill.signerName && (
                                        <p className="text-sm font-semibold">{bill.signerName}</p>
                                    )}
                                    {bill.place && <p className="text-xs text-gray-600">{bill.place}</p>}
                                    {bill.signatureDate && (
                                        <p className="text-xs text-gray-600">{bill.signatureDate}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:shadow-none {
            box-shadow: none;
          }
          .print\\:border-0 {
            border: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default BillDetailPage;
