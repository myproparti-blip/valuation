import mongoose from "mongoose";

// ----------------------------
// REUSABLE SUB-SCHEMAS
// ----------------------------

// Directions Schema
const directionSchema = new mongoose.Schema({
  north1: { type: String, default: "" },
  east1: { type: String, default: "" },
  south1: { type: String, default: "" },
  west1: { type: String, default: "" },
  north2: { type: String, default: "" },
  east2: { type: String, default: "" },
  south2: { type: String, default: "" },
  west2: { type: String, default: "" }
}, { _id: false });

// Coordinates Schema
const coordinateSchema = new mongoose.Schema({
  latitude: { type: String, default: "" },
  longitude: { type: String, default: "" }
}, { _id: false });

// Facilities Schema
const facilitiesSchema = new mongoose.Schema({
  lift: Boolean,
  waterSupply: Boolean,
  sewerage: Boolean,
  parking: Boolean,
  compoundWall: Boolean,
  pavement: Boolean
}, { _id: false });

// Flat Specification Schema
const flatSpecSchema = new mongoose.Schema({
  specifications: String,
  roof: String,
  flooring: String,
  doors: String,
  windows: String,
  fittings: String,
  finishing: String
}, { _id: false });

// House Tax Schema
const houseTaxSchema = new mongoose.Schema({
  assessmentNo: String,
  taxPaidBy: String,
  taxAmount: String
}, { _id: false });

// Electricity Connection Schema
const electricitySchema = new mongoose.Schema({
  connectionNo: String,
  meterName: String
}, { _id: false });

// Boundaries Schema
const boundarySchema = new mongoose.Schema({
  east: String,
  west: String,
  north: String,
  south: String
}, { _id: false });


// ----------------------------
// MAIN VALUATION SCHEMA
// ----------------------------
const valuationSchema = new mongoose.Schema({

  // BASIC INFO
  uniqueId: { type: String, required: true },
  username: { type: String, required: true },
  dateTime: { type: String, required: true },
  day: { type: String, required: true },

  // BANK & CITY
  bankName: { type: String, required: true },
  city: { type: String, required: true },

  // CLIENT DETAILS
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

  // PROPERTY BASIC DETAILS
  elevation: String,
  longLat: String,

  // DIRECTIONS
  directions: directionSchema,

  // COORDINATES
  coordinates: coordinateSchema,

  // IMAGES
  propertyImages: [mongoose.Schema.Types.Mixed],
  locationImages: [mongoose.Schema.Types.Mixed],

  photos: {
    elevationImages: [String],
    siteImages: [String]
  },

  // STATUS
  status: {
    type: String,
    enum: ["pending", "on-progress", "approved", "rejected", "rework"],
    default: "pending"
  },
  managerFeedback: String,
  submittedByManager: { type: Boolean, default: false },
  
  // REWORK
  reworkComments: String,
  reworkRequestedBy: String,
  reworkRequestedAt: { type: Date, default: null },
  reworkRequestedByRole: String,

  lastUpdatedBy: String,
  lastUpdatedByRole: String,
  lastUpdatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  pdfDetails: {
    formId: String,
    branch: String,
    valuationPurpose: String,
    inspectionDate: String,
    valuationMadeDate: String,
    mortgageDeed: String,
    mortgageDeedBetween: String,
    previousValuationReport: String,
    previousValuationIssuedBy: String,
    previousValuationDate: String,
    previousValuationInFavorOf: String,
    planIssueDate: String,

    ownerName: String,

    // PROPERTY DESCRIPTION
    plotSurveyBlockNo: String,
    doorShopNo: String,
    tpVillage: String,
    wardTaluka: String,
    mandalDistrict: String,
    layoutPlanIssueDate: String,
    approvedMapAuthority: String,
    authenticityVerified: String,
    valuerCommentOnAuthenticity: String,

    postalAddress: String,
    cityTown: String,
    residentialArea: String,
    commercialArea: String,
    industrialArea: String,
    locationOfProperty: String,

    // AREA DETAILS
    classificationArea: String,
    urbanType: String,
    underCorporation: String,
    govtEnactmentCover: String,

    boundariesDocument: boundarySchema,
    boundariesActual: boundarySchema,

    builtUpArea: String,
    carpetArea: String,
    udsLand: String,

    latitudeLongitude: String,
    siteConsideredArea: String,
    occupancyStatus: String,

    // APARTMENT DETAILS
    apartmentNature: String,
    apartmentLocation: String,
    surveyBlockNo: String,
    tpFpNo: String,
    villageMunicipality: String,
    doorStreet: String,
    localityDescription: String,
    constructionYear: String,
    numberOfFloors: String,
    structureType: String,
    dwellingUnits: String,
    qualityOfConstruction: String,
    buildingAppearance: String,
    buildingMaintenance: String,

    facilities: facilitiesSchema,

    flatFloor: String,
    flatDoorNo: String,
    flatSpecifications: flatSpecSchema,

    houseTax: houseTaxSchema,
    electricityConnection: electricitySchema,

    flatMaintenance: String,
    saleDeedName: String,
    undividedLandArea: String,
    plinthArea: String,
    fsi: String,
    carpetAreaValuation: String,
    flatClass: String,
    usage: String,
    occupancy: String,
    rent: String,

    // MARKET VALUE ANALYSIS
    marketability: String,
    positiveFactors: String,
    negativeFactors: String,
    compositeRate: String,

    jantriRate: String,
    basicCompositeRate: String,
    buildingServiceRate: String,
    landOtherRate: String,

    depreciatedBuildingRate: String,
    replacementCost: String,
    buildingAge: String,
    buildingLife: String,
    depreciationPercentage: String,
    depreciatedRatio: String,

    finalCompositeRate: String,
    presentValue: String,
    furnitureFixtureValue: String,
    totalValue: String,

    fairMarketValue: String,
    realizableValue: String,
    distressValue: String,
    saleDeedValue: String,
    insurableValue: String,
    totalJantriValue: String,
    documentsShownToUs: [String],
    customDocuments: [String],

    // FLAT SPECIFICATIONS EXTENDED
    areaUsage: String,
    carpetAreaFlat: String,
    
    // SIGNATURE & REPORT DETAILS
    place: String,
    signatureDate: String,
    signerName: String,
    reportDate: String,
    fairMarketValueWords: String,
    totalValueWords: String
  }
});

const ValuationModel = mongoose.model("Valuation", valuationSchema);
export default ValuationModel;
