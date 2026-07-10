import {
  X,
  Camera,
  RotateCcw,
  Check,
  LoaderCircle,
  AlertCircle,
  User,
  Briefcase,
  ScanFace,
  SwitchCamera,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// Colores de marca
const COLORS = {
  navy: "rgb(23 37 76)",
  navyDark: "rgb(16 27 58)",
  navySoft: "rgb(23 37 76 / 0.06)",
  orange: "rgb(243 146 0)",
  orangeDark: "rgb(214 128 0)",
  orangeSoft: "rgb(243 146 0 / 0.10)",
};

const ESTADOS = ["Activo", "Inactivo"];

const CAMPOS_REQUERIDOS = ["nombres", "apellidos", "dni", "fechaNacimiento"];

const FORM_INICIAL = {
  nombres: "",
  apellidos: "",
  dni: "",
  fechaNacimiento: "",
  email: "",
  telefono: "",
  direccion: "",
  cargo: "",
  departamento: "",
  empresa: "",
  estado: "Activo",
};

function Campo({ label, required, error, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-[rgb(243_146_0)]">*</span>}
        </label>
        {hint && !error && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: COLORS.navySoft, color: COLORS.navy }}
      >
        <Icon size={16} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export default function ModalNuevoEmpleado({ cerrar, onGuardar }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const iniciarVideoRef = useRef(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [foto, setFoto] = useState(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [cargandoCamara, setCargandoCamara] = useState(false);
  const [errorCamara, setErrorCamara] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoIdx, setDispositivoIdx] = useState(0);

  // Corta la cámara al desmontar el modal, evitando dejar el LED encendido
  useEffect(() => {
    return () => detenerCamara();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cierra con Escape, como cualquier modal del sistema
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") cerrar?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cerrar]);
const detenerCamara = useCallback(() => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
  }

  streamRef.current = null;

  if (videoRef.current) {
    videoRef.current.pause();
    videoRef.current.srcObject = null;
    videoRef.current.load();
  }

  setCamaraActiva(false);
}, []);
const abrirCamara = useCallback(async () => {
  setErrorCamara(null);
  setCargandoCamara(true);

  try {
    detenerCamara();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    streamRef.current = stream;

    const cams = await navigator.mediaDevices.enumerateDevices();

    setDispositivos(
      cams.filter((d) => d.kind === "videoinput")
    );

    iniciarVideoRef.current = true;
    setCamaraActiva(true);
  } catch (error) {
    console.error(error);

    if (error.name === "NotAllowedError") {
      setErrorCamara("Permiso de cámara denegado.");
    } else if (error.name === "NotFoundError") {
      setErrorCamara("No existe una cámara conectada.");
    } else {
      setErrorCamara("No se pudo iniciar la cámara.");
    }
  } finally {
    setCargandoCamara(false);
  }
}, [detenerCamara]);
const cambiarCamara = useCallback(async () => {
  if (dispositivos.length <= 1) return;

  const siguiente = (dispositivoIdx + 1) % dispositivos.length;

  setDispositivoIdx(siguiente);

  detenerCamara();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: {
          exact: dispositivos[siguiente].deviceId,
        },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    streamRef.current = stream;
    iniciarVideoRef.current = true;
    setCamaraActiva(true);
  } catch (err) {
    console.error(err);
    setErrorCamara("No se pudo cambiar de cámara.");
  }
}, [
  dispositivos,
  dispositivoIdx,
  detenerCamara,
]);

useEffect(()=>{

  if(
    camaraActiva &&
    iniciarVideoRef.current &&
    videoRef.current &&
    streamRef.current
  ){

    videoRef.current.srcObject =
      streamRef.current;


    videoRef.current.play()
      .catch(err=>{
        console.log(err);
      });


    iniciarVideoRef.current=false;

  }

},[camaraActiva]);



const capturarRostro = ()=>{

  const video = videoRef.current;


  if(
    !video ||
    video.readyState < 2
  ){
    return;
  }


  const canvas=document.createElement("canvas");


  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;


  const ctx=canvas.getContext("2d");


  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  setFoto(
    canvas.toDataURL("image/png")
  );


  detenerCamara();

};

const repetirCaptura = async () => {
  setFoto(null);
  await abrirCamara();
};

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};
    CAMPOS_REQUERIDOS.forEach((campo) => {
      if (!String(form[campo] ?? "").trim()) {
        nuevosErrores[campo] = "Este campo es obligatorio";
      }
    });
    if (form.dni && !/^\d{8}$/.test(form.dni.trim())) {
      nuevosErrores.dni = "El DNI debe tener 8 dígitos";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nuevosErrores.email = "Ingresa un correo válido";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      await onGuardar?.({ ...form, foto });
      setGuardadoOk(true);
      setTimeout(() => cerrar?.(), 900);
    } catch (error) {
      console.error(error);
      setErrores((prev) => ({ ...prev, _general: "No se pudo guardar. Intenta de nuevo." }));
    } finally {
      setGuardando(false);
    }
  };

  const camposCompletos = useMemo(
    () => CAMPOS_REQUERIDOS.filter((c) => String(form[c] ?? "").trim()).length,
    [form]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-empleado"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* CABECERA */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: COLORS.navy }}
        >
          <div>
            <h2 id="titulo-modal-empleado" className="text-lg font-semibold text-white">
              Nuevo empleado
            </h2>
            <p className="text-xs text-slate-300">
              Completa los datos y registra el rostro para el control de acceso
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs text-slate-300 sm:flex">
              <span
                className="h-1.5 w-24 overflow-hidden rounded-full"
                style={{ backgroundColor: "rgb(255 255 255 / 0.15)" }}
              >
                <span
                  className="block h-full rounded-full transition-all"
                  style={{
                    backgroundColor: COLORS.orange,
                    width: `${(camposCompletos / CAMPOS_REQUERIDOS.length) * 100}%`,
                  }}
                />
              </span>
              {camposCompletos}/{CAMPOS_REQUERIDOS.length} obligatorios
            </div>
            <button
              onClick={cerrar}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="overflow-y-auto px-6 py-6">
          <SectionHeading
            icon={User}
            title="Datos personales"
            subtitle="Información básica de identidad"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Nombres" required error={errores.nombres}>
              <input
                className={`${inputBase} ${
                  errores.nombres
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200"
                }`}
                placeholder="Ej. Juan Carlos"
                value={form.nombres}
                onChange={(e) => actualizarCampo("nombres", e.target.value)}
              />
            </Campo>

            <Campo label="Apellidos" required error={errores.apellidos}>
              <input
                className={`${inputBase} ${
                  errores.apellidos
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200"
                }`}
                placeholder="Ej. Pérez Gómez"
                value={form.apellidos}
                onChange={(e) => actualizarCampo("apellidos", e.target.value)}
              />
            </Campo>

            <Campo label="DNI" required error={errores.dni}>
              <input
                className={`${inputBase} ${
                  errores.dni
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200"
                }`}
                placeholder="8 dígitos"
                maxLength={8}
                inputMode="numeric"
                value={form.dni}
                onChange={(e) =>
                  actualizarCampo("dni", e.target.value.replace(/\D/g, ""))
                }
              />
            </Campo>

            <Campo label="Fecha de nacimiento" required error={errores.fechaNacimiento}>
              <input
                type="date"
                className={`${inputBase} ${
                  errores.fechaNacimiento
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200"
                }`}
                value={form.fechaNacimiento}
                onChange={(e) => actualizarCampo("fechaNacimiento", e.target.value)}
              />
            </Campo>

            <Campo label="Email" error={errores.email}>
              <input
                type="email"
                className={`${inputBase} ${
                  errores.email
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200"
                }`}
                placeholder="correo@empresa.com"
                value={form.email}
                onChange={(e) => actualizarCampo("email", e.target.value)}
              />
            </Campo>

            <Campo label="Teléfono">
              <input
                className={`${inputBase} border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200`}
                placeholder="999 999 999"
                value={form.telefono}
                onChange={(e) => actualizarCampo("telefono", e.target.value)}
              />
            </Campo>

            <div className="sm:col-span-2">
              <Campo label="Dirección">
                <input
                  className={`${inputBase} border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200`}
                  placeholder="Av. / Jr. / Calle, número, distrito"
                  value={form.direccion}
                  onChange={(e) => actualizarCampo("direccion", e.target.value)}
                />
              </Campo>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <SectionHeading
              icon={Briefcase}
              title="Datos laborales"
              subtitle="Puesto y ubicación dentro de la empresa"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Cargo">
              <input
                className={`${inputBase} border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200`}
                placeholder="Ej. Analista de sistemas"
                value={form.cargo}
                onChange={(e) => actualizarCampo("cargo", e.target.value)}
              />
            </Campo>

            <Campo label="Departamento">
              <input
                className={`${inputBase} border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200`}
                placeholder="Ej. Tecnología"
                value={form.departamento}
                onChange={(e) => actualizarCampo("departamento", e.target.value)}
              />
            </Campo>

            <Campo label="Empresa">
              <input
                className={`${inputBase} border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200`}
                placeholder="Razón social"
                value={form.empresa}
                onChange={(e) => actualizarCampo("empresa", e.target.value)}
              />
            </Campo>

            <Campo label="Estado">
              <select
                className={`${inputBase} border-slate-300 focus:border-[rgb(23_37_76)] focus:ring-slate-200`}
                value={form.estado}
                onChange={(e) => actualizarCampo("estado", e.target.value)}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          {/* REGISTRO FACIAL */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <SectionHeading
              icon={ScanFace}
              title="Registro facial"
              subtitle="Foto clara, con buena iluminación y sin lentes oscuros"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              {/* Panel de cámara / vista previa */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                <div className="relative flex h-56 items-center justify-center">
                  {foto ? (
                    <img src={foto} alt="Rostro capturado" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`h-full w-full object-cover ${
                            camaraActiva ? "block" : "hidden"
                        }`}
                        />
                      {camaraActiva && (
                        <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-white/25" />
                      )}
                      {!camaraActiva && !cargandoCamara && (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Camera size={28} />
                          <span className="text-xs">La cámara está apagada</span>
                        </div>
                      )}
                      {cargandoCamara && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 text-slate-300">
                            <div className="animate-spin">⏳</div>
                            <span className="text-xs">
                            Solicitando acceso a la cámara...
                            </span>
                        </div>
                        )}
                      {camaraActiva && dispositivos.length > 1 && (
                        <button
                          type="button"
                          onClick={cambiarCamara}
                          title="Cambiar de cámara"
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
                        >
                          <SwitchCamera size={15} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Vista previa / estado + controles */}
              <div className="flex w-full flex-col justify-between gap-4 sm:w-52">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2"
                    style={{ borderColor: foto ? COLORS.orange : "rgb(203 213 225)" }}
                  >
                    {foto ? (
                      <img src={foto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="text-xs">
                    {foto ? (
                      <p className="flex items-center gap-1 font-medium text-green-700">
                        <Check size={13} /> Rostro listo
                      </p>
                    ) : (
                      <p className="text-slate-500">Aún sin capturar</p>
                    )}
                  </div>
                </div>

                {errorCamara && (
                  <p className="flex items-start gap-1.5 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {errorCamara}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  {!foto && !camaraActiva && (
                    <button
                      type="button"
                     onClick={() => abrirCamara()}
                      disabled={cargandoCamara}
                      className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60"
                      style={{ backgroundColor: COLORS.navy }}
                    >
                      {cargandoCamara ? "Cargando..." : <Camera size={16} />}
                      Abrir cámara
                    </button>
                  )}

                  {camaraActiva && !foto && (
                    <button
                      type="button"
                      onClick={capturarRostro}
                      className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition"
                      style={{ backgroundColor: COLORS.orange }}
                    >
                      <Camera size={16} />
                      Capturar rostro
                    </button>
                  )}

                  {foto && (
                    <button
                      type="button"
                      onClick={repetirCaptura}
                      className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <RotateCcw size={16} />
                      Repetir captura
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIE / ACCIONES */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
          <div className="text-xs">
            {errores._general && (
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertCircle size={13} />
                {errores._general}
              </span>
            )}
            {guardadoOk && (
              <span className="flex items-center gap-1.5 font-medium text-green-700">
                <Check size={13} />
                Empleado guardado
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={cerrar}
              disabled={guardando}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando || guardadoOk}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition disabled:opacity-60"
              style={{ backgroundColor: guardadoOk ? "rgb(21 128 61)" : COLORS.orange }}
            >
              {guardando && <LoaderCircle size={16} className="animate-spin" />}
              {guardadoOk ? "Guardado" : "Guardar empleado"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}