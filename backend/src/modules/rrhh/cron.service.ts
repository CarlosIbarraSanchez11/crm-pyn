import cron from "node-cron";
import { prisma } from "../../config/prisma";

import {
  enviarCorreoCumpleanos,
  enviarCorreoContratoPorVencer,
  enviarCorreoCapacitacion
} from "../../utils/mailer";

export const iniciarCron = () => {

  cron.schedule("0 8 * * *", async () => {

    console.log("🔄 Revisando eventos...");

    await revisarCumpleanos();

    await revisarContratos();

    await revisarCapacitaciones();

  });

};
const revisarCumpleanos = async () => {

  const hoy = new Date();

  const empleados = await prisma.empleado.findMany();

  for (const emp of empleados) {

    if (!emp.email) continue;

    const cumple = new Date(emp.fechaNacimiento);

    if (

      cumple.getDate() === hoy.getDate() &&

      cumple.getMonth() === hoy.getMonth()

    ) {

      await enviarCorreoCumpleanos(

        emp.email,

        `${emp.nombres} ${emp.apellidos}`

      );

      console.log("🎂 Cumpleaños enviado:", emp.nombres);

    }

  }

};
const revisarContratos = async () => {

  const config = await prisma.configuracion.findUnique({

    where: {

      id: 1

    }

  });

  if (!config) return;

  const contratos = await prisma.contrato.findMany({

    include: {

      empleado: true

    }

  });

  const hoy = new Date();

  for (const contrato of contratos) {

    if (!contrato.fechaFin) continue;

    const diferencia =

      Math.ceil(

        (

          contrato.fechaFin.getTime()

          -

          hoy.getTime()

        )

        /

        (1000 * 60 * 60 * 24)

      );

    if (diferencia === config.diasContrato) {

      await enviarCorreoContratoPorVencer(

        config.correo,

        `${contrato.empleado.nombres} ${contrato.empleado.apellidos}`,

        contrato.fechaFin.toLocaleDateString(),

        diferencia

      );

      console.log("📄 Contrato por vencer");

    }

  }

};
const revisarCapacitaciones = async () => {

  const config = await prisma.configuracion.findUnique({

    where: {

      id: 1

    }

  });

  if (!config) return;

  const capacitaciones = await prisma.capacitacion.findMany({

    include: {

      empleados: {

        include: {

          empleado: true

        }

      }

    }

  });

  const hoy = new Date();

  for (const cap of capacitaciones) {

    const dias =

      Math.ceil(

        (

          cap.fecha.getTime()

          -

          hoy.getTime()

        )

        /

        (1000 * 60 * 60 * 24)

      );

    if (dias === config.diasCapacitacion) {

      for (const participante of cap.empleados) {

        if (!participante.empleado.email) continue;

        await enviarCorreoCapacitacion(

          participante.empleado.email,

          participante.empleado.nombres,

          cap.nombre,

          cap.fecha.toLocaleDateString(),

          cap.hora

        );

      }

      console.log("📚 Capacitación enviada");

    }

  }

};