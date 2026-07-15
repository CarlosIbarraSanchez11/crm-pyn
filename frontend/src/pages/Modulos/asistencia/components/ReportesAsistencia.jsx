import { useEffect, useState } from "react";
import api from "../../../../api/axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoPyn from "../../../../assets/logo-pyn.png";
import {
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  Eye,
} from "lucide-react";

export default function ReportesAsistencia() {
const [modalOpen, setModalOpen] = useState(false);
const [detalle, setDetalle] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
const [fechaInicio, setFechaInicio] = useState("");
const [fechaFin, setFechaFin] = useState("");
const [filtradas, setFiltradas] = useState([]);
  const obtenerDatos = async () => {
  try {

    setLoading(true);

    const res = await api.get("/asistencia");

    let datos = res.data.data || [];


    // FILTRO POR FECHA
    if(fechaInicio){

      const inicio = new Date(fechaInicio);
      inicio.setHours(0,0,0,0);


      datos = datos.filter(a =>
        new Date(a.fecha) >= inicio
      );

    }


    if(fechaFin){

      const fin = new Date(fechaFin);
      fin.setHours(23,59,59,999);


      datos = datos.filter(a =>
        new Date(a.fecha) <= fin
      );

    }


    setFiltradas(datos);
    setAsistencias(datos);


  } catch(error){

    console.error(error);

  } finally {

    setLoading(false);

  }
};

  useEffect(() => {
    obtenerDatos();
  }, []);

 const agrupados = Object.values(
  asistencias.reduce((acc, item) => {
    const fecha = new Date(item.fecha).toLocaleDateString();
const key = `${item.empleadoId}-${fecha}`;

if (!acc[key]) {
  acc[key] = {
    empleado: item.empleado,
    fecha,
    registros: [],
  };
}

    acc[key].registros.push(item);

    return acc;
  }, {})
)
  .map((g) => ({
    ...g,
    registros: g.registros.sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    ),
  }))
 .filter((g) =>
 `${g.empleado.nombres} ${g.empleado.apellidos}`
 .toLowerCase()
 .includes(busqueda.toLowerCase())
);
const abrirDetalle = (asistencia) => {
  setDetalle(asistencia);
  setModalOpen(true);
};
  /* =======================
     EXPORTAR EXCEL
  ======================= */
  const exportExcel = () => {
    const data = agrupados.map((g)=>({

Empleado:
`${g.empleado.nombres} ${g.empleado.apellidos}`,

DNI:
g.empleado.dni,

Cargo:
g.empleado.cargo,

Fecha:
g.fecha,

Entradas:
g.registros.filter(
r=>r.tipo==="ENTRADA"
).length,

Salidas:
g.registros.filter(
r=>r.tipo==="SALIDA"
).length

}));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");

    XLSX.writeFile(wb, "reporte_asistencia.xlsx");
  };
const convertirImagenBase64 = async (url) => {
  const respuesta = await fetch(url);

  const blob = await respuesta.blob();

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);

  });
};
  /* =======================
     EXPORTAR PDF
  ======================= */
