import React, { useState, useRef } from "react";
import { Stage, Layer, Image, Line } from "react-konva";
import './App.css'

function App() {
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  //input file
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImage(img);
      };
    }
  };

  // klik titik polygon
  const handleCanvasClick = (e) => {
    if (!image) return; // Jika belum ada gambar, jangan lanjut
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    if (pointerPosition) {
      setPolygonPoints([...polygonPoints, [pointerPosition.x, pointerPosition.y]]);
    }
    console.log(polygonPoints);
  };
  return (
    <div className="w-screen h-screen flex ">
      <div className="p-4 w-full justify-center flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2 text-center">Anotasi Gambar</h2>
        {/* Input untuk upload gambar */}
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef} 
          className="file-input file-input-bordered file-input-accent w-full max-w-xs mb-5" />

        {/* Canvas untuk anotasi */}
        <div className="flex-grow">
          <Stage width={800} height={600} onClick={handleCanvasClick} className="border border-gray-300">
            <Layer>
              {image && <Image image={image} width={800} height={600} />}
              <Line
                points={polygonPoints.flat()} // Konversi ke format Konva
                stroke="red"
                strokeWidth={2}
                closed={polygonPoints.length > 2} // Tutup polygon jika titik lebih dari 2
              />
            </Layer>
          </Stage>
        </div>

        {/* Hasil koordinat */}
        <div className="mt-4 text-wrap w-full">
          <h3 className="text-md font-bold">Hasil Anotasi Polygon:</h3>
          <pre className="p-2 text-wrap">
            {JSON.stringify({ polygon_points: polygonPoints }, null, 0)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App
