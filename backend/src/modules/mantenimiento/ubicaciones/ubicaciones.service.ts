import { prisma } from "../../../config/prisma"; 
import * as xlsx from 'xlsx';

// 🔧 Normaliza: quita espacios extra al inicio/fin/medio y pasa a mayúsculas
const normalizarNombre = (str: string) => str.trim().replace(/\s+/g, ' ').toUpperCase();

export const importarExcelRelacionalService = async (buffer: Buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        throw new Error("El archivo Excel no contiene ninguna hoja");
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        throw new Error(`No se pudo leer la hoja "${sheetName}"`);
    }
    
    const data: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) throw new Error("El archivo Excel está vacío");

    let registrosProcesados = 0;

    for (const row of data) {
        const nombreZonalRaw    = row.Zonal?.toString().trim();
        const nombreSedeRaw     = row.Sede?.toString().trim();
        const nombrePabellonRaw = row.Pabellon?.toString().trim();
        const nombrePisoRaw     = row.Piso?.toString().trim();
        const nombreAmbienteRaw = row.Ambiente?.toString().trim();

        // 🆕 Zonal es ahora el primer nivel obligatorio de la cadena
        if (!nombreZonalRaw) continue;
        const nombreZonal = normalizarNombre(nombreZonalRaw);

        const zonal = await prisma.zonal.upsert({
            where: { nombre: nombreZonal },
            update: {},
            create: { nombre: nombreZonal }
        });

        if (!nombreSedeRaw) continue;
        const nombreSede = normalizarNombre(nombreSedeRaw);

        const sede = await prisma.sede.upsert({
            where: { nombre_zonalId: { nombre: nombreSede, zonalId: zonal.id } },
            update: {},
            create: { nombre: nombreSede, zonalId: zonal.id }
        });

        if (!nombrePabellonRaw) continue;
        const nombrePabellon = normalizarNombre(nombrePabellonRaw);

        const pabellon = await prisma.pabellon.upsert({
            where: { nombre_sedeId: { nombre: nombrePabellon, sedeId: sede.id } },
            update: {},
            create: { nombre: nombrePabellon, sedeId: sede.id }
        });

        if (!nombrePisoRaw) continue;
        const nombrePiso = normalizarNombre(nombrePisoRaw);

        const piso = await prisma.piso.upsert({
            where: { nombre_pabellonId: { nombre: nombrePiso, pabellonId: pabellon.id } },
            update: {},
            create: { nombre: nombrePiso, pabellonId: pabellon.id }
        });

        if (!nombreAmbienteRaw) continue;
        const nombreAmbiente = normalizarNombre(nombreAmbienteRaw);

        await prisma.ambiente.upsert({
            where: { nombre_pisoId: { nombre: nombreAmbiente, pisoId: piso.id } },
            update: {},
            create: { nombre: nombreAmbiente, pisoId: piso.id }
        });

        registrosProcesados++;
    }

    return registrosProcesados;
};

// Servicios básicos para el Frontend
export const obtenerZonalesService    = async () => await prisma.zonal.findMany({ include: { sedes: true }});
export const obtenerSedesService      = async () => await prisma.sede.findMany({ include: { zonal: true, pabellones: true }});
export const obtenerPabellonesService = async () => await prisma.pabellon.findMany({ include: { sede: true, pisos: true }});
export const obtenerPisosService      = async () => await prisma.piso.findMany({ include: { pabellon: true, ambientes: true }});
export const obtenerAmbientesService  = async () => await prisma.ambiente.findMany({ include: { piso: true }});