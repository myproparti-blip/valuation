import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBill, updateBill, getBillById } from "../services/billService";
import { useNotification } from "../context/NotificationContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { FaFileInvoice, FaArrowLeft } from "react-icons/fa";

const BillForm = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
    const role = user?.role || "";
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");
    const [formErrors, setFormErrors] = useState({});

    // Check authorization
    useEffect(() => {
        if (role !== "manager1" && role !== "manager2" && role !== "admin") {
            setAuthError("You do not have permission to create or edit bills. Only managers and admin can access this feature.");
        }
    }, [role]);
    const [items, setItems] = useState([
        {
            particulars: "",
            hsn: "",
            gstRate: 9,
            amount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            itemTotal: 0,
        },
    ]);

    const [billData, setBillData] = useState({
        billNumber: "",
        billMonth: "",
        billDate: new Date().toISOString().split("T")[0],
        vendorName: "",
        vendorAddress: "",
        vendorPan: "",
        vendorGst: "",
        billToName: "",
        billToAddress: "",
        billToGstin: "",
        billToPan: "",
        otherReference: "",
        billFinancialYear: "",
        bankDetails: {
            beneficiary: "",
            bankName: "",
            accountNo: "",
            ifscCode: "",
        },
        declaration: "",
        signerName: "",
        signatureDate: "",
        place: "",
    });

    // Load bill if editing
    useEffect(() => {
        if (id) {
            loadBill();
        }
    }, [id]);

    const loadBill = async () => {
        try {
            setLoading(true);
            const response = await getBillById(id);
            if (response.success) {
                setBillData(response.data);
                setItems(response.data.items || []);
            }
        } catch (err) {
            showError(
                err.response?.data?.message || "Error loading bill"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBillChange = (e) => {
        const { name, value } = e.target;
        setBillData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;
        setBillData((prev) => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [name]: value,
            },
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Calculate tax amounts
        if (field === "amount" || field === "gstRate") {
            const amount = parseFloat(newItems[index].amount) || 0;
            const gstRate = parseFloat(newItems[index].gstRate) || 0;
            const gstAmount = (amount * gstRate) / 100;

            newItems[index].cgst = gstAmount / 2;
            newItems[index].sgst = gstAmount / 2;
            newItems[index].igst = 0;
            newItems[index].itemTotal = amount + gstAmount;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                particulars: "",
                hsn: "",
                gstRate: 9,
                amount: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                itemTotal: 0,
            },
        ]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const validateForm = () => {
        const errors = {};
        const errorMessages = [];

        // Validate bill number
        if (!billData.billNumber.trim()) {
            errors.billNumber = "Bill Number is required";
            errorMessages.push("Bill Number is required");
        }

        // Validate bill month
        if (!billData.billMonth.trim()) {
            errors.billMonth = "Bill Month is required";
            errorMessages.push("Bill Month is required");
        }

        // Validate vendor details
        if (!billData.vendorName.trim()) {
            errors.vendorName = "Vendor Name is required";
            errorMessages.push("Vendor Name is required");
        }
        if (!billData.vendorAddress.trim()) {
            errors.vendorAddress = "Vendor Address is required";
            errorMessages.push("Vendor Address is required");
        }

        // Validate bill to details
        if (!billData.billToName.trim()) {
            errors.billToName = "Bill To Name is required";
            errorMessages.push("Bill To Name is required");
        }
        if (!billData.billToAddress.trim()) {
            errors.billToAddress = "Bill To Address is required";
            errorMessages.push("Bill To Address is required");
        }

        // Validate items
        if (!items || items.length === 0) {
            errors.items = "At least one bill item is required";
            errorMessages.push("At least one bill item is required");
        } else {
            const itemErrors = {};
            items.forEach((item, index) => {
                if (!item.particulars.trim()) {
                    itemErrors[index] = "Particulars is required";
                    errorMessages.push(`Item ${index + 1}: Particulars is required`);
                }
                if (item.amount <= 0) {
                    itemErrors[index] = "Amount must be greater than 0";
                    errorMessages.push(`Item ${index + 1}: Amount must be greater than 0`);
                }
            });
            if (Object.keys(itemErrors).length > 0) {
                errors.items = itemErrors;
            }
        }

        setFormErrors(errors);
        return { errors, errorMessages };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const { errors, errorMessages } = validateForm();
        if (errorMessages.length > 0) {
            errorMessages.forEach(error => showError(error));
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                ...billData,
                items,
            };

            let response;
            if (id) {
                response = await updateBill(id, submitData);
            } else {
                response = await createBill(submitData);
            }

            if (response && response.success) {
                showSuccess(id ? "Bill updated successfully!" : "Bill created successfully!");
                navigate("/bills");
            } else {
                showError(response?.message || "Error saving bill");
            }
        } catch (err) {
            console.error("Error saving bill:", err);
            showError(
                err.response?.data?.message || err.message || "Error saving bill"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) {
        return <div className="text-center py-8">Loading bill...</div>;
    }

    if (authError) {
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {id ? "Edit Bill" : "Create New Bill"}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{id ? "Update bill details" : "Add a new bill to the system"}</p>
                        </div>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-semibold">Authorization Error</p>
                        <p className="text-sm mt-1">{authError}</p>
                    </div>
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
                        onClick={() => navigate("/bills")}
                        className="h-10 w-10 border-2 border-orange-200 hover:bg-orange-50 rounded-lg"
                    >
                        <FaArrowLeft className="h-4 w-4 text-orange-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {id ? "Edit Bill" : "Create New Bill"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {id ? "Update bill details" : "Add a new bill to the system"}
                        </p>
                    </div>
                </div>

                {/* Error Summary */}
                {Object.keys(formErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
                        <p className="font-semibold mb-2">Please fix the following errors:</p>
                        <ul className="text-sm list-disc list-inside">
                            {Object.entries(formErrors).map(([key, error]) => (
                                <li key={key}>
                                    {typeof error === "string"
                                        ? error
                                        : `Item errors - ${key}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Main Content with Scrolling */}
                <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b-0">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FaFileInvoice className="h-5 w-5" />
                                Bill Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Bill Header */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Bill Number
                                        </label>
                                        <Input
                                            type="text"
                                            name="billNumber"
                                            value={billData.billNumber}
                                            onChange={handleBillChange}
                                            placeholder="Auto-generated"
                                            disabled={!!id}
                                            className={formErrors.billNumber ? "border-red-500" : ""}
                                        />
                                        {formErrors.billNumber && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.billNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Bill Month
                                        </label>
                                        <Input
                                            type="text"
                                            name="billMonth"
                                            value={billData.billMonth}
                                            onChange={handleBillChange}
                                            placeholder="e.g., OCTOBER-2025"
                                            className={formErrors.billMonth ? "border-red-500" : ""}
                                        />
                                        {formErrors.billMonth && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.billMonth}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Bill Date
                                        </label>
                                        <Input
                                            type="date"
                                            name="billDate"
                                            value={billData.billDate}
                                            onChange={handleBillChange}
                                        />
                                    </div>
                                </div>

                                {/* Vendor Details */}
                                <div className="border-t pt-4">
                                    <h2 className="text-xl font-semibold mb-4">Vendor Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Vendor Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="vendorName"
                                                value={billData.vendorName}
                                                onChange={handleBillChange}
                                                className={formErrors.vendorName ? "border-red-500" : ""}
                                            />
                                            {formErrors.vendorName && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.vendorName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                PAN Number
                                            </label>
                                            <Input
                                                type="text"
                                                name="vendorPan"
                                                value={billData.vendorPan}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                GST Number
                                            </label>
                                            <Input
                                                type="text"
                                                name="vendorGst"
                                                value={billData.vendorGst}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div className="md:col-span-1" />
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">
                                                Address
                                            </label>
                                            <Textarea
                                                name="vendorAddress"
                                                value={billData.vendorAddress}
                                                onChange={handleBillChange}
                                                rows="3"
                                                className={formErrors.vendorAddress ? "border-red-500" : ""}
                                            />
                                            {formErrors.vendorAddress && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.vendorAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bill To Details */}
                                <div className="border-t pt-4">
                                    <h2 className="text-xl font-semibold mb-4">Bill To (Receiver)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <Input
                                                type="text"
                                                name="billToName"
                                                value={billData.billToName}
                                                onChange={handleBillChange}
                                                className={formErrors.billToName ? "border-red-500" : ""}
                                            />
                                            {formErrors.billToName && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.billToName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">GSTIN</label>
                                            <Input
                                                type="text"
                                                name="billToGstin"
                                                value={billData.billToGstin}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">
                                                Address
                                            </label>
                                            <Textarea
                                                name="billToAddress"
                                                value={billData.billToAddress}
                                                onChange={handleBillChange}
                                                rows="3"
                                                className={formErrors.billToAddress ? "border-red-500" : ""}
                                            />
                                            {formErrors.billToAddress && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.billToAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bill Items */}
                                <div className="border-t pt-4">
                                    <h2 className="text-xl font-semibold mb-4">Bill Items</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Particulars</th>
                                                    <th className="px-3 py-2 text-left">HSN/SAC</th>
                                                    <th className="px-3 py-2 text-right">Amount</th>
                                                    <th className="px-3 py-2 text-right">GST %</th>
                                                    <th className="px-3 py-2 text-right">CGST</th>
                                                    <th className="px-3 py-2 text-right">SGST</th>
                                                    <th className="px-3 py-2 text-right">Total</th>
                                                    <th className="px-3 py-2">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50">
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="text"
                                                                value={item.particulars}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "particulars",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full"
                                                                placeholder="Service description"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="text"
                                                                value={item.hsn}
                                                                onChange={(e) =>
                                                                    handleItemChange(index, "hsn", e.target.value)
                                                                }
                                                                className="w-full"
                                                                placeholder="HSN/SAC"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="number"
                                                                value={item.amount}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "amount",
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                className="w-full text-right"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <select
                                                                value={item.gstRate}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "gstRate",
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                className="w-full border rounded px-2 py-1"
                                                            >
                                                                <option value="0">0%</option>
                                                                <option value="5">5%</option>
                                                                <option value="9">9%</option>
                                                                <option value="12">12%</option>
                                                                <option value="18">18%</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            ₹{item.cgst.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            ₹{item.sgst.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-semibold">
                                                            ₹{item.itemTotal.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                                disabled={items.length === 1}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addItem}
                                        className="mt-4"
                                        variant="outline"
                                    >
                                        Add Item
                                    </Button>
                                </div>

                                {/* Bank Details */}
                                <div className="border-t pt-4">
                                    <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Beneficiary Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="beneficiary"
                                                value={billData.bankDetails.beneficiary}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Bank Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="bankName"
                                                value={billData.bankDetails.bankName}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Account Number
                                            </label>
                                            <Input
                                                type="text"
                                                name="accountNo"
                                                value={billData.bankDetails.accountNo}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                IFSC Code
                                            </label>
                                            <Input
                                                type="text"
                                                name="ifscCode"
                                                value={billData.bankDetails.ifscCode}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Declaration & Signature */}
                                <div className="border-t pt-4">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Declaration & Signature
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Signer Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="signerName"
                                                value={billData.signerName}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Signature Date
                                            </label>
                                            <Input
                                                type="date"
                                                name="signatureDate"
                                                value={billData.signatureDate}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Place</label>
                                            <Input
                                                type="text"
                                                name="place"
                                                value={billData.place}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">
                                                Declaration
                                            </label>
                                            <Textarea
                                                name="declaration"
                                                value={billData.declaration}
                                                onChange={handleBillChange}
                                                rows="4"
                                                placeholder="Declaration text..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="border-t pt-6 flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-semibold shadow-lg transition-all duration-300"
                                    >
                                        {loading ? "Saving..." : id ? "Update Bill" : "Create Bill"}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => navigate("/bills")}
                                        variant="outline"
                                        className="font-semibold border-2 border-orange-200 text-orange-600 hover:border-orange-600 hover:bg-orange-50 transition-all duration-300"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BillForm;
