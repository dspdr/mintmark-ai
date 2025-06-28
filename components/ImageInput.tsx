import React, { useRef, useState, useCallback } from 'react';
import { ImageType } from '../types';
import { CameraIcon, UploadIcon } from '../constants';
import { useTranslations } from '../contexts/LanguageContext';

interface ImageInputProps {
  id: string;
  label: string; // Label will be passed already translated from App.tsx
  imageType: ImageType;
  onImageSelect: (file: File, type: ImageType, previewUrl: string) => void;
  currentPreviewUrl: string | null;
}

const ImageInput: React.FC<ImageInputProps> = ({ id, label, imageType, onImageSelect, currentPreviewUrl }) => {
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t.imageInputFileTooLargeError);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(t.imageInputInvalidFileTypeError);
        return;
      }
      setError(null);
      const previewUrl = URL.createObjectURL(file);
      onImageSelect(file, imageType, previewUrl);
    }
  }, [onImageSelect, imageType, t]);

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCameraInput = () => cameraInputRef.current?.click();

  return (
    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{label}</label>
      {currentPreviewUrl ? (
        <div className="mb-2 h-48 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <img src={currentPreviewUrl} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-500">
          {t.imageInputNoImage}
        </div>
      )}
      <div className="mt-2 flex space-x-2">
        <button
          type="button"
          onClick={triggerFileInput}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UploadIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          {t.imageInputUpload}
        </button>
        <input
          type="file"
          id={`${id}-file`}
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
        <button
          type="button"
          onClick={triggerCameraInput}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <CameraIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          {t.imageInputCapture}
        </button>
        <input
          type="file"
          id={`${id}-camera`}
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      </div>
       {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default ImageInput;