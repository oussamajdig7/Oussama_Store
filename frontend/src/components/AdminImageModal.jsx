import { useState, useEffect, useRef } from 'react';
import adminService from '../services/adminService';
import { getFullImageUrl } from '../utils/imageUrl';

export const AdminImageModal = ({ product, isOpen, onClose, onImagesUpdated }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Selected files for preview before upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Load product images on modal open
  useEffect(() => {
    if (isOpen && product) {
      fetchImages();
      setSelectedFiles([]);
      setPreviews([]);
      setError(null);
      setSuccessMsg('');
    }
  }, [isOpen, product]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getProductImages(product.id);
      setImages(res.data || []);
    } catch (err) {
      console.error('Failed to load product images:', err);
      setError(err.userMessage || 'Failed to load product images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Allowed types check
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles = [];
    const invalidNames = [];

    files.forEach((file) => {
      if (allowed.includes(file.type.toLowerCase())) {
        validFiles.push(file);
      } else {
        invalidNames.push(file.name);
      }
    });

    if (invalidNames.length > 0) {
      setError(`Some files were rejected because only JPEG, PNG, and WEBP are allowed: ${invalidNames.join(', ')}`);
    } else {
      setError(null);
    }

    // Limit to 5 files
    const combined = [...selectedFiles, ...validFiles].slice(0, 5);
    setSelectedFiles(combined);

    // Generate blob preview URLs
    const newPreviews = combined.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2), // MB
      isOversized: f.size > 5 * 1024 * 1024,
    }));
    setPreviews(newPreviews);
  };

  const removeSelectedFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    // Revoke object URL to avoid memory leak
    if (previews[index]?.url) {
      URL.revokeObjectURL(previews[index].url);
    }
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (!selectedFiles.length) return;

    // Check if any file exceeds 5MB
    const hasOversized = selectedFiles.some((f) => f.size > 5 * 1024 * 1024);
    if (hasOversized) {
      setError('One or more selected files exceed the 5MB size limit. Please remove them.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccessMsg('');

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await adminService.uploadProductImages(product.id, formData);
      if (res.success && res.data) {
        const newImages = [...images, ...res.data];
        setImages(newImages);
        setSuccessMsg(`${res.data.length} image(s) uploaded successfully!`);
        setSelectedFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImagesUpdated) onImagesUpdated(product.id, newImages);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.userMessage || 'Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setDeletingId(imageId);
      setError(null);
      const res = await adminService.deleteProductImage(product.id, imageId);
      if (res.success) {
        const updated = images.filter((img) => img.id !== imageId);
        setImages(updated);
        setSuccessMsg('Image deleted successfully.');
        if (onImagesUpdated) onImagesUpdated(product.id, updated);
      }
    } catch (err) {
      console.error('Delete image failed:', err);
      setError(err.userMessage || 'Failed to delete product image');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Manage Product Images</span>
                <span className="text-indigo-400 font-mono text-xs">#{product.id}</span>
              </h3>
              <p className="text-slate-400 text-xs truncate max-w-md">
                {product.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Feedback Alerts */}
        <div className="shrink-0 mt-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-3 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
                &times;
              </button>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-3 flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-2">
          {/* Section 1: Upload Zone */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Upload New Images
            </span>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-900/50 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelection}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-white">
                Click to browse or drop images here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports JPEG, PNG, WEBP &bull; Max 5MB per file &bull; Up to 5 images
              </p>
            </div>

            {/* Pre-Upload Client Previews */}
            {previews.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Selected for upload ({previews.length}):</span>
                  <button
                    onClick={() => {
                      setSelectedFiles([]);
                      setPreviews([]);
                    }}
                    className="text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {previews.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-slate-700 bg-slate-900 overflow-hidden group/item p-1"
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="mt-1 px-1">
                        <div className="text-[10px] font-mono text-slate-300 truncate" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">
                          {item.size} MB
                        </div>
                      </div>

                      {item.isOversized && (
                        <span className="absolute top-2 left-2 bg-rose-950 text-rose-300 border border-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded">
                          &gt; 5MB
                        </span>
                      )}

                      <button
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUploadSubmit}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Confirm & Upload {selectedFiles.length} File(s)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Current Images Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Current Gallery ({images.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                First image acts as primary cover
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs animate-pulse">
                Loading product gallery...
              </div>
            ) : images.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No images stored for this product yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => {
                  const fullUrl = getFullImageUrl(img.image_url);
                  const isDeleting = deletingId === img.id;

                  return (
                    <div
                      key={img.id}
                      className="relative rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden group shadow-md"
                    >
                      <div className="w-full h-32 bg-slate-950 flex items-center justify-center p-1">
                        <img
                          src={fullUrl}
                          alt={`Product ${product.id} image ${idx + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x400?text=Missing+File';
                          }}
                        />
                      </div>

                      {/* Header indicators */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white shadow-xs">
                            COVER
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-slate-300 backdrop-blur-xs">
                          #{img.id}
                        </span>
                      </div>

                      {/* Action buttons on hover */}
                      <div className="absolute top-2 right-2">
                        <button
                          disabled={isDeleting}
                          onClick={() => handleDeleteImage(img.id)}
                          title="Delete image"
                          className="w-7 h-7 rounded-lg bg-black/70 hover:bg-rose-600 text-rose-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Image path footer */}
                      <div className="p-2 border-t border-slate-800/80 bg-slate-900/90">
                        <div className="text-[10px] font-mono text-slate-400 truncate" title={img.image_url}>
                          {img.image_url}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 shrink-0 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Phase 13: Local SQLite & Multer Storage
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminImageModal;
