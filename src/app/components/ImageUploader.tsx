/* eslint-disable @typescript-eslint/no-unused-vars */

import React from "react";
import '../pages/ChatDetail.css';
import { toast } from "react-toastify";

export const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    onImageSelected: (base64Images: string[]) => void,
    setImagePreview: (previewUrls: string[]) => void
) => {
    const files = event.target.files
    if (files && files.length > 0) {
        const base64Images: string[] = [];
        const previewUrls: string[] = [];

        Array.from(files).forEach((file) => {
            const reader = new FileReader();

            reader.onload = () => {
                const base64String = reader.result?.toString().split(',')[1]; // Lấy phần Base64
                const fullBase64String = `data:${file.type};base64,${base64String}`;
                base64Images.push(fullBase64String);
                
                const previewUrl = URL.createObjectURL(file);
                previewUrls.push(previewUrl);

                // Nếu đã xử lý hết các tệp tin, gọi callback
                if (base64Images.length === files.length) {
                    onImageSelected(base64Images); // Gửi mảng base64 lên cha
                    setImagePreview(previewUrls); // Cập nhật preview
                }

            };
            reader.onerror = (error) => {
                toast.error(`Lỗi khi tải ảnh: ${error}`);
            };
            reader.readAsDataURL(file);
        })

    }
};
