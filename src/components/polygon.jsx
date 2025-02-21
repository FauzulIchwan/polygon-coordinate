// import { useRef, useState, useEffect } from "react";

// export default function PolygonDrawer() {
//   const canvasRef = useRef(null);
//   const [points, setPoints] = useState([]);
//   const imageSrc = "/images/test.jpeg"; // Ganti dengan path gambar yang diinginkan

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     const img = new Image();
//     img.src = imageSrc;
//     img.onload = () => {
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       drawPolygon();
//     };
//   }, [points]);

//   const handleCanvasClick = (event) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();

//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     setPoints([...points, { x, y }]);
//   };

//   const drawPolygon = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Redraw image as background
//     const img = new Image();
//     img.src = imageSrc;
//     img.onload = () => {
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//       if (points.length < 2) return;

//       // Draw polygon
//       ctx.beginPath();
//       ctx.moveTo(points[0].x, points[0].y);
//       points.forEach((point) => {
//         ctx.lineTo(point.x, point.y);
//       });

//       ctx.strokeStyle = "red";
//       ctx.lineWidth = 2;
//       ctx.stroke();
//     };
//   };

//   const handleUndo = () => {
//     if (points.length > 0) {
//       setPoints(points.slice(0, -1));
//     }
//   };

//   const handleSave = () => {
//     console.log("Koordinat disimpan:", points);
//     alert("Koordinat telah disimpan! Cek console untuk melihat hasilnya.");
//   };

//   return (
//     <div className="flex flex-col items-center p-4">
//       <h1 className="text-2xl font-bold mb-4">Polygon Drawer</h1>
//       <canvas
//         ref={canvasRef}
//         width={500}
//         height={300}
//         className="border border-gray-500"
//         onClick={handleCanvasClick}
//       />

//       <div className="mt-4">
//         <h3 className="text-lg font-semibold">Koordinat Titik:</h3>
//         <ul className="list-disc pl-5">
//           {points.map((point, index) => (
//             <li key={index}>
//               {index + 1}. ({point.x.toFixed(2)}, {point.y.toFixed(2)})
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="mt-4 flex gap-4">
//         <button
//           onClick={handleUndo}
//           className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
//         >
//           Hapus Titik Terakhir
//         </button>
//         <button
//           onClick={handleSave}
//           className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//         >
//           Simpan Koordinat
//         </button>
//       </div>
//     </div>
//   );
// }

import { useRef, useState, useEffect } from "react";

export default function PolygonDrawer() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const imageSrc = "/images/tenda.png"; // Ganti dengan path gambar yang diinginkan

  useEffect(() => {
    drawCanvas();
  }, [ points]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setPoints([...points, { x, y }]);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw image as background
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (points.length < 1) return;

      // Draw polygon lines
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw polygon points
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI); // Lingkaran kecil untuk titik
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();
      });
    };
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleSave = () => {
    console.log("Koordinat disimpan:", points);
    alert("Koordinat telah disimpan! Cek console untuk melihat hasilnya.");
  };

  const handleReset = () => {
    setPoints([]);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Polygon Drawer</h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className=" left-20 border border-gray-500"
        onClick={handleCanvasClick}
      />

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Koordinat Titik:</h3>
        <ul className="list-disc pl-3">
          {points.map((point, index) => (
            <li key={index}>
              ({point.x.toFixed(2)}, {point.y.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>

      <div>
      <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Reset
          </button>
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleUndo}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          Hapus Titik Terakhir
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Simpan Koordinat
        </button>
      </div>
    </div>
  );
}
