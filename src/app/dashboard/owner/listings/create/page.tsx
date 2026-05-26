"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, FileText, Building2, CheckCircle2, Loader2, UploadCloud, PlusCircle, X, Navigation } from "lucide-react";
import { createPropertyAction } from "../../actions";
import PredictiveAddressInput from "@/components/PredictiveAddressInput";
import InteractiveMap from "@/components/InteractiveMap";

const STEPS = [
  { id: "details", title: "Details", icon: Building2 },
  { id: "location", title: "Location", icon: MapPin },
  { id: "media", title: "Media", icon: Camera },
  { id: "legal", title: "Legal", icon: FileText },
];

export default function CreateListingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "WAREHOUSE",
    sizeSqft: "",
    pricePerHour: "",
    pricePerDay: "",
    pricePerMonth: "",
    minDuration: "1",
    maxDuration: "12",
    durationUnit: "MONTHS",
    address: "",
    lat: null as number | null,
    lng: null as number | null,
    amenities: [] as string[],
  });

  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    // Automatically try to get location on step 2 (Location step)
    if (currentStep === 1) {
      if (navigator.geolocation) {
        if (!formData.address && !formData.lat) {
          setAddressLoading(true);
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoords({ lat: latitude, lng: longitude });
            
            if (!formData.address && !formData.lat) {
              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(res => res.json())
                .then(data => {
                  setFormData(prev => ({
                    ...prev,
                    address: data.display_name,
                    lat: latitude,
                    lng: longitude,
                  }));
                  setAddressLoading(false);
                })
                .catch(err => {
                  console.error("Reverse geocoding error:", err);
                  setAddressLoading(false);
                });
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setAddressLoading(false);
          }
        );
      }
    }
  }, [currentStep]); // Exclude formData to prevent infinite loops

  const handleAddressSelect = (suggestion: any) => {
    setFormData({
      ...formData,
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setAddressLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding using Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            setFormData({
              ...formData,
              address: data.display_name,
              lat: latitude,
              lng: longitude,
            });
            setAddressLoading(false);
          })
          .catch(err => {
            console.error("Reverse geocoding error:", err);
            setAddressLoading(false);
            alert("Failed to get address for current location");
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setAddressLoading(false);
        alert("Failed to get current location. Please allow location access.");
      }
    );
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.urls) {
        setImageUrls(prev => [...prev, ...data.urls]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const submitForm = async () => {
    setLoading(true);
    setError("");
    
    const result = await createPropertyAction({
      title: formData.title,
      description: formData.description,
      propertyType: formData.propertyType as "WAREHOUSE" | "FLEX" | "OFFICE",
      sizeSqft: parseInt(formData.sizeSqft) || 0,
      pricePerHour: parseFloat(formData.pricePerHour) || undefined,
      pricePerDay: parseFloat(formData.pricePerDay) || undefined,
      pricePerMonth: parseFloat(formData.pricePerMonth) || 0,
      minDuration: parseInt(formData.minDuration) || 1,
      maxDuration: parseInt(formData.maxDuration) || 12,
      durationUnit: formData.durationUnit,
      address: formData.address,
      lat: formData.lat,
      lng: formData.lng,
      amenities: formData.amenities,
      imageUrls: imageUrls,
    });

    setLoading(false);

    if (result.success) {
      router.push("/dashboard/owner");
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">List Your Space</h1>
        <p className="text-white/60 mt-1">Reach thousands of flex-occupancy tenants.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#b4e6ff] shadow-[0_0_15px_#b4e6ff] rounded-full z-0 transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 backdrop-blur-md
                  ${isActive ? "bg-[#b4e6ff] border-[#b4e6ff] text-black shadow-[0_0_15px_rgba(180,230,255,0.5)]" : 
                    isCompleted ? "bg-[#b4e6ff] border-[#b4e6ff] text-black shadow-[0_0_15px_rgba(180,230,255,0.5)]" : "bg-black/50 border-white/20 text-white/40"}`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-3 font-medium tracking-wide ${isActive || isCompleted ? "text-white" : "text-white/40"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Content Container with Glassmorphism subtle effect */}
      <div className="pure-glass p-6 md:p-10 mb-8 min-h-[400px]">
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-6 text-sm font-medium border border-red-500/30">
            {error}
          </div>
        )}

        {/* STEP 1: DETAILS */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Listing Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Premium Flex Space in Downtown"
                className="w-full glass-input"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Property Type</label>
                <select 
                  value={formData.propertyType}
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  className="w-full glass-input"
                >
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="FLEX">Flex Industrial</option>
                  <option value="OFFICE">Office</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Total Size (Sqft)</label>
                <input 
                  type="number"
                  value={formData.sizeSqft}
                  onChange={(e) => setFormData({...formData, sizeSqft: e.target.value})}
                  placeholder="5000"
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Duration Unit</label>
                <select 
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({...formData, durationUnit: e.target.value})}
                  className="w-full glass-input"
                >
                  <option value="HOURS">Hours (Hourly)</option>
                  <option value="DAYS">Days (Daily)</option>
                  <option value="MONTHS">Months (Monthly)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/80 mb-2">Min {formData.durationUnit.toLowerCase()}</label>
                  <input 
                    type="number"
                    value={formData.minDuration}
                    onChange={(e) => setFormData({...formData, minDuration: e.target.value})}
                    placeholder="1"
                    className="w-full glass-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/80 mb-2">Max {formData.durationUnit.toLowerCase()}</label>
                  <input 
                    type="number"
                    value={formData.maxDuration}
                    onChange={(e) => setFormData({...formData, maxDuration: e.target.value})}
                    placeholder="12"
                    className="w-full glass-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price / Hour ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  placeholder="Optional"
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price / Day ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                  placeholder="Optional"
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price / Month ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({...formData, pricePerMonth: e.target.value})}
                  placeholder="2500"
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                placeholder="Describe the space, access hours, and suitability..."
                className="w-full glass-input resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Wi-Fi", "Loading Dock", "Forklift", "HVAC", "24/7 Access", "Security Cameras", "Meeting Rooms", "Parking"].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-[#b4e6ff] w-4 h-4"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                        } else {
                          setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
                        }
                      }}
                    />
                    <span className="text-sm text-white/90">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/80">Property Address</label>
                <button 
                  type="button" 
                  onClick={handleCurrentLocation}
                  className="text-xs flex items-center gap-1 text-[#b4e6ff] font-medium hover:underline bg-[#b4e6ff]/10 px-3 py-1.5 rounded-lg border border-[#b4e6ff]/20"
                >
                  <Navigation className="w-3 h-3" /> Use Current Location
                </button>
              </div>
              <div className="relative">
                <PredictiveAddressInput 
                  initialValue={formData.address}
                  onSelect={(address, lat, lng) => {
                    setFormData({
                      ...formData,
                      address,
                      lat,
                      lng
                    });
                  }}
                  className="w-full pl-12 glass-input"
                />
              </div>
              <p className="text-xs text-white/50 mt-2">
                Select an address from the dropdown to verify its location.
              </p>
            </div>
            
            <div className="h-64 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative">
              {formData.address && formData.address.length > 5 ? (
                <InteractiveMap 
                  lat={formData.lat || 0} 
                  lng={formData.lng || 0} 
                  address={formData.address} 
                  className="w-full h-full"
                />
              ) : (
                <div className="bg-white/5 w-full h-full flex flex-col items-center justify-center">
                  <MapPin className="h-10 w-10 text-white/30 mb-2" />
                  <p className="text-white/60 font-medium">Map Preview</p>
                  <p className="text-sm text-white/40">Map will center on selected address</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: MEDIA */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white">Upload Property Photos</h3>
              <p className="text-sm text-white/60 mt-1">High-quality images increase inquiries by up to 40%.</p>
            </div>
            
            <div 
              className={`border-2 border-dashed ${uploading ? 'border-white/40 bg-white/5' : 'border-white/20'} rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-pointer relative backdrop-blur-sm`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#b4e6ff] animate-spin mb-4" />
                  <p className="font-medium text-white">Uploading images...</p>
                </>
              ) : (
                <>
                  <div className="bg-white/10 p-4 rounded-full mb-4 shadow-inner border border-white/20">
                    <UploadCloud className="h-8 w-8 text-white/70" />
                  </div>
                  <p className="font-medium text-white mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-white/50 mb-6">SVG, PNG, JPG or GIF (max. 10MB)</p>
                  <button className="glass-button-secondary !py-2 !text-sm flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Browse Files
                  </button>
                </>
              )}
            </div>
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {imageUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-square bg-white/5 rounded-xl border border-white/10 relative group overflow-hidden cursor-pointer"
                    onClick={() => setPreviewImage(url)}
                  >
                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-white/5 rounded-xl border border-dashed border-white/30 flex flex-col items-center justify-center text-white/50 hover:bg-white/10 hover:text-white/80 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Add More</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: LEGAL */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white">Occupancy Agreement</h3>
              <p className="text-sm text-white/60 mt-1">Upload your standard agreement or use our digital template.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <label className="border-2 border-[#b4e6ff] bg-[#b4e6ff]/5 rounded-2xl p-6 cursor-pointer relative">
                <div className="absolute top-4 right-4 bg-[#b4e6ff] text-black rounded-full p-1 shadow-[0_0_10px_rgba(180,230,255,0.5)]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <FileText className="w-8 h-8 text-[#b4e6ff] mb-4" />
                <h4 className="font-semibold text-white mb-2">Occupyo Standard</h4>
                <p className="text-sm text-white/60">Use our vetted, flexible occupancy agreement template. Recommended for fast onboarding.</p>
              </label>
              
              <label className="border border-white/20 bg-white/5 rounded-2xl p-6 cursor-pointer hover:border-white/30 hover:bg-white/10 transition-colors">
                <UploadCloud className="w-8 h-8 text-white/40 mb-4" />
                <h4 className="font-semibold text-white mb-2">Custom Agreement</h4>
                <p className="text-sm text-white/50 mb-4">Upload your own legal terms and conditions (PDF only).</p>
                <div className="glass-button-secondary text-xs !px-3 !py-2 text-center font-medium">
                  Upload PDF
                </div>
              </label>
            </div>

            <div className="bg-[#b4e6ff]/10 border border-[#b4e6ff]/20 p-5 rounded-2xl flex items-start gap-3 mt-6">
              <div className="bg-[#b4e6ff]/20 text-[#b4e6ff] rounded-full p-1.5 mt-0.5 border border-[#b4e6ff]/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#b4e6ff]">Stripe Connect Integration</p>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Payments will be routed directly to your account. A 5% platform fee will be deducted automatically from successful bookings.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between border-t border-white/10 pt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || loading}
          className="glass-button-secondary disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="glass-button flex items-center gap-2 disabled:opacity-70"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {currentStep === STEPS.length - 1 ? "Publish Listing" : "Continue"}
        </button>
      </div>

      {/* HQ Photo Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={previewImage} 
            alt="HQ Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
