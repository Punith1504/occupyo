"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, FileText, Building2, CheckCircle2, Loader2, UploadCloud, PlusCircle, X, Navigation, Star, ChevronLeft, ChevronRight, GripVertical, Image as ImageIcon } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { updatePropertyAction } from "../../actions";

import PredictiveAddressInput from "@/components/PredictiveAddressInput";
import InteractiveMap from "@/components/InteractiveMap";
import { hapticTap, hapticMedium, hapticSuccess, hapticError } from "@/lib/haptics";

const STEPS = [
  { id: "details", title: "Details", icon: Building2 },
  { id: "media", title: "Media", icon: Camera },
];

const MAX_IMAGES = 20;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditPropertyClient({ property, initialImages }: { property: any, initialImages: any[] }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<number | null>(null);
  
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages.map(img => img.url));
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      const result = await updatePropertyAction(property.id, {
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
        // Auto-redirect removed to allow user to choose their next action
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
        <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#cbb4ff] opacity-8 rounded-full blur-[140px] mix-blend-screen animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-[25rem] h-[25rem] bg-[#b4e6ff] opacity-6 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Your Space</h1>
        <p className="text-white/60 mt-1">Update the details for this property.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#b4e6ff] shadow-[0_0_15px_#b4e6ff] rounded-full z-0 transition-all duration-500"
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
                  ${isActive ? "bg-[#b4e6ff] border-[#b4e6ff] text-black shadow-[var(--neon-glow)]" : 
                    isCompleted ? "bg-[#b4e6ff] border-[#b4e6ff] text-black shadow-[var(--neon-glow)]" : "bg-black/50 border-white/20 text-white/40"}`}
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

      <div className="liquid-glass p-6 md:p-10 mb-8 min-h-[400px]">
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-6 text-sm font-medium border border-red-500/30 animate-elasticBounce">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="flex flex-col items-center justify-center py-12 animate-scaleIn min-h-[400px]">
            <div className="bg-[#b4e6ff]/20 p-4 rounded-full border border-[#b4e6ff]/30 mb-6 shadow-[0_0_30px_#b4e6ff40] pulse-ring">
              <CheckCircle2 className="w-16 h-16 text-[#b4e6ff]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Property Updated</h2>
            <p className="text-white/60 mb-10 text-center text-lg">Your changes have been saved successfully.</p>
            <div className="flex gap-4 w-full max-w-sm">
              <button 
                onClick={() => { hapticTap(); router.push("/dashboard/owner"); }}
                className="glass-button flex-1 px-6"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => { hapticTap(); setSaveSuccess(false); setCurrentStep(0); }}
                className="glass-button-secondary flex-1 px-6"
              >
                Edit More
              </button>
            </div>
          </div>
        )}

        {!saveSuccess && (
          <>
            {/* STEP 1: DETAILS */}
            {currentStep === 0 && (
          <div className="space-y-6 animate-staggerFadeUp">
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
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 active:scale-[0.98]">
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
                    <span className="text-sm text-white/90">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MEDIA — Enhanced HQ Photo Management */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-staggerFadeUp">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white">Upload Property Photos</h3>
              <p className="text-sm text-white/60 mt-1">High-quality images increase inquiries by up to 40%.</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <ImageIcon className="w-4 h-4 text-white/40" />
                <span className={`text-sm font-semibold ${imageUrls.length >= MAX_IMAGES ? 'text-red-400' : 'text-[#b4e6ff]'}`}>
                  {imageUrls.length}/{MAX_IMAGES} photos
                </span>
              </div>
            </div>
            
            {/* Upload Dropzone */}
            {/* Upload Dropzone (Cloudinary Premium UI) */}
            {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-red-500/30 rounded-2xl bg-red-500/5 backdrop-blur-md shadow-2xl">
                <UploadCloud className="w-12 h-12 text-red-400 mb-4 animate-pulse" />
                <h3 className="text-lg font-medium text-red-200">Cloudinary Configuration Missing</h3>
                <p className="text-red-300/70 text-sm text-center max-w-sm mt-2 leading-relaxed">
                  Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables to enable premium media uploads.
                </p>
              </div>
            ) : (
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "occupyo_preset"}
                options={{
                  multiple: true,
                  maxFiles: MAX_IMAGES - imageUrls.length,
                  clientAllowedFormats: ["image", "video"],
                }}
                onSuccess={(result: any) => {
                  hapticSuccess();
                  if (result?.info?.secure_url) {
                    setImageUrls(prev => [...prev, result.info.secure_url]);
                  }
                }}
                onError={() => {
                  hapticError();
                  alert("Failed to upload media via Cloudinary");
                }}
              >
                {({ open }) => (
                  <div 
                    className="relative overflow-hidden border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 ease-out hover:shadow-[0_20px_40px_-15px_rgba(180,230,255,0.15)] hover:border-[#b4e6ff]/40 bg-gradient-to-b from-white/[0.03] to-white/[0.01] hover:from-[#b4e6ff]/[0.08] hover:to-transparent backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
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
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#b4e6ff]/0 via-[#b4e6ff]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-gradient-to-br from-white/10 to-white/5 p-5 rounded-2xl mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_20px_rgba(0,0,0,0.4)] border border-white/10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        <UploadCloud className="h-10 w-10 text-[#b4e6ff] drop-shadow-[0_0_15px_rgba(180,230,255,0.5)] group-hover:animate-pulse" strokeWidth={1.5} />
                      </div>
                      
                      <h4 className="text-xl font-semibold text-white mb-2 tracking-tight group-hover:text-[#b4e6ff] transition-colors duration-300">
                        Upload Property Media
                      </h4>
                      <p className="text-sm text-white/50 mb-8 max-w-sm leading-relaxed">
                        Click to securely upload your high-resolution photos or videos via Cloudinary.
                      </p>
                      
                      <div className="relative group/btn">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#b4e6ff] to-[#cbb4ff] rounded-full blur opacity-30 group-hover/btn:opacity-70 transition duration-500"></div>
                        <button 
                          className="relative flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-full text-sm font-medium border border-white/10 group-hover/btn:border-white/20 transition-all duration-300 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-95"
                          onPointerDown={hapticTap}
                          type="button"
                        >
                          <UploadCloud className="w-4 h-4 text-[#b4e6ff]" /> Browse Files
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            )}
            
            {/* Image Grid with Drag and Drop */}
            {imageUrls.length > 0 && (
              <>
                <p className="text-xs text-white/50 text-center">
                  Drag images to reorder • First image is the cover photo • Click to preview
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, idx) => (
                    <div 
                      key={`${url.slice(0, 30)}-${idx}`}
                      className={`aspect-square bg-white/5 rounded-xl border relative group overflow-hidden cursor-pointer transition-all duration-300
                        ${dragOverIndex === idx ? 'border-[#b4e6ff] bg-[#b4e6ff]/10 scale-105' : 'border-white/10'}
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
                      <img src={url} alt={`Property photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      
                      {/* Drag handle */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3 h-3 text-white/70" />
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
                          className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-[#b4e6ff] hover:text-white border border-white/10 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:bg-[#b4e6ff]/20"
                        >
                          <Star className="w-3 h-3" /> Cover
                        </button>
                      )}

                      {/* Cover badge */}
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 bg-[#b4e6ff]/90 text-black text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-lg">
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
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      {!saveSuccess && (
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
            {currentStep === STEPS.length - 1 ? "Save Changes" : "Continue"}
          </button>
        </div>
      )}

      {/* HQ Photo Preview Modal with Navigation */}
      {previewImage !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 bg-white/10 backdrop-blur-md rounded-full p-2.5 border border-white/20 hover:bg-white/20 transition-all z-10"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-6 left-6 text-white/70 text-sm font-medium bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 z-10">
            {previewImage + 1} / {imageUrls.length}
          </div>
          
          {/* Previous button */}
          {previewImage > 0 && (
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20 hover:bg-white/20 transition-all z-10"
              onClick={(e) => { e.stopPropagation(); setPreviewImage(previewImage - 1); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {/* Next button */}
          {previewImage < imageUrls.length - 1 && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20 hover:bg-white/20 transition-all z-10"
              onClick={(e) => { e.stopPropagation(); setPreviewImage(previewImage + 1); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <img 
            src={imageUrls[previewImage]} 
            alt={`HQ Preview ${previewImage + 1}`} 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
