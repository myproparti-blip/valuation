import mongoose from "mongoose";

// Bill Item Schema
const billItemSchema = new mongoose.Schema({
  particulars: { type: String, required: true },
  hsn: { type: String, default: "" },
  gstRate: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  itemTotal: { type: Number, required: true }
}, { _id: false });

// Bank Details Schema
const bankDetailsSchema = new mongoose.Schema({
  beneficiary: { type: String, default: "" },
  bankName: { type: String, default: "" },
  accountNo: { type: String, default: "" },
  ifscCode: { type: String, default: "" }
}, { _id: false });

// Main Bill Schema
const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  billMonth: { type: String, required: true },
  billDate: { type: String, required: true },
  
  // Vendor Details
  vendorName: { type: String, required: true },
  vendorAddress: { type: String, required: true },
  vendorPan: { type: String, default: "" },
  vendorGst: { type: String, default: "" },
  
  // Bill To (Receiver)
  billToName: { type: String, required: true },
  billToAddress: { type: String, required: true },
  billToGstin: { type: String, default: "" },
  billToPan: { type: String, default: "" },
  
  // Bill Items
  items: [billItemSchema],
  
  // Tax Summary
  totalAmount: { type: Number, default: 0 },
  totalCgst: { type: Number, default: 0 },
  totalSgst: { type: Number, default: 0 },
  totalIgst: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  totalAmountInWords: { type: String, default: "" },
  grandTotal: { type: Number, default: 0 },
  
  // Other Reference
  otherReference: { type: String, default: "" },
  billFinancialYear: { type: String, default: "" },
  
  // Bank Details
  bankDetails: bankDetailsSchema,
  
  // Declaration
  declaration: { type: String, default: "" },
  
  // Signature
  signerName: { type: String, default: "" },
  signatureDate: { type: String, default: "" },
  place: { type: String, default: "" },
  
  // Status & Metadata
  status: {
    type: String,
    enum: ["draft", "approved", "rejected", "archived"],
    default: "draft"
  },
  
  username: { type: String, required: true },
  lastUpdatedBy: { type: String, default: "" },
  lastUpdatedByRole: { type: String, default: "" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for better query performance
billSchema.index({ billNumber: 1 });
billSchema.index({ username: 1 });
billSchema.index({ createdAt: -1 });

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
