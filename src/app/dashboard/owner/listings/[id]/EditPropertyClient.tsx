"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, FileText, Building2, CheckCircle2, Loader2, UploadCloud, PlusCircle, X, Navigation } from "lucide-react";
import { updatePropertyAction } from "../../actions";
import PredictiveAddressInput from "@/components/PredictiveAddressInput";
import { Property, Image } from "@prisma/client";

const STEPS = [
  { id: "details", title: "Details", icon: Building2 },
  { id: "location", title: "Location", icon: MapPin },
  { id: "media", title: "Media", icon: Camera },
  { id: "legal", title: "Legal", icon: FileText },
];

export default function EditPropertyClient({ property, initialImages }: { property: any, initialImages: any[] }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages.map(img => img.url));
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: property.title || "",
    description: property.description || "",
    propertyType: property.propertyType || "WAREHOUSE",
    sizeSqft: property.sizeSqft?.toString() || "",
    pricePerHour: property.pricePerHour?.toString() || "",
    pricePerDay: property.pricePerDay?.toString() || "",
    pricePerMonth: property.pricePerMonth?.toString() || "",
    minDuration: property.minDuration?.toString() || "1",
    maxDuration: property.maxDuration?.toString() || "12",
    durationUnit: property.durationUnit || "MONTHS",
    address: property.address || "",
    lat: property.lat,
    lng: property.lng,
    amenities: (property.amenities as string[]) || [],
  });

  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    // Automatically try to get location on step 2 if no address exists
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
  }, [currentStep]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setAddressLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
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
    
    const result = await updatePropertyAction(property.id, {
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Your Space</h1>
        <p className="text-gray-500">Update the details for this property.</p>
      </div>

      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black rounded-full z-0 transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${isActive ? "bg-black border-black text-white" : 
                    isCompleted ? "bg-black border-black text-white" : "bg-white border-gray-300 text-gray-400"}`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive || isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 min-h-[400px]">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: DETAILS */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Premium Flex Space in Downtown"
                className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black focus:border-black outline-none"
                style={{ color: '#000000' }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select 
                  value={formData.propertyType}
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none bg-white"
                  style={{ color: '#000000' }}
                >
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="FLEX">Flex Industrial</option>
                  <option value="OFFICE">Office</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Size (Sqft)</label>
                <input 
                  type="number"
                  value={formData.sizeSqft}
                  onChange={(e) => setFormData({...formData, sizeSqft: e.target.value})}
                  placeholder="5000"
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration Unit</label>
                <select 
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({...formData, durationUnit: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none bg-white"
                  style={{ color: '#000000' }}
                >
                  <option value="HOURS">Hours (Hourly)</option>
                  <option value="DAYS">Days (Daily)</option>
                  <option value="MONTHS">Months (Monthly)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min {formData.durationUnit.toLowerCase()}</label>
                  <input 
                    type="number"
                    value={formData.minDuration}
                    onChange={(e) => setFormData({...formData, minDuration: e.target.value})}
                    placeholder="1"
                    className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max {formData.durationUnit.toLowerCase()}</label>
                  <input 
                    type="number"
                    value={formData.maxDuration}
                    onChange={(e) => setFormData({...formData, maxDuration: e.target.value})}
                    placeholder="12"
                    className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price / Hour ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  placeholder="Optional"
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
                  style={{ color: '#000000' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price / Day ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                  placeholder="Optional"
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
                  style={{ color: '#000000' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price / Month ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({...formData, pricePerMonth: e.target.value})}
                  placeholder="2500"
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                placeholder="Describe the space, access hours, and suitability..."
                className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none resize-none"
                style={{ color: '#000000' }}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Wi-Fi", "Loading Dock", "Forklift", "HVAC", "24/7 Access", "Security Cameras", "Meeting Rooms", "Parking"].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-black w-4 h-4"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                        } else {
                          setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Property Address</label>
                <button 
                  type="button" 
                  onClick={handleCurrentLocation}
                  className="text-xs flex items-center gap-1 text-blue-600 font-medium hover:underline bg-blue-50 px-2 py-1 rounded-md"
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
                  className="w-full pl-12 p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none relative bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select an address from the dropdown to verify its location.
              </p>
            </div>
            
            <div className="h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative">
              {formData.address && formData.address.length > 5 ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  allowFullScreen 
                  referrerPolicy="no-referrer-when-downgrade" 
                  src={`https://www.google.com/maps?q=${encodeURIComponent(formData.address)}&output=embed`}
                ></iframe>
              ) : (
                <>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                  <div className="text-center z-10">
                    <MapPin className="h-10 w-10 text-black mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Map Preview</p>
                    <p className="text-sm text-gray-400">Map will center on selected address</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: MEDIA */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Upload Property Photos</h3>
              <p className="text-sm text-gray-500 mt-1">High-quality images increase inquiries by up to 40%.</p>
            </div>
            
            <div 
              className={`border-2 border-dashed ${uploading ? 'border-gray-400 bg-gray-50' : 'border-gray-300'} rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative`}
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
                  <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
                  <p className="font-medium text-gray-900">Uploading images...</p>
                </>
              ) : (
                <>
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <UploadCloud className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mb-6">SVG, PNG, JPG or GIF (max. 10MB)</p>
                  <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium text-sm flex items-center gap-2">
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
                    className="aspect-square bg-gray-100 rounded-lg border border-gray-200 relative group overflow-hidden cursor-pointer"
                    onClick={() => setPreviewImage(url)}
                  >
                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors"
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
              <h3 className="text-lg font-medium text-gray-900">Occupancy Agreement</h3>
              <p className="text-sm text-gray-500 mt-1">Upload your standard agreement or use our digital template.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <label className="border-2 border-black rounded-xl p-6 cursor-pointer relative">
                <div className="absolute top-4 right-4 bg-black text-white rounded-full p-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <FileText className="w-8 h-8 text-black mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Occupyo Standard</h4>
                <p className="text-sm text-gray-500">Use our vetted, flexible occupancy agreement template. Recommended for fast onboarding.</p>
              </label>
              
              <label className="border border-gray-200 rounded-xl p-6 cursor-pointer hover:border-gray-300 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Custom Agreement</h4>
                <p className="text-sm text-gray-500 mb-4">Upload your own legal terms and conditions (PDF only).</p>
                <div className="bg-gray-50 text-gray-600 text-xs px-3 py-2 rounded border border-gray-200 text-center font-medium">
                  Upload PDF
                </div>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3 mt-6">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Stripe Connect Integration</p>
                <p className="text-xs text-blue-700 mt-1">Payments will be routed directly to your account. A 5% platform fee will be deducted automatically from successful bookings.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || loading}
          className="px-6 py-2.5 rounded-md font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-2.5 rounded-md font-medium bg-black text-white hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {currentStep === STEPS.length - 1 ? "Save Changes" : "Continue"}
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
