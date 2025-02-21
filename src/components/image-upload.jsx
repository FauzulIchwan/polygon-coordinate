import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export function ImageUpload({ onImageSelect }) {
    const [image, setImage] = useState(null);
    const cropperRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Get the first file only
        if (file) {
            const newImage = {
                original: URL.createObjectURL(file),
                name: file.name,
            };
            setImage(newImage);
        }
    };

    const handleCropComplete = useCallback(() => {
        if (cropperRef.current && cropperRef.current.cropper) {
            const croppedImageData = cropperRef.current.cropper.getCroppedCanvas()?.toDataURL();
            if (croppedImageData) {
                onImageSelect(croppedImageData); // Pass to parent
                setImage(null); // Close the cropping modal
            }
        }
    }, [onImageSelect]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Upload and Crop Image</h2>
            <div className="mb-4 flex justify-center">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
                    {image ? "Change Image" : "Upload Image"}
                </button>
            </div>

            {image && (
                <div className="relative rounded-lg overflow-hidden shadow-lg mb-4">
                    <img src={image.original} alt={image.name} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button className="bg-white text-gray-800 px-4 py-2 rounded-lg" onClick={handleCropComplete}>
                            Crop
                        </button>
                    </div>
                </div>
            )}

            {image && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                        <h3 className="text-xl font-semibold mb-4">Crop Image</h3>
                        <Cropper
                            src={image.original}
                            style={{ height: 300, width: "100%" }}
                            initialAspectRatio={1}
                            guides={false}
                            ref={cropperRef}
                        />
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setImage(null)} className="px-4 py-2 bg-gray-300 rounded-lg mr-2 hover:bg-gray-400 transition duration-300">
                                Cancel
                            </button>
                            <button onClick={handleCropComplete} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
                                Complete Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

ImageUpload.propTypes = {
    onImageSelect: PropTypes.func.isRequired,
};