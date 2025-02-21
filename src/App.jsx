import { useState, useRef, useEffect, useCallback } from 'react';
import img1 from './assets/img1.jpg';

const App = () => {
  const canvasRef = useRef(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = img1;
    img.onload = () => {
      setImage(img);
      setImageLoaded(true);
    };
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    const scaleX = width / image.width;
    const scaleY = height / image.height;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - image.width * scale) / 2;
    const offsetY = (height - image.height * scale) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    polygonPoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(offsetX + x * scale, offsetY + y * scale, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    if (polygonPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(offsetX + polygonPoints[0][0] * scale, offsetY + polygonPoints[0][1] * scale);
      polygonPoints.forEach(([x, y]) => {
        ctx.lineTo(offsetX + x * scale, offsetY + y * scale);
      });
      ctx.stroke();
    }

    if (!isCompleted && mousePos && polygonPoints.length > 0) {
      const lastPoint = polygonPoints[polygonPoints.length - 1];
      let previewX = mousePos.x;
      let previewY = mousePos.y;

      if (polygonPoints.length >= 3) {
        const [startX, startY] = polygonPoints[0];
        const magnetRadius = 30;
        const distance = Math.sqrt((mousePos.x - startX) ** 2 + (mousePos.y - startY) ** 2);
        if (distance < magnetRadius) {
          previewX = startX;
          previewY = startY;
        }
      }

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(offsetX + lastPoint[0] * scale, offsetY + lastPoint[1] * scale);
      ctx.lineTo(offsetX + previewX * scale, offsetY + previewY * scale);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [polygonPoints, imageLoaded, image, mousePos, isCompleted]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = (event) => {
    if (!canvasRef.current || !image || isCompleted) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) * (image.width / rect.width));
    const y = Math.round((event.clientY - rect.top) * (image.height / rect.height));

    // Magnet
    if (polygonPoints.length > 0) {
      const [startX, startY] = polygonPoints[0];
      const magnetRadius = 30;
      const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);

      if (distance <= magnetRadius && polygonPoints.length >= 3) {
        setPolygonPoints((prev) => [...prev, [startX, startY]]);
        setIsCompleted(true);
        return;
      }
    }
    setPolygonPoints((prev) => [...prev, [x, y]]);
  };

  // Line Preview
  const handleMouseMove = (event) => {
    if (!canvasRef.current || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) * (image.width / rect.width));
    const y = Math.round((event.clientY - rect.top) * (image.height / rect.height));
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="border border-gray-400 cursor-crosshair" />

      <button
        onClick={() => {
          setPolygonPoints([]);
          setIsCompleted(false);
        }}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
      >
        Reset
      </button>

      <pre className="bg-gray-200 p-4 rounded-md">
        {'polygon_points: ['}
        {polygonPoints.map((point, index) => (
          <>
            {JSON.stringify(point)}
            {index < polygonPoints.length - 1 && ', '}
            {(index + 1) % 4 === 0 && <br />}
          </>
        ))}
        {']'}
      </pre>
    </div>
  );
};

export default App;