const exportPDF = async () => {

  const doc = new jsPDF();

  const img = new Image();
  img.src = logoPyn;

  img.onload = async () => {

    //==============================
    // ENCABEZADO
    //==============================

    doc.setFillColor(23, 37, 76);
    doc.rect(0, 0, 210, 32, "F");

    doc.addImage(img, "PNG", 15, 6, 28, 18);

    doc.setTextColor(255, 255, 255);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("REPORTE GENERAL DE ASISTENCIA", 55, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Gestión RRHH", 55, 22);

    doc.setTextColor(0);

    //==============================
    // RESUMEN
    //==============================

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 38, 182, 24, 2, 2, "F");

    doc.setFontSize(10);

    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString()}`,
      20,
      47
    );

    doc.text(
      `Total de empleados: ${agrupados.length}`,
      20,
      55
    );

    let totalRegistros = agrupados.reduce(
      (acc, e) => acc + e.registros.length,
      0
    );

    doc.text(
      `Total registros: ${totalRegistros}`,
      110,
      47
    );

    //========================================================
// EMPLEADOS
//========================================================

let y = 72;

for (const grupo of agrupados) {

  // Altura aproximada que ocupará este empleado
  const alturaEstimada =
    55 +
    (grupo.registros.length * 8) +
    (grupo.registros.find(r => r.foto) ? 35 : 0);

  // Si no entra en la hoja, crear nueva página
  if (y + alturaEstimada > 270) {
    doc.addPage();
    y = 20;
  }

  //==============================
  // TARJETA
  //==============================

  doc.setDrawColor(220);
  doc.roundedRect(14, y, 182, 38, 2, 2);

  doc.setFillColor(23, 37, 76);
  doc.rect(14, y, 182, 8, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text(
    `${grupo.empleado.nombres} ${grupo.empleado.apellidos}`,
    18,
    y + 5.5
  );

  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(`Cargo: ${grupo.empleado.cargo || "-"}`, 18, y + 16);

  doc.text(
    `Departamento: ${grupo.empleado.departamento || "-"}`,
    18,
    y + 23
  );

  doc.text(
    `Registros: ${grupo.registros.length}`,
    18,
    y + 30
  );

  //==============================
  // FOTO
  //==============================

  const registroConFoto = grupo.registros.find(r => r.foto);

  if (registroConFoto) {

    try {

      const imagen = await cargarImagen(
        `http://localhost:3000/${registroConFoto.foto}`
      );

      doc.addImage(
        imagen,
        "JPEG",
        160,
        y + 10,
        26,
        26
      );

    } catch (error) {
      console.log(error);
    }

  }

  y += 48;

  //==============================
  // TABLA
  //==============================

  const filas = grupo.registros.map(r => [

    new Date(r.fecha).toLocaleDateString(),

    r.tipo,

    new Date(r.fecha).toLocaleTimeString(),

    `${Number(r.confianza || 0).toFixed(2)} %`,

    `${r.latitud ?? "-"} / ${r.longitud ?? "-"}`

  ]);

  autoTable(doc, {

    startY: y,

    head: [[
      "Fecha",
      "Tipo",
      "Hora",
      "Confianza",
      "Ubicación"
    ]],

    body: filas,

    theme: "grid",

    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: "middle"
    },

    headStyles: {
      fillColor: [23, 37, 76],
      textColor: [255, 255, 255],
      halign: "center",
      fontStyle: "bold"
    },

    alternateRowStyles: {
      fillColor: [247, 247, 247]
    }

  });

  // Posición para el siguiente empleado
  y = doc.lastAutoTable.finalY + 12;

}

    //===========================================
    // PIE DE PÁGINA
    //===========================================

    const paginas = doc.getNumberOfPages();

    for (let i = 1; i <= paginas; i++) {

      doc.setPage(i);

      doc.setDrawColor(220);

      doc.line(
        14,
        286,
        196,
        286
      );

      doc.setFontSize(9);

      doc.text(
        "Sistema de Gestión RRHH",
        15,
        291
      );

      doc.text(
        `Página ${i} de ${paginas}`,
        170,
        291
      );

    }

    doc.save("Reporte_Asistencia.pdf");

  };

};
const cargarImagen = (src)=>{

 return new Promise((resolve,reject)=>{


  const img = new Image();


  img.crossOrigin="anonymous";


  img.onload=()=>{

    resolve(img);

  };


  img.onerror=reject;


  img.src=src;


 });


};
  /* =======================
     IMPRIMIR
  ======================= */
  const imprimir = () => {
    const printContent = document.getElementById("tabla-print").innerHTML;
    const win = window.open("", "", "width=900,height=600");

    win.document.write(`
      <html>
        <head>
          <title>Imprimir Reporte</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #244db7; color: white; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-8">

      {/* TÍTULO */}
      <div>
        <h1 className="text-3xl font-black text-gray-800">
          Reportes de Asistencia
        </h1>
        <p className="text-gray-500 mt-2">
          Consulta y exporta el historial de asistencias.
        </p>
      </div>

      {/* FILTRO */}
      <div className="bg-white rounded-3xl shadow p-6">
        <div className="grid lg:grid-cols-4 gap-4">

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="text"
            placeholder="Buscar empleado..."
            className="border rounded-xl p-3 outline-none"
          />
<input
 type="date"
 value={fechaInicio}
 onChange={(e)=>setFechaInicio(e.target.value)}
 className="border rounded-xl p-3"
/>


<input
 type="date"
 value={fechaFin}
 onChange={(e)=>setFechaFin(e.target.value)}
 className="border rounded-xl p-3"
/>
          <button
            onClick={obtenerDatos}
           className="rounded-xl bg-[#F5B300] hover:bg-[#d89d00] text-black font-bold flex items-center justify-center gap-2 transition"
          >
            <Search size={18}/>
            Buscar
          </button>

        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-4">

        <button
          onClick={exportExcel}
          className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold flex items-center gap-2"
        >
          <FileSpreadsheet size={18}/>
          Exportar Excel
        </button>

        <button
          onClick={exportPDF}
          className="px-5 py-3 rounded-xl bg-red-600 text-white font-bold flex items-center gap-2"
        >
          <Download size={18}/>
          Exportar PDF
        </button>

        <button
          onClick={imprimir}
          className="px-5 py-3 rounded-xl bg-gray-800 text-white font-bold flex items-center gap-2"
        >
          <Printer size={18}/>
          Imprimir
        </button>

      </div>

      {/* TABLA */}
      <div id="tabla-print" className="bg-white rounded-3xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#F5B300] text-black">
            <tr>
                <th className="p-4">Empleado</th>
                <th>Fecha</th>
                <th>Acción</th>
            </tr>
            </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center">
                  Cargando...
                </td>
              </tr>
            ) : agrupados.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  Sin registros
                </td>
              </tr>
            ) : (
              agrupados.map((grupo) => (
              <tr
              key={`${grupo.empleado.id}-${grupo.fecha}`}
                className="border-b hover:bg-gray-50 transition"
              >

                  <td className="p-4 text-center font-medium">
                    {grupo.empleado.nombres} {grupo.empleado.apellidos}
                  </td>

                  <td className="p-4 text-center">
                    {grupo.fecha}
                  </td>
                  <td>
                      <button
                        onClick={() => abrirDetalle(grupo)}
                        className="flex items-center gap-2 bg-[#F5B300] hover:bg-[#d89d00] text-black px-4 py-2 rounded-xl mx-auto transition font-semibold"
                    >
                        <Eye size={18}/>
                        Ver
                    </button>
                  </td>

              </tr>
              ))
            )}

          </tbody>

        </table>
{modalOpen && detalle && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">

      <div className="flex justify-between items-start border-b pb-5 mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#F5B300]">
            {detalle.empleado.nombres} {detalle.empleado.apellidos}
          </h2>

          <p className="text-gray-500">
            {detalle.fecha}
          </p>

          <p>
            <span className="font-semibold">Cargo:</span>{" "}
            {detalle.empleado.cargo}
            </p>

            <p>
            <span className="font-semibold">Departamento:</span>{" "}
            {detalle.empleado.departamento}
            </p>
        </div>

        <button
          onClick={() => setModalOpen(false)}
          className="text-2xl text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      <div className="space-y-5">

        {detalle.registros.map((r) => (

          <div
            key={r.id}
            className={`rounded-2xl border-l-8 shadow-md p-5 ${
              r.tipo === "ENTRADA"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >

            <div className="flex justify-between items-center">

              <div>

                <h3
                  className={`text-xl font-bold ${
                    r.tipo === "ENTRADA"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {r.tipo}
                </h3>

                <p className="text-gray-500">
                  {new Date(r.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

              </div>

              <div
                className={`px-4 py-2 rounded-full font-bold ${
                  r.tipo === "ENTRADA"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {r.confianza?.toFixed(2)} %
                {r.foto && (
  <img
    src={`http://localhost:3000/${r.foto}`}
    className="rounded-xl w-48 mt-4"
    alt="Asistencia"
  />
)}
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-5">

              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm text-gray-500">
                  Latitud
                </p>

                <p className="font-semibold break-all">
                  {r.latitud}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm text-gray-500">
                  Longitud
                </p>

                <p className="font-semibold break-all">
                  {r.longitud}
                </p>
              </div>

            </div>

          </div>

        ))}

      </div>

      <div className="flex justify-end mt-8">

        <button
          onClick={() => setModalOpen(false)}
          className="bg-[#F5B300] hover:bg-[#d89d00] text-black px-8 py-3 rounded-xl font-bold transition"
        >
          Cerrar
        </button>

      </div>

    </div>
  </div>
)}
      </div>

    </div>
  );
}