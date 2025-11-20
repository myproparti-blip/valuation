import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Label, RadioGroup, RadioGroupItem } from "../components/ui";
import { v4 as uuidv4 } from "uuid";
import { submitFile } from "../services/fileService";
import { createValuation } from "../services/valuationservice";
import { useLoading } from "../context/LoadingContext";
import { useNotification } from "../context/NotificationContext";

const FormPage = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bankName, setBankName] = useState("");
  const [city, setCity] = useState("");
  const [payment, setPayment] = useState("");
  const [dsa, setDsa] = useState("");
  const [formData, setFormData] = useState({
    bankName: "",
    customBankName: "",
    city: "",
    customCity: "",
    clientName: "",
    mobileNumber: "",
    address: "",
    payment: "",
    collectedBy: "",
    dsa: "",
    customDsa: "",
    engineerName: ""
  });

  const { showLoading, hideLoading } = useLoading();
  const { showSuccess, showError } = useNotification();
  const username = user?.username || "";

  const banks = ["SBI", "HDFC", "ICICI", "Axis", "PNB", "BOB"];
  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];
  const dsaNames = ["John Doe", "Jane Smith", "Mike Johnson"];

  const uniqueId = `FORM-${uuidv4()}`;
  const dateTime = new Date().toLocaleString();
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Mobile number validation - only numbers and max 10 digits
    if (name === "mobileNumber") {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numbersOnly }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBankChange = (val) => {
    if (val === "other") {
      setBankName("other");
      setFormData(prev => ({ ...prev, bankName: "other", customBankName: "" }));
    } else {
      setBankName(val);
      setFormData(prev => ({ ...prev, bankName: val, customBankName: "" }));
    }
  };

  const handleCityChange = (val) => {
    if (val === "other") {
      setCity("other");
      setFormData(prev => ({ ...prev, city: "other", customCity: "" }));
    } else {
      setCity(val);
      setFormData(prev => ({ ...prev, city: val, customCity: "" }));
    }
  };

  const handleDsaChange = (val) => {
    if (val === "other") {
      setDsa("other");
      setFormData(prev => ({ ...prev, dsa: "other", customDsa: "" }));
    } else {
      setDsa(val);
      setFormData(prev => ({ ...prev, dsa: val, customDsa: "" }));
    }
  };

  const handleCustomInputChange = (e, field) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const onFinish = async (e) => {
    e.preventDefault();

    const finalBankName = bankName === "other" ? formData.customBankName : bankName;
    const finalCity = city === "other" ? formData.customCity : city;
    const finalDsa = dsa === "other" ? formData.customDsa : dsa;

    const hasEmpty = !finalBankName || !finalCity || !formData.clientName ||
      !formData.mobileNumber || !formData.address || !payment || !finalDsa || !formData.engineerName;

    if (hasEmpty) {
      showError("Please fill all required fields before submitting");
      return;
    }

    // Mobile number validation
    if (formData.mobileNumber.length !== 10) {
      showError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      showLoading("Submitting your form...");

      const payload = {
        bankName: finalBankName,
        customBankName: formData.customBankName,
        city: finalCity,
        customCity: formData.customCity,
        clientName: formData.clientName,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        payment: payment,
        collectedBy: formData.collectedBy,
        dsa: finalDsa,
        customDsa: formData.customDsa,
        engineerName: formData.engineerName,
        username,
        uniqueId,
        dateTime,
        day,
        status: "pending"
      };

      await Promise.all([
        submitFile(payload),
        createValuation(payload)
      ]);

      localStorage.removeItem(`valuation_draft_${username}`);

      showSuccess("Form submitted successfully!");
      setTimeout(() => {
        hideLoading();
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      showError(err.message || "Failed to submit form");
      hideLoading();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 overflow-hidden">
      <div className="h-full max-w-6xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Create New Valuation Form</h1>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-2 h-full flex-1 overflow-hidden">
          {/* Left Column - Form Info */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">Form Information</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Submitted By</p>
                  <p className="font-semibold">{username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Day</p>
                  <p className="font-semibold">{day}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Date & Time</p>
                  <p className="font-semibold">{dateTime}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Form ID</p>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono break-all">{uniqueId}</code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Form */}
          <div className="col-span-9">
            <Card className="h-full">
              <CardContent className="p-4 h-full overflow-auto">
                <form onSubmit={onFinish} className="grid grid-cols-2 gap-4 h-full">
                  
                  {/* Bank Section */}
                  <div className="col-span-2 space-y-2">
                    <Label className="text-sm font-semibold">Bank Name *</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {banks.map(name => (
                        <Button
                          key={name}
                          type="button"
                          variant={bankName === name ? "default" : "outline"}
                          className="text-xs h-8"
                          onClick={() => handleBankChange(name)}
                        >
                          {name}
                        </Button>
                      ))}
                      <div className="relative">
                        {bankName === "other" ? (
                          <Input
                            type="text"
                            placeholder="Type bank name"
                            value={formData.customBankName}
                            onChange={(e) => handleCustomInputChange(e, "customBankName")}
                            className="h-8 text-xs"
                            autoFocus
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="text-xs h-8 w-full"
                            onClick={() => handleBankChange("other")}
                          >
                            Other
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* City Section */}
                  <div className="col-span-2 space-y-2">
                    <Label className="text-sm font-semibold">City *</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {cities.map(name => (
                        <Button
                          key={name}
                          type="button"
                          variant={city === name ? "default" : "outline"}
                          className="text-xs h-8"
                          onClick={() => handleCityChange(name)}
                        >
                          {name}
                        </Button>
                      ))}
                      <div className="relative">
                        {city === "other" ? (
                          <Input
                            type="text"
                            placeholder="Type city name"
                            value={formData.customCity}
                            onChange={(e) => handleCustomInputChange(e, "customCity")}
                            className="h-8 text-xs"
                            autoFocus
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="text-xs h-8 w-full"
                            onClick={() => handleCityChange("other")}
                          >
                            Other
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-sm font-semibold">Client Name *</Label>
                    <Input
                      id="clientName"
                      placeholder="Client name"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber" className="text-sm font-semibold">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      placeholder="10-digit number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      className="h-8 text-sm"
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>

                  {/* Address */}
                  <div className="col-span-2 space-y-2">
  <Label htmlFor="address" className="text-sm font-semibold">Address *</Label>
  <Input
    id="address"
    placeholder="Enter address"
    name="address"
    value={formData.address}
    onChange={handleInputChange}
    required
    className="text-sm w-full"
  />
</div>
                  {/* Payment Section */}
                  <div className="col-span-2 space-y-2">
                    <Label className="text-sm font-semibold">Payment Collected? *</Label>
                    <RadioGroup value={payment} onValueChange={setPayment} required className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="payment-yes" />
                        <Label htmlFor="payment-yes" className="text-sm font-normal cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="payment-no" />
                        <Label htmlFor="payment-no" className="text-sm font-normal cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                    
                    {payment === "yes" && (
  <div className="space-y-1">
    <Label htmlFor="collectedBy" className="text-sm font-semibold">Collected By</Label>
    <Input
      id="collectedBy"
      placeholder="Collector details"
      name="collectedBy"
      value={formData.collectedBy}
      onChange={handleInputChange}
      className="text-sm w-full"
    />
  </div>
)}
                  </div>

                  {/* DSA Section */}
                  <div className="col-span-2 space-y-2">
                    <Label className="text-sm font-semibold">Sales Agent (DSA) *</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {dsaNames.map(name => (
                        <Button
                          key={name}
                          type="button"
                          variant={dsa === name ? "default" : "outline"}
                          className="text-xs h-8"
                          onClick={() => handleDsaChange(name)}
                        >
                          {name}
                        </Button>
                      ))}
                      <div className="relative">
                        {dsa === "other" ? (
                          <Input
                            type="text"
                            placeholder="Type DSA name"
                            value={formData.customDsa}
                            onChange={(e) => handleCustomInputChange(e, "customDsa")}
                            className="h-8 text-xs"
                            autoFocus
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="text-xs h-8 w-full"
                            onClick={() => handleDsaChange("other")}
                          >
                            Other
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Engineer Name Section */}
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="engineerName" className="text-sm font-semibold">Engineer Name *</Label>
                    <Input
                      id="engineerName"
                      placeholder="Engineer name"
                      name="engineerName"
                      value={formData.engineerName}
                      onChange={handleInputChange}
                      required
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Submit Buttons - Fixed at bottom */}
                  <div className="col-span-2 flex gap-2 pt-4 border-t mt-auto">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-8 text-sm"
                    >
                      {loading ? "Submitting..." : "Submit Form"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      disabled={loading}
                      className="flex-1 h-8 text-sm"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;