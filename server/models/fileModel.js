import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true },
    customBankName: { type: String },
    city: { type: String, required: true },
    customCity: { type: String },
    clientName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    address: { type: String, required: true },
    payment: { type: String, required: true },
    collectedBy: { type: String },
    dsa: { type: String, required: true },
    customDsa: { type: String },
    engineerName: { type: String, required: true, default: "" },
    notes: { type: String, default: "" },
    username: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    dateTime: { type: String },
    day: { type: String },
    status: { 
      type: String, 
      enum: ["pending", "on-progress", "approved", "rejected"], 
      default: "pending" 
    },
    managerFeedback: { type: String },
    submittedByManager: { type: Boolean, default: false },
    lastUpdatedBy: { type: String }, // username of who last updated
    lastUpdatedByRole: { type: String } // role of who last updated (manager/admin)
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;