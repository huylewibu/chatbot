import React, { useState } from "react";
import '../pages/ChatDetail.css';

interface ImageUploaderProps {
    onImageSelected: (base64: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleRemoveImage = () => {
        setImagePreview(null);
        onImageSelected(null);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result?.toString().split(',')[1]; // Lấy phần Base64
                const fullBase64String = `data:${file.type};base64,${base64String}`;
                onImageSelected(fullBase64String || null);
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                onImageSelected(null);
            };
            reader.readAsDataURL(file);

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    return (
        <>
            <label htmlFor="image-upload" className="cursor-pointer absolute z-[500]"
                style={{top: "-1.25rem", right: "7.75rem"}}
            >
                {/* Biểu tượng upload */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500 hover:text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>
            </label>
            <input
                type="file"
                accept="image/*"
                id="image-upload"
                style={{ display: "none" }}
                onChange={handleImageUpload} // Xử lý upload ảnh
            />
            {imagePreview && (
                <div className="image-preview">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-[120px] object-contain rounded-lg shadow-lg"
                    />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                        X
                    </button>
                </div>
            )}

        </>
    );
};

export default ImageUploader;
