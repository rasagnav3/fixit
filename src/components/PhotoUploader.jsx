import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, UploadCloud, AlertCircle } from 'lucide-react';
import { uploadService } from '../services/uploadService';

export function PhotoUploader({
  onImageSelected,
  onImageCleared,
  currentPreviewUrl = null,
  label = 'Attach Photo Evidence',
  helperText = 'Take a clear photo of the leak or damage (Max 5MB).'
}) {
  const [preview, setPreview] = useState(currentPreviewUrl);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      uploadService.validateImage(file);
      setError(null);

      // Create preview object URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelected(file, objectUrl);
    } catch (err) {
      setError(err.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageCleared) onImageCleared();
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      
      {/* Hidden native input with capture="environment" for camera on mobile */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--slate-300)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-400)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--slate-300)'}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '0.75rem',
            color: 'var(--primary-600)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={22} />
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadCloud size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
            Take a photo or choose from library
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
            {helperText}
          </div>
        </div>
      ) : (
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--slate-200)',
          maxHeight: '320px',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#000000'
        }}>
          <img
            src={preview}
            alt="Upload preview"
            style={{
              maxWidth: '100%',
              maxHeight: '320px',
              objectFit: 'contain'
            }}
          />
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            title="Remove photo"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', color: 'var(--danger-600)', fontSize: '0.8125rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;
