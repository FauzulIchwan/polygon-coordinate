import { useState, useRef, useEffect, useCallback } from 'react';
import img1 from './assets/img1.jpg';

const App = () => {
  const canvasRef = useRef(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load default image dari assets
  useEffect(() => {
    const img = new Image();
    img.src = img1;
    img.onload = () => {
      setImage(img);
      setImageLoaded(true);
    };
  }, []);

  // Fitur upload image: reset polygon jika gambar baru di-upload
  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImageLoaded(false);
      const file = event.target.files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImage(img);
        setImageLoaded(true);
        setPolygonPoints([]);
        setIsCompleted(false);
        URL.revokeObjectURL(url);
      };
    }
  };

  // Fungsi menggambar ulang canvas (gambar, titik, polygon, dan preview garis)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ukuran canvas tetap
    const width = 600;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Hitung skala agar gambar tidak terdistorsi dan ditempatkan di tengah canvas
    const scaleX = width / image.width;
    const scaleY = height / image.height;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (width - image.width * scale) / 2;
    const offsetY = (height - image.height * scale) / 2;

    // Gambar ulang background dan gambar
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);

    // Gambar titik-titik polygon
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    polygonPoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(offsetX + x * scale, offsetY + y * scale, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Hubungkan titik-titik sebagai polygon jika ada lebih dari 1 titik
    if (polygonPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(offsetX + polygonPoints[0][0] * scale, offsetY + polygonPoints[0][1] * scale);
      polygonPoints.forEach(([x, y]) => {
        ctx.lineTo(offsetX + x * scale, offsetY + y * scale);
      });
      ctx.stroke();
    }

    // Preview garis (efek pen tool) dari titik terakhir ke posisi pointer
    if (!isCompleted && mousePos && polygonPoints.length > 0) {
      const lastPoint = polygonPoints[polygonPoints.length - 1];
      let previewX = mousePos.x;
      let previewY = mousePos.y;

      // Jika ada minimal 3 titik, periksa apakah pointer mendekati titik awal (efek magnet)
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
      ctx.setLineDash([5, 5]); // garis putus-putus
      ctx.moveTo(offsetX + lastPoint[0] * scale, offsetY + lastPoint[1] * scale);
      ctx.lineTo(offsetX + previewX * scale, offsetY + previewY * scale);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]); // reset dash
    }
  }, [polygonPoints, imageLoaded, image, mousePos, isCompleted]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Tangani klik pada canvas untuk menambahkan titik polygon
  const handleCanvasClick = (event) => {
    if (!canvasRef.current || !image || isCompleted) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) * (image.width / rect.width));
    const y = Math.round((event.clientY - rect.top) * (image.height / rect.height));

    // Efek magnet: jika klik dekat titik awal dan sudah ada minimal 3 titik,
    // maka seleksi dianggap selesai.
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

  // Update posisi pointer untuk preview garis
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

  // Fitur Save JSON: download file JSON jika seleksi selesai
  const handleSaveJSON = () => {
    const data = JSON.stringify({ polygon_points: polygonPoints }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polygon_points.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fungsi Undo: hapus titik terakhir
  const handleUndo = () => {
    setPolygonPoints((prev) => {
      if (prev.length === 0) return prev;
      const newPoints = [...prev];
      newPoints.pop();
      setIsCompleted(false);
      return newPoints;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Fitur upload image */}

      <canvas ref={canvasRef} onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="border border-gray-400 cursor-crosshair" />

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-auto text-gray-500 font-medium text-sm bg-gray-100 file:cursor-pointer file:border-0 file:py-2 file:px-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
        />
        <button onClick={handleUndo} className="px-4 py-2 text-white rounded-md bg-gray-800 hover:bg-gray-700" title="Undo">
          ↶
        </button>
        <button
          onClick={() => {
            setPolygonPoints([]);
            setIsCompleted(false);
          }}
          className="px-4 py-2 text-white rounded-md bg-gray-800 hover:bg-gray-700"
        >
          Reset
        </button>
        {isCompleted && (
          <button onClick={handleSaveJSON} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700">
            Save JSON
          </button>
        )}
      </div>

      <pre className="bg-gray-200 p-4 rounded-md">
        {'polygon_points: ['}
        {polygonPoints.map((point, index) => (
          <span key={index}>
            {JSON.stringify(point)}
            {index < polygonPoints.length - 1 && ', '}
            {(index + 1) % 4 === 0 && <br />}
          </span>
        ))}
        {']'}
      </pre>
    </div>
  );
};

export default App;
