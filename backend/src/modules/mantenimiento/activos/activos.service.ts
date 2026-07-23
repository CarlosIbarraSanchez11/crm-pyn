import { prisma } from "../../../config/prisma";
import * as xlsx from 'xlsx';

// Interfaz para tipar la creación de un activo manual
interface CrearActivoInput {
    sistema: string;
    dispositivo: string;
    marca: string;
    modelo: string;
    serie?: string;
    lote?: string;
    ambienteId: number;
}

// Función auxiliar para normalizar textos (elimina espacios dobles y pasa a mayúsculas)
const normalizarTexto = (str: string): string => str.trim().replace(/\s+/g, ' ').toUpperCase();

// Generador seguro del siguiente código correlativo (Ej: ACT-00001)
export const generarSiguienteCodigoService = async (): Promise<string> => {
    const ultimo = await prisma.activo.findFirst({ orderBy: { id: 'desc' } });
    let num = 1;

    if (ultimo && ultimo.codInventario && ultimo.codInventario.includes('-')) {
        const partes = ultimo.codInventario.split('-');
        if (partes[1]) {
            const ultimoNumero = parseInt(partes[1], 10);
            if (!isNaN(ultimoNumero)) {
                num = ultimoNumero + 1;
            }
        }
    }
    return `ACT-${String(num).padStart(5, '0')}`;
};

// Listar todos los activos con su árbol de ubicación completo
export const obtenerActivosService = async () => {
    return await prisma.activo.findMany({
        include: {
            ambiente: {
                include: {
                    piso: {
                        include: {
                            pabellon: {
                                include: {
                                    sede: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { id: 'desc' }
    });
};

// Crear un activo manual (calcula el código al momento de guardar)
export const crearActivoService = async (data: CrearActivoInput) => {
    const codInventario = await generarSiguienteCodigoService();
    
    return await prisma.activo.create({
        data: {
            codInventario,
            sistema: normalizarTexto(data.sistema),
            dispositivo: normalizarTexto(data.dispositivo),
            marca: normalizarTexto(data.marca),
            modelo: normalizarTexto(data.modelo),
            serie: data.serie ? normalizarTexto(data.serie) : null,
            lote: data.lote ? normalizarTexto(data.lote) : null,
            ambienteId: data.ambienteId
        }
    });
};

// Importar activos masivamente resolviendo relaciones de texto a IDs reales
export const importarActivosExcelService = async (buffer: Buffer): Promise<number> => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("El archivo Excel no tiene hojas válidas");

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error(`No se pudo leer la hoja "${sheetName}"`);

    const data: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) throw new Error("El archivo Excel está vacío");

    let insertados = 0;

    // Obtenemos el punto de partida para el correlativo de códigos antes del bucle
    const ultimo = await prisma.activo.findFirst({ orderBy: { id: 'desc' } });
    let numCorrelativo = 1;

    if (ultimo && ultimo.codInventario && ultimo.codInventario.includes('-')) {
        const partes = ultimo.codInventario.split('-');
        if (partes[1]) {
            const ultimoNumero = parseInt(partes[1], 10);
            if (!isNaN(ultimoNumero)) {
                numCorrelativo = ultimoNumero + 1;
            }
        }
    }

    for (const row of data) {
        const sistemaRaw = row.Sistema?.toString().trim();
        const dispositivoRaw = row.Dispositivo?.toString().trim();
        const ambienteRaw = row.Ambiente?.toString().trim();

        if (!sistemaRaw || !dispositivoRaw || !ambienteRaw) continue;

        const nombreSistema = normalizarTexto(sistemaRaw);
        const nombreDispositivo = normalizarTexto(dispositivoRaw);
        const nombreAmbiente = normalizarTexto(ambienteRaw);

        const ambiente = await prisma.ambiente.findFirst({
            where: { nombre: nombreAmbiente }
        });

        if (!ambiente) continue;

        const codInventario = `ACT-${String(numCorrelativo).padStart(5, '0')}`;

        await prisma.activo.create({
            data: {
                codInventario,
                sistema: nombreSistema,
                dispositivo: nombreDispositivo,
                marca: row.Marca ? normalizarTexto(row.Marca.toString()) : 'S/M',
                modelo: row.Modelo ? normalizarTexto(row.Modelo.toString()) : 'S/M',
                serie: row.Serie ? normalizarTexto(row.Serie.toString()) : null,
                lote: row.Lote ? normalizarTexto(row.Lote.toString()) : null,
                ambienteId: ambiente.id
            }
        });

        numCorrelativo++;
        insertados++;
    }

    return insertados;
};