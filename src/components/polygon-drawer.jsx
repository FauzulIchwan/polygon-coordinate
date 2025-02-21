import { useState, useRef, useEffect, useCallback } from "react";
import { ImageUpload } from "./image-upload";

const PolygonDrawer = () => {
    const [image, setImage] = useState(null);
    const [points, setPoints] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPolygonClosed, setIsPolygonClosed] = useState(false);
    const canvasRef = useRef(null);

    const drawImageAndPolygon = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (image) {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                drawPolygon(ctx);
            };
            img.src = image;
        } else {
            drawPolygon(ctx);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [image, points]);

    useEffect(() => {
        drawImageAndPolygon();
    }, [points, drawImageAndPolygon]);

    const drawPolygon = (ctx) => {
        if (points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach((point) => ctx.lineTo(point.x, point.y));
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.stroke();

            points.forEach((point, index) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = index === 0 && isDrawing ? "#ef4444" : "#2563eb";
                ctx.fill();
            });
        }
    };

    const handleCanvasClick = (e) => {
        if (!image || isPolygonClosed) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const canvas = canvasRef.current;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (isDrawing && points.length > 0) {
            const firstPoint = points[0];
            const distance = Math.sqrt((x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2);
            if (distance < 15) {
                setPoints((prev) => [...prev, prev[0]]);
                setIsDrawing(false);
                setIsPolygonClosed(true);
                return;
            }
        }

        if (!isDrawing) setIsDrawing(true);
        setPoints((prev) => [...prev, { x, y }]);
    };

    const handleReset = () => {
        setPoints([]);
        setIsDrawing(false);
        setIsPolygonClosed(false);
    };

    const handleImageSelect = (croppedImageData) => {
        setImage(croppedImageData);
        setPoints([]);
        setIsPolygonClosed(false);
    };

    const copyToClipboard = () => {
        const data = JSON.stringify(
            { polygon_points: points.map((p) => [Math.round(p.x), Math.round(p.y)]) },
            null, 2
        );
        navigator.clipboard.writeText(data);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 min-h-screen flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">Image Annotation</h1>

            <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-6">
                {/* Left Section - Image Upload and Canvas */}
                <div className="flex-1">
                    <ImageUpload onImageSelect={handleImageSelect} />

                    <div className="relative mt-4 border-2 rounded-lg">
                        <canvas
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            className={`w-full h-auto transition-all duration-300 rounded-lg ${image ? "border-blue-300 cursor-crosshair" : "border-dashed border-gray-300"
                                } ${isPolygonClosed && "cursor-not-allowed opacity-70"}`}
                        />

                        {!image && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                <p className="text-gray-500 font-medium">Upload an image to start drawing</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex justify-center gap-3">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Right Section - Coordinates and Copy Button */}
                <div className="md:w-80 flex flex-col gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-md">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Coordinates ({points.length})
                            </h3>
                            <button
                                onClick={copyToClipboard}
                                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
                            >
                                Copy
                            </button>
                        </div>

                        <pre className="text-sm bg-white p-3 rounded-md border border-gray-200 overflow-x-auto max-h-64">
                            {JSON.stringify(
                                { polygon_points: points.map((p) => [Math.round(p.x), Math.round(p.y)]) },
                                null, 2
                            )}
                        </pre>

                        {isPolygonClosed && (
                            <p className="mt-3 text-sm text-green-600 font-medium">
                                ✔ Polygon closed
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolygonDrawer;
