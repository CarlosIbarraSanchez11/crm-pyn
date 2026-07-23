import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// OBTENER TODOS LOS PROYECTOS
export const obtenerProyectos = async (req: Request, res: Response): Promise<void> => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      include: {
        ambiente: {
          include: {
            piso: { include: { pabellon: { include: { sede: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: proyectos });
  } catch (error: any) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ success: false, error: "Error interno al listar proyectos" });
  }
};

// OBTENER LOS SIGUIENTES CÓDIGOS DISPONIBLES (SOL y PI)
export const obtenerSiguienteCodigo = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Calcular SOL-YYYY-XXX
    const year = new Date().getFullYear();
    const prefijoSol = `SOL-${year}-`;
    const ultimoSol = await prisma.proyecto.findFirst({
      where: { numeroSolicitante: { startsWith: prefijoSol } },
      orderBy: { id: 'desc' }
    });

    let correlativoSol = 1;
    if (ultimoSol && ultimoSol.numeroSolicitante) {
      const partes = ultimoSol.numeroSolicitante.split('-');
      if (partes[2]) correlativoSol = parseInt(partes[2], 10) + 1;
    }
    const codigoSolicitud = `${prefijoSol}${String(correlativoSol).padStart(3, '0')}`;

    // 2. Calcular PI-XXXX
    const prefijoPi = `PI-`;
    const ultimoPi = await prisma.proyecto.findFirst({
      where: { numeroProyectoInterno: { startsWith: prefijoPi } },
      orderBy: { id: 'desc' }
    });

    let correlativoPi = 1;
    if (ultimoPi && ultimoPi.numeroProyectoInterno) {
      const partes = ultimoPi.numeroProyectoInterno.split('-');
      if (partes[1]) correlativoPi = parseInt(partes[1], 10) + 1;
    }
    const codigoInterno = `${prefijoPi}${String(correlativoPi).padStart(4, '0')}`;

    // Devolvemos ambos al frontend
    res.status(200).json({ success: true, codigoSolicitud, codigoInterno });
  } catch (error: any) {
    console.error("Error al obtener códigos:", error);
    res.status(500).json({ success: false, error: "Error interno" });
  }
};

// CREAR PROYECTO
export const crearProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      cliente, nombreProyecto, tipoProyecto, ambienteId,
      sistema, dispositivo, marca, modelo, descripcion
    } = req.body;

    // Generar SOL-YYYY-XXX
    const year = new Date().getFullYear();
    const prefijoSol = `SOL-${year}-`;
    const ultimoSol = await prisma.proyecto.findFirst({
      where: { numeroSolicitante: { startsWith: prefijoSol } },
      orderBy: { id: 'desc' }
    });
    let correlativoSol = 1;
    if (ultimoSol && ultimoSol.numeroSolicitante) {
      const partes = ultimoSol.numeroSolicitante.split('-');
      if (partes[2]) correlativoSol = parseInt(partes[2], 10) + 1;
    }
    const numeroSolicitante = `${prefijoSol}${String(correlativoSol).padStart(3, '0')}`;

    // Generar PI-XXXX
    const prefijoPi = `PI-`;
    const ultimoPi = await prisma.proyecto.findFirst({
      where: { numeroProyectoInterno: { startsWith: prefijoPi } },
      orderBy: { id: 'desc' }
    });
    let correlativoPi = 1;
    if (ultimoPi && ultimoPi.numeroProyectoInterno) {
      const partes = ultimoPi.numeroProyectoInterno.split('-');
      if (partes[1]) correlativoPi = parseInt(partes[1], 10) + 1;
    }
    const numeroProyectoInterno = `${prefijoPi}${String(correlativoPi).padStart(4, '0')}`;

    // Manejo de archivos
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let fotoUrl = null;
    let pdfUrl = null;
    if (files?.foto && files.foto.length > 0) fotoUrl = "url_de_la_foto.jpg"; 
    if (files?.archivoPdf && files.archivoPdf.length > 0) pdfUrl = "url_del_pdf.pdf";

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        numeroSolicitante,
        numeroProyectoInterno, // <-- Guardamos el nuevo código
        cliente,
        nombreProyecto,
        tipoProyecto,
        ambienteId: Number(ambienteId),
        sistema,
        dispositivo,
        marca,
        modelo,
        descripcion,
        foto: fotoUrl,
        archivoPdf: pdfUrl
      }
    });

    res.status(201).json({ success: true, data: nuevoProyecto });
  } catch (error: any) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

// ACTUALIZAR ESTADO
export const actualizarEstadoProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const proyecto = await prisma.proyecto.update({ where: { id: Number(id) }, data: { estado } });
    res.status(200).json({ success: true, data: proyecto });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "No se pudo actualizar el estado" });
  }
};

// COTIZAR PROYECTO INTERNO Y PASAR A PENDIENTE
export const cotizarProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      gastoEquipos, gastoMateriales, gastoManoObra,
      gastosAdministrativos, costoCliente, margen
    } = req.body;

    // 🔥 Capturamos el archivo PDF o Excel enviado por Multer
    const file = req.file as Express.Multer.File | undefined;
    let archivoUrl = null;

    if (file) {
      // Ajusta la ruta según cómo guardes tus archivos en el servidor
      archivoUrl = `/uploads/proyectos/cotizaciones/${Date.now()}-${file.originalname}`;
    }

    const proyectoCotizado = await prisma.proyecto.update({
      where: { id: Number(id) },
      data: {
        gastoEquipos: Number(gastoEquipos || 0),
        gastoMateriales: Number(gastoMateriales || 0),
        gastoManoObra: Number(gastoManoObra || 0),
        gastosAdministrativos: Number(gastosAdministrativos || 0),
        costoCliente: Number(costoCliente || 0),
        margen: Number(margen || 0),
        // 🔥 Si se subió un archivo, actualizamos la ruta en la base de datos
        ...(archivoUrl && { archivoPdf: archivoUrl }),
        estado: 'pendiente' // Pasa automáticamente a pendiente
      }
    });

    res.status(200).json({ success: true, data: proyectoCotizado });
  } catch (error: any) {
    console.error("Error al cotizar proyecto:", error);
    res.status(500).json({ success: false, error: "Error al guardar la cotización" });
  }
};