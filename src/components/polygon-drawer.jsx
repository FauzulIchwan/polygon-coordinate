import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiCopy, FiRefreshCw } from "react-icons/fi";
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
        <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Image Annotation Studio
                </h1>
                <p className="mt-2 text-gray-600">Precision polygon annotation tool</p>
            </header>

            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 border border-gray-100">
                {/* Left Section */}
                <div className="flex-1">
                    <div className="mb-6">
                        <ImageUpload onImageSelect={handleImageSelect} />
                    </div>

                    <div className="relative group">
                        <canvas
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            className={`w-full h-auto rounded-xl transition-all duration-300 ${image
                                    ? "border-2 border-blue-100 shadow-sm cursor-crosshair hover:border-blue-200"
                                    : "border-2 border-dashed border-gray-200 hover:border-blue-200 bg-gradient-to-br from-gray-50 to-gray-100"
                                } ${isPolygonClosed && "border-green-100 cursor-auto"
                                }`}
                        />

                        {!image && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">Upload or drop an image to begin</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            onClick={handleReset}
                            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 transform hover:scale-[1.02]"
                        >
                            <FiRefreshCw className="w-5 h-5" />
                            Reset Canvas
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="md:w-96 flex flex-col gap-4">
                    <div className="bg-gradient-to-b from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    Annotation Details
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {points.length} points
                                    </span>
                                </h3>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg border border-gray-200 transition-all tooltip"
                                data-tooltip="Copy Coordinates"
                            >
                                <FiCopy className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative">
                            <pre className="text-sm bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto max-h-svh font-mono shadow-inner">
                                {JSON.stringify(
                                    { polygon_points: points.map((p) => [Math.round(p.x), Math.round(p.y)]) },
                                    null, 2
                                )}
                            </pre>
                            <div className="absolute bottom-2 right-2 bg-gradient-to-b from-white to-gray-50 p-1 rounded"></div>
                        </div>

                        {isPolygonClosed ? (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 animate-fade-in">
                                <FiCheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">
                                    Polygon successfully closed
                                </span>
                            </div>
                        ) : (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-sm text-blue-700">
                                    {points.length > 0
                                        ? `Click near first point to close polygon`
                                        : `Click on image to start drawing`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Status */}
            {isPolygonClosed && (
                <div className="fixed bottom-6 right-6 p-4 bg-white rounded-lg shadow-lg border border-green-100 flex items-center gap-2 animate-slide-up">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                        <p className="font-medium text-gray-800">Annotation Complete</p>
                        <p className="text-sm text-gray-600">Coordinates copied to clipboard</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolygonDrawer;
