import * as faceapi from "face-api.js";
import api from "../../../../api/axios";
import { useEffect, useState } from "react";
import {
  MapPinned,
  Camera,
  ScanFace,
  CheckCircle2,
} from "lucide-react";

export default function RegistroAsistencia() {
  const [modelosListos, setModelosListos] = useState(false);
  const [ubicacionValida, setUbicacionValida] = useState(false);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [rostroReconocido, setRostroReconocido] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =======================
     CARGA MODELOS (IGUAL QUE BIOMETRÍA)
  ======================= */
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("🔄 Iniciando carga de modelos...");

        const MODEL_URL = "/models";

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        console.log("✔ MODELOS LISTOS");
        setModelosListos(true);

      } catch (err) {
        console.error("❌ ERROR MODELOS:", err);
      }
    };

    loadModels();
  }, []);

  /* =======================
     ACTIVAR CÁMARA
  ======================= */
  const activarCamara = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    const video = document.getElementById("videoAsistencia");

    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(resolve);
      };
    });

    setCamaraActiva(true);
    console.log("✔ Cámara lista");
  };

  /* =======================
     UBICACIÓN
  ======================= */
  const obtenerUbicacion = async () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };
const capturarFoto = () => {
  const video = document.getElementById("videoAsistencia");

  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};
  /* =======================
     RECONOCIMIENTO + ASISTENCIA
  ======================= */
  const iniciarReconocimiento = async () => {
    try {
      if (!modelosListos) {
        alert("Espera, modelos aún cargando...");
        return;
      }

      setLoading(true);

      const video = document.getElementById("videoAsistencia");

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        alert("No se detectó rostro");
        setLoading(false);
        return;
      }
      const foto = await capturarFoto();
      const descriptor = Array.from(detections.descriptor);

      const position = await obtenerUbicacion();

      const formData = new FormData();

formData.append(
  "descriptor",
  JSON.stringify(descriptor)
);

formData.append(
  "latitud",
  position.coords.latitude
);

formData.append(
  "longitud",
  position.coords.longitude
);

if (foto) {
  formData.append(
    "foto",
    foto,
    "asistencia.jpg"
  );
}
const res = await api.post(
  "/asistencia/marcar",
  formData
);

      if (res.data.ok) {
        setRostroReconocido(true);
        alert(`Asistencia registrada: ${res.data.empleado}`);
      } else {
        alert(res.data.message);
      }

      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-gray-800">
          Registrar Asistencia
        </h1>
        <p className="text-gray-500 mt-2">
          Valida tu ubicación y tu identidad para registrar tu asistencia.
        </p>
      </div>

      {/* PASOS */}
      <div className="grid lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-3xl shadow p-6">
          <MapPinned className="text-[#244db7] mb-4" size={38} />
          <h2 className="font-bold">Ubicación</h2>
          <p className="text-gray-500 mt-2">
            {ubicacionValida ? "Ubicación válida." : "Pendiente..."}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <Camera className="text-[#244db7] mb-4" size={38} />
          <h2 className="font-bold">Cámara</h2>
          <p className="text-gray-500 mt-2">
            {camaraActiva ? "Cámara activa." : "Cámara desactivada."}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <ScanFace className="text-[#244db7] mb-4" size={38} />
          <h2 className="font-bold">Reconocimiento Facial</h2>
          <p className="text-gray-500 mt-2">
            {rostroReconocido ? "Identidad verificada." : "Esperando..."}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <CheckCircle2 className="text-green-600 mb-4" size={38} />
          <h2 className="font-bold">Asistencia</h2>
          <p className="text-gray-500 mt-2">
            Aún no registrada.
          </p>
        </div>
      </div>

      {/* CÁMARA */}
      <div className="bg-white rounded-3xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Cámara</h2>

        <div className="h-[420px] rounded-2xl bg-gray-100 border-2 border-dashed flex items-center justify-center">
          <video
            id="videoAsistencia"
            className="w-full h-full rounded-2xl"
            muted
          />
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-center gap-4">

        <button
          onClick={activarCamara}
          className="px-10 py-4 rounded-2xl bg-[#F5B300] text-black font-bold"
        >
          Activar cámara
        </button>

        <button
          onClick={iniciarReconocimiento}
          disabled={loading}
          className="px-10 py-4 rounded-2xl bg-green-600 text-white font-bold"
        >
          {loading ? "Procesando..." : "Registrar asistencia"}
        </button>

      </div>

    </div>
  );
}