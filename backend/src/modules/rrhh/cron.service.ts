import cron from "node-cron";
import { prisma } from "../../config/prisma";

import {
  enviarCorreoCumpleanos,
  enviarCorreoContratoPorVencer,
  enviarCorreoCapacitacion,
  enviarCorreoResumenContratos
} from "../../utils/mailer";

export const iniciarCron = () => {

cron.schedule("0 8 * * *", async () => {
        try {

      console.log("🔄 Revisando eventos...");

      await revisarCumpleanos();

      await revisarContratos();

      await revisarCapacitaciones();

      console.log("✅ Revisión terminada");

    } catch(error:any){

      console.log(
        "❌ Error en cron:",
        error.message
      );

    }

  });

};
const revisarCumpleanos = async () => {

  const hoy = new Date();


  const diaHoy = hoy.getDate();
  const mesHoy = hoy.getMonth();


  const empleados = await prisma.empleado.findMany();


  console.log("Empleados encontrados:", empleados.length);


  for (const emp of empleados) {


    if (!emp.email) {
      console.log(
        "Sin correo:",
        emp.nombres
      );
      continue;
    }


    const fecha = new Date(emp.fechaNacimiento);


    const diaCumple = fecha.getUTCDate();

    const mesCumple = fecha.getUTCMonth();


    console.log(
      emp.nombres,
      "cumple:",
      diaCumple,
      mesCumple,
      "hoy:",
      diaHoy,
      mesHoy
    );


    if (
  diaCumple === diaHoy &&
  mesCumple === mesHoy
) {


  // EVITAR ENVIAR VARIAS VECES EL MISMO AÑO

  if(emp.ultimoCumpleCorreo){


    const yaEnviado = 
      emp.ultimoCumpleCorreo.getFullYear()
      ===
      hoy.getFullYear();


    if(yaEnviado){

      console.log(
        "⏭️ Ya enviado este año:",
        emp.nombres
      );

      continue;

    }

  }



  await enviarCorreoCumpleanos(

    emp.email,

    `${emp.nombres} ${emp.apellidos}`

  );

  await prisma.empleado.update({

    where:{
      id: emp.id
    },

    data:{
      ultimoCumpleCorreo: hoy
    }

  });

  console.log(
    "🎂 Cumpleaños enviado:",
    emp.nombres
  );


}

  }


};
const soloFecha = (fecha: Date) => {
  const fechaPeru = new Date(
    fecha.toLocaleString("en-US", {
      timeZone: "America/Lima",
    })
  );

  const año = fechaPeru.getFullYear();
  const mes = String(fechaPeru.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaPeru.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
};

// SOLO para fechas que vienen de la BD
const soloFechaBD = (fecha: Date) => {
  const año = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getUTCDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
};
const revisarContratos = async () => {

  const contratos = await prisma.contrato.findMany({
    include: {
      empleado: true
    },
    where: {
      estado: "Activo"
    }
  });

  // Fecha actual (Perú)
  const hoy = soloFecha(new Date());

  let alertas: string[] = [];

  for (const contrato of contratos) {

    // Fechas obtenidas desde la BD
    const inicio = soloFechaBD(contrato.fechaInicio);

    console.log(
      "Contrato:",
      contrato.empleado.nombres,
      "inicio:",
      inicio,
      "hoy:",
      hoy
    );

    if (inicio === hoy) {
      alertas.push(
        `🟢 ${contrato.empleado.nombres} ${contrato.empleado.apellidos} inicia contrato hoy`
      );
    }

    if (contrato.fechaFin) {

      const fin = soloFechaBD(contrato.fechaFin);

      const dias = Math.ceil(
        (
          new Date(fin).getTime() -
          new Date(hoy).getTime()
        ) /
        (1000 * 60 * 60 * 24)
      );

      if (dias === 0) {
        alertas.push(
          `🔴 ${contrato.empleado.nombres} ${contrato.empleado.apellidos} vence contrato HOY`
        );
      }

      if (dias === 1 || dias === 2 || dias === 3) {
        alertas.push(
          `⚠️ ${contrato.empleado.nombres} ${contrato.empleado.apellidos} vence contrato en ${dias} días`
        );
      }

    }

  }

  console.log(alertas);
if (alertas.length > 0) {

  const usuariosRRHH = await prisma.user.findMany({
    where: {
      rol: "ADMIN",
      modulo: "RRHH"
    }
  });

  for (const usuario of usuariosRRHH) {

    if (!usuario.correo) continue;

    await enviarCorreoResumenContratos(
      usuario.correo,
      alertas
    );

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

  const fechaPeru = new Date(
  new Date().toLocaleString(
    "en-US",
    {
      timeZone:"America/Lima"
    }
  )
);


const hoy = fechaPeru;

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