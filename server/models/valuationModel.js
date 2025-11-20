import mongoose from "mongoose";

const valuationSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  username: { type: String, required: true },
  dateTime: { type: String, required: true },
  day: { type: String, required: true },

  // BANK & CITY
  bankName: { type: String, required: true },
  city: { type: String, required: true },

  // CLIENT
  clientName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },

  // PAYMENT
  payment: { type: String, required: true },
  collectedBy: { type: String },

  // DSA
  dsa: { type: String, required: true },

  // ENGINEER
  engineerName: { type: String, required: true, default: "" },

  // NOTES
  notes: { type: String, default: "" },

  // PROPERTY DETAILS
  elevation: { type: String },
  longLat: { type: String },

  // DIRECTIONS
  directions: {
    north1: { type: String, default: '' },
    east1: { type: String, default: '' },
    south1: { type: String, default: '' },
    west1: { type: String, default: '' },
    north2: { type: String, default: '' },
    east2: { type: String, default: '' },
    south2: { type: String, default: '' },
    west2: { type: String, default: '' }
  },

  // COORDINATES
  coordinates: {
    latitude: { type: String, default: '' },
    longitude: { type: String, default: '' }
  },

  // IMAGES
  propertyImages: [mongoose.Schema.Types.Mixed],
  locationImages: [mongoose.Schema.Types.Mixed],

  photos: {
    elevationImages: [String],
    siteImages: [String],
  },

  // STATUS MANAGEMENT
  status: { 
    type: String, 
    enum: ["pending", "on-progress", "approved", "rejected"], 
    default: "pending" 
  },
  managerFeedback: { type: String },
  submittedByManager: { type: Boolean, default: false },
  lastUpdatedBy: { type: String }, // username of who last updated
  lastUpdatedByRole: { type: String }, // role of who last updated (manager/admin)
  lastUpdatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ValuationModel = mongoose.model("Valuation", valuationSchema);
export default ValuationModel;