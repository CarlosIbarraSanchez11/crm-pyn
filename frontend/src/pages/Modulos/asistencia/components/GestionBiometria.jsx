// src/pages/modulos/asistencia/components/GestionBiometria.jsx

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import api from "../../../../api/axios";

import {
  Search,
  ScanFace,
  Camera,
  Save,
  User,
  Trash2,
  RefreshCw,
  Users,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const COLORS = {
  navy: "rgb(23 37 76)",
  orange: "rgb(243 146 0)",
};

export default function GestionBiometria() {

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const [modelosListos, setModelosListos] = useState(false);

  const [empleados, setEmpleados] = useState([]);

  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(false);

  const [estadisticas, setEstadisticas] = useState({

    total:0,

    registrados:0,

    pendientes:0

  });
useEffect(() => {

const cargarModelos = async()=>{

try{

const MODEL_URL="/models";

await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

setModelosListos(true);

}catch(err){

console.log(err);

}

};

cargarModelos();

},[]);
const obtenerEmpleados=async()=>{

try{

setLoading(true);

const res=await api.get("/rrhh/empleados");

setEmpleados(res.data);

setEstadisticas({

total:res.data.length,

registrados:res.data.filter(e=>e.descriptor).length,

pendientes:res.data.filter(e=>!e.descriptor).length

});

}catch(err){

console.log(err);

}

finally{

setLoading(false);

}

};
useEffect(()=>{

obtenerEmpleados();

},[]);
const empleadosFiltrados=empleados.filter((e)=>{

const texto=busqueda.toLowerCase();

return(

e.nombres.toLowerCase().includes(texto)

||

e.apellidos.toLowerCase().includes(texto)

||

e.dni.includes(texto)

);

});
const seleccionarEmpleado=(empleado)=>{

setEmpleadoSeleccionado(empleado);

};
// ===============================
// ACTIVAR CÁMARA
// ===============================

const activarCamara = async () => {
  try {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        facingMode: "user",
      },
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          resolve();
        };
      });
    }

  } catch (error) {
    console.error(error);
    alert("No se pudo acceder a la cámara.");
  }
};

// ===============================
// DETENER CÁMARA
// ===============================

const detenerCamara = () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
};
// ===============================
// CAPTURAR DESCRIPTOR
// ===============================

const capturarDescriptor = async () => {

  if (!modelosListos) {
    alert("Los modelos aún se están cargando.");
    return null;
  }

  const deteccion = await faceapi
    .detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!deteccion) {
    alert("No se detectó ningún rostro.");
    return null;
  }

  return Array.from(deteccion.descriptor);
};
// ===============================
// CAPTURAR FOTO
// ===============================

