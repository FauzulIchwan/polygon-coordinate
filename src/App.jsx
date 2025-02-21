import { useState, useRef, useEffect, useCallback } from 'react';
import img1 from './assets/img1.jpg'; // ✅ Import gambar

const App = () => {
  const canvasRef = useRef(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image, setImage] = useState(null);

  // Load gambar hanya sekali
  useEffect(() => {
    const img = new Image();
    img.src = img1;
    img.onload = () => {
      setImage(img);
      setImageLoaded(true);
    };
  }, []);

  // Menggambar ulang canvas
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

    // Hitung skala agar gambar tetap proporsional
    const scaleX = width / image.width;
    const scaleY = height / image.height;
    const scale = Math.min(scaleX, scaleY);

    // Hitung posisi gambar agar tetap di tengah canvas
    const offsetX = (width - image.width * scale) / 2;
    const offsetY = (height - image.height * scale) / 2;

    // Gambar ulang canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);

    // Gambar titik-titik
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    polygonPoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(offsetX + x * scale, offsetY + y * scale, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Hubungkan titik-titik sebagai polygon
    if (polygonPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(offsetX + polygonPoints[0][0] * scale, offsetY + polygonPoints[0][1] * scale);
      polygonPoints.forEach(([x, y]) => ctx.lineTo(offsetX + x * scale, offsetY + y * scale));
      ctx.stroke();
    }
  }, [polygonPoints, imageLoaded, image]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Fungsi untuk menangani klik pada canvas
  const handleCanvasClick = (event) => {
    if (!canvasRef.current || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) * (image.width / rect.width));
    const y = Math.round((event.clientY - rect.top) * (image.height / rect.height));

    if (polygonPoints.length > 0) {
      const [startX, startY] = polygonPoints[0]; // Titik awal polygon
      const magnetRadius = 20; // Radius magnet dalam satuan koordinat asli gambar

      // Hitung jarak antara titik klik dan titik awal
      const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);

      // Jika dalam radius magnet, snap ke titik awal
      if (distance <= magnetRadius) {
        setPolygonPoints((prevPoints) => [...prevPoints, [startX, startY]]);
        return;
      }
    }

    // Jika tidak dalam radius magnet, tambahkan titik baru
    setPolygonPoints((prevPoints) => [...prevPoints, [x, y]]);
  };

  console.log(polygonPoints);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} onClick={handleCanvasClick} className="border border-gray-400 cursor-crosshair" />

      <button onClick={() => setPolygonPoints([])} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">
        Reset
      </button>

      <pre className="bg-gray-200 p-4 rounded-md">{JSON.stringify({ polygon_points: polygonPoints }, null, 4)}</pre>
    </div>
  );
};

export default App;
