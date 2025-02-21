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
  };
  return (
    <>
      <div className="p-4 w-full">
        <h2 className="text-lg font-bold mb-2">Image Annotator</h2>

        {/* Input untuk upload gambar */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="mb-2"
        />

        {/* Canvas untuk anotasi */}
        <div className="border border-gray-300 inline-block">
          <Stage width={600} height={400} onClick={handleCanvasClick}>
            <Layer>
              {image && <Image image={image} width={600} height={400} />}
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
        <div className="mt-4">
          <h3 className="text-md font-bold">Hasil Anotasi Polygon:</h3>
          <pre className="bg-gray-100 p-2">
            {JSON.stringify({ polygon_points: polygonPoints }, null, 1)}
          </pre>
        </div>
      </div>
    </>
  )
}

export default App