const capturarFoto = () => {

  const canvas = document.createElement("canvas");

  canvas.width = videoRef.current.videoWidth;

  canvas.height = videoRef.current.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    videoRef.current,
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
// ===============================
// GUARDAR BIOMETRÍA
// ===============================

const guardarBiometria = async () => {

  if (!empleadoSeleccionado) {
    alert("Seleccione un empleado.");
    return;
  }

  const descriptor = await capturarDescriptor();

  if (!descriptor) return;

  const foto = await capturarFoto();

  const formData = new FormData();

  formData.append(
    "empleadoId",
    empleadoSeleccionado.id
  );

  formData.append(
    "descriptor",
    JSON.stringify(descriptor)
  );

  if (foto) {
    formData.append(
      "fotoPerfil",
      foto,
      "perfil.jpg"
    );
  }

  try {

    await api.post(
      "asistencia/empleados/biometria",
      formData
    );

    alert("Biometría registrada correctamente.");

    obtenerEmpleados();

  } catch (error) {

    console.error(error);

    alert("No se pudo registrar la biometría.");

  }

};
const actualizarBiometria = async () => {
  if (!empleadoSeleccionado) {
    alert("Seleccione un empleado.");
    return;
  }

  const descriptor = await capturarDescriptor();

  if (!descriptor) return;

  const foto = await capturarFoto();

  const formData = new FormData();

  formData.append(
    "descriptor",
    JSON.stringify(descriptor)
  );

  if (foto) {
    formData.append(
      "fotoPerfil",
      foto,
      "perfil.jpg"
    );
  }

  try {

    await api.put(
      `/asistencia/empleados/${empleadoSeleccionado.id}/biometria`,
      formData
    );

    alert("Biometría actualizada.");

    obtenerEmpleados();

  } catch (error) {

    console.error(error);

    alert("No se pudo actualizar.");

  }
};
const eliminarBiometria = async () => {

  if (!empleadoSeleccionado) return;

  const ok = window.confirm(
    "¿Eliminar la biometría del empleado?"
  );

  if (!ok) return;

  await api.delete(

    `/empleados/${empleadoSeleccionado.id}/biometria`

  );

  alert("Biometría eliminada.");

  setEmpleadoSeleccionado(null);

  obtenerEmpleados();

};
return (
  <div className="space-y-8">

    {/* TÍTULO */}

    <div className="flex justify-between items-center">

      <div>

        <h1
          className="text-3xl font-black"
          style={{ color: COLORS.navy }}
        >
          Gestión Biométrica
        </h1>

        <p className="text-gray-500 mt-2">
          Registro y administración del reconocimiento facial de los
          empleados.
        </p>

      </div>

    </div>

    {/* KPIs */}

    <div className="grid md:grid-cols-3 gap-6">

      <div className="bg-white rounded-3xl shadow p-6">

        <div className="flex items-center gap-4">

          <Users
            size={50}
            color={COLORS.orange}
          />

          <div>

            <p className="text-gray-500">
              Total empleados
            </p>

            <h2
              className="text-3xl font-black"
              style={{ color: COLORS.navy }}
            >
              {estadisticas.total}
            </h2>

          </div>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-6">

        <div className="flex items-center gap-4">

          <CheckCircle
            size={50}
            className="text-green-600"
          />

          <div>

            <p className="text-gray-500">
              Registrados
            </p>

            <h2 className="text-3xl font-black text-green-600">

              {estadisticas.registrados}

            </h2>

          </div>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-6">

        <div className="flex items-center gap-4">

          <AlertTriangle
            size={50}
            className="text-red-500"
          />

          <div>

            <p className="text-gray-500">
              Pendientes
            </p>

            <h2 className="text-3xl font-black text-red-500">

              {estadisticas.pendientes}

            </h2>

          </div>

        </div>

      </div>

    </div>

    {/* BUSCADOR */}

    <div className="bg-white rounded-3xl shadow p-6">

      <div className="relative">

        <Search
          className="absolute left-4 top-3 text-gray-400"
        />

        <input
          value={busqueda}
          onChange={(e)=>setBusqueda(e.target.value)}
          placeholder="Buscar por nombres, apellidos o DNI..."
          className="w-full border rounded-xl pl-12 p-3 outline-none"
        />

      </div>

    </div>
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-3xl shadow p-6">

<h2
className="font-bold mb-4"
style={{color:COLORS.navy}}
>

Empleados

</h2>

<div className="space-y-3 max-h-[550px] overflow-auto">

{
empleadosFiltrados.map((empleado)=>(

<div

key={empleado.id}

onClick={()=>seleccionarEmpleado(empleado)}

className={`

p-4

rounded-xl

cursor-pointer

border

transition

${
empleadoSeleccionado?.id===empleado.id

?

"border-orange-500 bg-orange-50"

:

"hover:bg-gray-50"

}

`}

>

<h3 className="font-bold">

{empleado.nombres}

{" "}

{empleado.apellidos}

</h3>

<p className="text-sm text-gray-500">

{empleado.cargo}

</p>

<p className="text-sm text-gray-500">

DNI {empleado.dni}

</p>

</div>

))
}

</div>

</div>
<div className="bg-white rounded-3xl shadow p-6">

{

empleadoSeleccionado?

<>

<h2
className="text-2xl font-black"
style={{color:COLORS.navy}}
>

{empleadoSeleccionado.nombres}

{" "}

{empleadoSeleccionado.apellidos}

</h2>

<div className="space-y-2 mt-6">

<p>

<b>DNI:</b>

{empleadoSeleccionado.dni}

</p>

<p>

<b>Cargo:</b>

{empleadoSeleccionado.cargo}

</p>

<p>

<b>Departamento:</b>

{empleadoSeleccionado.departamento}

</p>

<p>

<b>Empresa:</b>

{empleadoSeleccionado.empresa}

</p>

</div>

<div className="mt-8">

{

empleadoSeleccionado.descriptor?

<div className="text-green-600 font-bold">

✔ Biometría registrada

</div>

:

<div className="text-red-500 font-bold">

✖ Sin biometría

</div>

}

</div>

</>

:

<div className="text-center py-20">

<User

size={70}

color={COLORS.orange}

/>

<p className="mt-4 text-gray-500">

Seleccione un empleado

</p>

</div>

}

</div>
<div className="bg-white rounded-3xl shadow p-6">

<h2
className="font-bold mb-5"
style={{color:COLORS.navy}}
>

Captura Facial

</h2>

<div className="rounded-2xl overflow-hidden bg-black">

<video

ref={videoRef}

autoPlay

muted

playsInline

className="w-full h-[350px] object-cover"

/>

</div>

<div className="grid gap-3 mt-5">

<button

onClick={activarCamara}

className="rounded-xl py-3 text-white font-bold flex justify-center gap-3"

style={{
backgroundColor:COLORS.navy
}}

>

<Camera/>

Activar Cámara

</button>

<button

onClick={guardarBiometria}

className="rounded-xl py-3 text-white font-bold flex justify-center gap-3 bg-green-600"

>

<Save/>

Guardar Biometría

</button>

<button

onClick={actualizarBiometria}

className="rounded-xl py-3 text-white font-bold flex justify-center gap-3"

style={{
backgroundColor:COLORS.orange
}}

>

<RefreshCw/>

Actualizar

</button>

</div>

</div>

</div>

</div>
  );
}