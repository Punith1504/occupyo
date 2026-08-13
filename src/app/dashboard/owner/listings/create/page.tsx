"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, FileText, Building2, CheckCircle2, Loader2, UploadCloud, PlusCircle, X, Navigation, Star, ChevronLeft, ChevronRight, GripVertical, Image as ImageIcon } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

import { createPropertyAction } from "../../actions";

import InteractiveMap from "@/components/InteractiveMap";
import { hapticTap, hapticMedium, hapticSuccess, hapticError } from "@/lib/haptics";
import { scanRoomAR } from "@/lib/capacitor/room-plan-plugin";

const STEPS = [
  { id: "details", title: "Details", icon: Building2 },
  { id: "location", title: "Location", icon: MapPin },
  { id: "media", title: "Media", icon: Camera },
  { id: "legal", title: "Legal", icon: FileText },
];

const MAX_IMAGES = 20;

export default function CreateListingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [previewImage, setPreviewImage] = useState<number | null>(null);
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  const handleLiDARScan = async () => {
    hapticMedium();
    setLoading(true);
    try {
      const result = await scanRoomAR();
      setFormData(prev => ({
        ...prev,
        sizeSqft: result.sizeSqft.toString()
      }));
      setImageUrls(prev => [...prev, result.usdzModelUrl]);
      hapticSuccess();
    } catch (e) {
      console.error(e);
      hapticError();
      alert("Failed to scan room.");
    } finally {
      setLoading(false);
    }
  };

  // Use Nominatim for Autocomplete (Optional future improvement)
  useEffect(() => {
    // We removed Google Maps to fix the grey error box.
    // Address can be typed manually for now or use 'Current Location'.
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 1) {
      if (navigator.geolocation) {
        if (!formData.address && !formData.lat) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Keyboard navigation for photo preview
  useEffect(() => {
    if (previewImage === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setPreviewImage(prev => prev !== null && prev > 0 ? prev - 1 : prev);
      } else if (e.key === "ArrowRight") {
        setPreviewImage(prev => prev !== null && prev < imageUrls.length - 1 ? prev + 1 : prev);
      } else if (e.key === "Escape") {
        setPreviewImage(null);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage, imageUrls.length]);

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
    hapticMedium();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    hapticTap();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Cloudinary handles uploading automatically now.

  const removeImage = (indexToRemove: number) => {
    hapticTap();
    setImageUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const setAsCover = (index: number) => {
    hapticMedium();
    setImageUrls(prev => {
      const newUrls = [...prev];
      const [moved] = newUrls.splice(index, 1);
      newUrls.unshift(moved);
      return newUrls;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    hapticMedium();
    setImageUrls(prev => {
      const newUrls = [...prev];
      const [moved] = newUrls.splice(draggedIndex, 1);
      newUrls.splice(dropIndex, 0, moved);
      return newUrls;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // handleFileSelect replaced by CldUploadWidget

  const submitForm = async () => {
    setLoading(true);
    setError("");
    
    const size = Math.abs(parseInt(formData.sizeSqft)) || 0;
    const priceM = Math.abs(parseFloat(formData.pricePerMonth)) || 0;
    const minD = Math.abs(parseInt(formData.minDuration)) || 1;
    const maxD = Math.abs(parseInt(formData.maxDuration)) || 12;

    if (size === 0 || priceM === 0) {
      setError("Size and Price per Month must be greater than 0.");
      setLoading(false);
      hapticError();
      setCurrentStep(0);
      return;
    }

    if (minD > maxD) {
      setError("Minimum duration cannot exceed maximum duration.");
      setLoading(false);
      hapticError();
      setCurrentStep(0);
      return;
    }

    try {
      const result = await createPropertyAction({
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType as "WAREHOUSE" | "FLEX" | "OFFICE",
        sizeSqft: size,
        pricePerHour: formData.pricePerHour ? Math.abs(parseFloat(formData.pricePerHour)) : undefined,
        pricePerDay: formData.pricePerDay ? Math.abs(parseFloat(formData.pricePerDay)) : undefined,
        pricePerMonth: priceM,
        minDuration: minD,
        maxDuration: maxD,
        durationUnit: formData.durationUnit,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        amenities: formData.amenities,
        imageUrls: imageUrls,
      });

      setLoading(false);

      if (result.success) {
        hapticSuccess();
        setSaveSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/owner");
        }, 1000);
      } else {
        hapticError();
        setError(result.error || "Something went wrong.");
      }
    } catch (err: any) {
      console.error("Crash during submitForm:", err);
      hapticError();
      setLoading(false);
      setError(err.message || "A critical error occurred while submitting.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      {/* Background artifacts */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#cbb4ff] opacity-20 rounded-full blur-[140px] mix-blend-screen animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-[25rem] h-[25rem] bg-teal-500 opacity-20 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">List Your Space</h1>
        <p className="text-gray-500 mt-1">Reach thousands of flex-occupancy tenants.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] rounded-full z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 backdrop-blur-md
                  ${isActive ? "bg-teal-500 border-teal-500 text-black shadow-md" : 
                    isCompleted ? "bg-teal-500 border-teal-500 text-black shadow-md" : "bg-white border-gray-300 text-gray-400"}`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-3 font-medium tracking-wide ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white/60 backdrop-blur-md shadow-sm border border-gray-200 rounded-3xl p-6 md:p-10 mb-8 min-h-[400px]">
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-6 text-sm font-medium border border-red-500/30 animate-elasticBounce">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-500/20 text-green-300 p-4 rounded-xl mb-6 text-sm font-medium border border-green-500/30 flex items-center gap-2 animate-elasticBounce">
            <CheckCircle2 className="w-5 h-5" /> Property listed successfully! Redirecting...
          </div>
        )}

        {/* STEP 1: DETAILS */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-staggerFadeUp">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Premium Flex Space in Downtown"
                className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select 
                  value={formData.propertyType}
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                >
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="FLEX">Flex Industrial</option>
                  <option value="OFFICE">Office</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Total Size (Sqft)</label>
                  <button 
                    type="button" 
                    onClick={handleLiDARScan}
                    className="text-xs flex items-center gap-1 text-teal-600 font-medium hover:underline bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20 active:scale-95 transition-transform"
                  >
                    <Camera className="w-3 h-3" /> Scan with LiDAR AR
                  </button>
                </div>
                <input 
                  type="number"
                  value={formData.sizeSqft}
                  onChange={(e) => setFormData({...formData, sizeSqft: e.target.value})}
                  placeholder="5000"
                  className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration Unit</label>
                <select 
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({...formData, durationUnit: e.target.value})}
                  className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                >
                  <option value="HOURS">Hours (Hourly)</option>
                  <option value="DAYS">Days (Daily)</option>
                  <option value="MONTHS">Months (Monthly)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min {formData.durationUnit.toLowerCase()}</label>
                  <input 
                    type="number"
                    value={formData.minDuration}
                    onChange={(e) => setFormData({...formData, minDuration: e.target.value})}
                    placeholder="1"
                    className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max {formData.durationUnit.toLowerCase()}</label>
                  <input 
                    type="number"
                    value={formData.maxDuration}
                    onChange={(e) => setFormData({...formData, maxDuration: e.target.value})}
                    placeholder="12"
                    className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price / Hour ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  placeholder="Optional"
                  className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price / Day ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                  placeholder="Optional"
                  className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price / Month ($)</label>
                <input 
                  type="number"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({...formData, pricePerMonth: e.target.value})}
                  placeholder="2500"
                  className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                placeholder="Describe the space, access hours, and suitability..."
                className="w-full w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Wi-Fi", "Loading Dock", "Forklift", "HVAC", "24/7 Access", "Security Cameras", "Meeting Rooms", "Parking"].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]">
                    <input 
                      type="checkbox" 
                      className="accent-[#b4e6ff] w-4 h-4"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        hapticTap();
                        if (e.target.checked) {
                          setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                        } else {
                          setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
                        }
                      }}
                    />
                    <span className="text-sm text-gray-900/90">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-staggerFadeUp">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Property Address</label>
                <button 
                  type="button" 
                  onClick={handleCurrentLocation}
                  className="text-xs flex items-center gap-1 text-teal-600 font-medium hover:underline bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20 active:scale-95 transition-transform"
                >
                  <Navigation className="w-3 h-3" /> Use Current Location
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Enter a location"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full min-h-[52px] bg-gray-50 border border-gray-300 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] px-4 transition-all duration-300 focus:border-teal-500/50 focus:shadow-[0_0_15px_rgba(180,230,255,0.2),inset_0_2px_4px_rgba(0,0,0,0.1)] outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-900/50 mt-2">
                Select an address from the dropdown to verify its location.
              </p>
            </div>
            
            <div className="h-64 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden relative shadow-sm">
              {formData.address && formData.address.length > 5 ? (
                <InteractiveMap 
                  lat={formData.lat || 0} 
                  lng={formData.lng || 0} 
                  address={formData.address} 
                  className="w-full h-full"
                />
              ) : (
                <div className="bg-gray-50 w-full h-full flex flex-col items-center justify-center">
                  <MapPin className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">Map Preview</p>
                  <p className="text-sm text-gray-400">Map will center on selected address</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: MEDIA — Enhanced HQ Photo Management */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-staggerFadeUp">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900">Upload Property Photos</h3>
              <p className="text-sm text-gray-500 mt-1">High-quality images increase inquiries by up to 40%.</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <span className={`text-sm font-semibold ${imageUrls.length >= MAX_IMAGES ? 'text-red-400' : 'text-teal-600'}`}>
                  {imageUrls.length}/{MAX_IMAGES} photos
                </span>
              </div>
            </div>
            
              <CldUploadWidget 
                signatureEndpoint="/api/sign-cloudinary"
                onSuccess={(result: any) => {
                  hapticSuccess();
                  setImageUrls(prev => [...prev, result.info.secure_url]);
                }}
                options={{
                  maxFiles: MAX_IMAGES - imageUrls.length,
                  multiple: true,
                  maxFileSize: 50000000, // 50MB
                  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'mp4', 'mov', 'webm'],
                  resourceType: 'auto'
                }}
              >
                {({ open }) => (
                  <div 
                    className="relative overflow-hidden border-2 border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300 ease-out bg-gray-50 hover:bg-teal-50 hover:border-teal-400"
                    onClick={(e) => {
                      e.preventDefault();
                      if (imageUrls.length >= MAX_IMAGES) {
                        hapticError();
                        alert(`Maximum ${MAX_IMAGES} media files allowed.`);
                        return;
                      }
                      open();
                    }}
                  >
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-gray-200 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                        <UploadCloud className="h-10 w-10 text-teal-600" strokeWidth={1.5} />
                      </div>
                      
                      <h4 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight group-hover:text-teal-700 transition-colors">
                        Click to Upload securely
                      </h4>
                      <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-4">
                        Supported formats: JPG, PNG, WEBP, MP4, MOV (Max 50MB per file)
                      </p>
                    </div>
                  </div>
                )}
              </CldUploadWidget>    

            
            {/* Image Grid with Drag and Drop */}
            {imageUrls.length > 0 && (
              <>
                <p className="text-xs text-gray-900/50 text-center">
                  Drag images to reorder • First image is the cover photo • Click to preview
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, idx) => (
                    <div 
                      key={`${url.slice(0, 30)}-${idx}`}
                      className={`aspect-square bg-white/5 rounded-xl border relative group overflow-hidden cursor-pointer transition-all duration-300
                        ${dragOverIndex === idx ? 'border-teal-500 bg-teal-500/10 scale-105' : 'border-white/10'}
                        ${draggedIndex === idx ? 'opacity-40 scale-95' : 'opacity-100'}
                      `}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setPreviewImage(idx)}
                    >
                      {url.match(/\\.(mp4|mov|webm)$/i) ? (
                        <video src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop playsInline onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
                      ) : (
                        <img src={url} alt={`Property media ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      
                      {/* Drag handle */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3 h-3 text-gray-900/70" />
                      </div>

                      {/* Remove button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 border border-white/10 hover:bg-red-500/20"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Set as Cover button */}
                      {idx !== 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAsCover(idx); }}
                          className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 hover:text-gray-900 border border-white/10 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:bg-teal-500/20"
                        >
                          <Star className="w-3 h-3" /> Cover
                        </button>
                      )}

                      {/* Cover badge */}
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 bg-teal-500/90 text-black text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-current" /> Cover
                        </span>
                      )}
                    </div>
                  ))}
                  
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: LEGAL */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-staggerFadeUp">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900">Occupancy Agreement</h3>
              <p className="text-sm text-gray-500 mt-1">Upload your standard agreement or use our digital template.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <label className="border-2 border-teal-500 bg-teal-500/5 rounded-2xl p-6 cursor-pointer relative hover:bg-teal-500/10 transition-colors">
                <div className="absolute top-4 right-4 bg-teal-500 text-black rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <FileText className="w-8 h-8 text-teal-600 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Occupyo Standard</h4>
                <p className="text-sm text-gray-500">Use our vetted, flexible occupancy agreement template. Recommended for fast onboarding.</p>
              </label>
              
              <label className="border border-gray-300 bg-white/5 rounded-2xl p-6 cursor-pointer hover:border-white/30 hover:bg-gray-200 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Custom Agreement</h4>
                <p className="text-sm text-gray-900/50 mb-4">Upload your own legal terms and conditions (PDF only).</p>
                <div className="glass-button-secondary text-xs !px-3 !py-2 text-center font-medium">
                  Upload PDF
                </div>
              </label>
            </div>

            <div className="bg-teal-500/10 border border-teal-500/20 p-5 rounded-2xl flex items-start gap-3 mt-6">
              <div className="bg-teal-500/20 text-teal-600 rounded-full p-1.5 mt-0.5 border border-teal-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-600">Stripe Connect Integration</p>
                <p className="text-xs text-gray-900/70 mt-1 leading-relaxed">Payments will be routed directly to your account. A 5% platform fee will be deducted automatically from successful bookings.</p>
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
          className="glass-button-secondary disabled:opacity-50 active:scale-95 transition-transform"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="glass-button flex items-center gap-2 disabled:opacity-70 active:scale-95 transition-transform"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {currentStep === STEPS.length - 1 ? "Publish Listing" : "Continue"}
        </button>
      </div>

      {/* HQ Photo Preview Modal with Navigation */}
      {previewImage !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-gray-900 hover:text-gray-300 bg-gray-200 backdrop-blur-md rounded-full p-2.5 border border-gray-300 hover:bg-white/20 transition-all z-10"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-6 left-6 text-gray-900/70 text-sm font-medium bg-gray-200 backdrop-blur-md px-4 py-2 rounded-full border border-gray-300 z-10">
            {previewImage + 1} / {imageUrls.length}
          </div>
          
          {/* Previous button */}
          {previewImage > 0 && (
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 bg-gray-200 backdrop-blur-md rounded-full p-3 border border-gray-300 hover:bg-white/20 transition-all z-10"
              onClick={(e) => { e.stopPropagation(); setPreviewImage(previewImage - 1); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {/* Next button */}
          {previewImage < imageUrls.length - 1 && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 bg-gray-200 backdrop-blur-md rounded-full p-3 border border-gray-300 hover:bg-white/20 transition-all z-10"
              onClick={(e) => { e.stopPropagation(); setPreviewImage(previewImage + 1); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {imageUrls[previewImage]?.match(/\\.(mp4|mov|webm)$/i) ? (
            <video 
              src={imageUrls[previewImage]} 
              controls
              autoPlay
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img 
              src={imageUrls[previewImage]} 
              alt={`HQ Preview ${previewImage + 1}`} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
