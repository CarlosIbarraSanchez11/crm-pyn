// src/utils/mailer.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});
export const enviarCorreoCumpleanos = async (
  email: string,
  nombre: string
) => {

  await transporter.sendMail({

    from: `"RRHH PYP" <${process.env.SMTP_USER}>`,

    to: email,

    subject: "🎉 ¡Feliz cumpleaños!",

    html: `
      <div style="font-family:Arial;padding:20px">

        <h2 style="color:#F39200">
          ¡Feliz cumpleaños ${nombre}! 🎂
        </h2>

        <p>
          Todo el equipo de PYP te desea un excelente día.
        </p>

        <p>
          Que tengas muchos éxitos y disfrutes este día.
        </p>

        <br>

        <b>Área de Recursos Humanos</b>

      </div>
    `

  });

};
export const enviarCorreoContratoNuevo = async (

  correoRRHH:string,

  empleado:string,

  tipo:string,

  inicio:string,

  fin:string

)=>{

  await transporter.sendMail({

    from:`"RRHH PYP" <${process.env.SMTP_USER}>`,

    to:correoRRHH,

    subject:"📄 Nuevo contrato registrado",

    html:`

      <h2>Nuevo contrato</h2>

      <p><b>Empleado:</b> ${empleado}</p>

      <p><b>Tipo:</b> ${tipo}</p>

      <p><b>Inicio:</b> ${inicio}</p>

      <p><b>Fin:</b> ${fin}</p>

    `

  });

};
export const enviarCorreoContratoPorVencer = async(

  correoRRHH:string,

  empleado:string,

  fechaFin:string,

  dias:number

)=>{

  await transporter.sendMail({

    from:`"RRHH PYP" <${process.env.SMTP_USER}>`,

    to:correoRRHH,

    subject:"⚠ Contrato por vencer",

    html:`

      <h2>Contrato próximo a vencer</h2>

      <p>

      El contrato del trabajador

      <b>${empleado}</b>

      vence el

      <b>${fechaFin}</b>

      </p>

      <p>

      Restan

      <b>${dias} días</b>

      </p>

    `

  });

};
export const enviarCorreoCapacitacion = async(

  email:string,

  nombre:string,

  capacitacion:string,

  fecha:string,

  hora:string

)=>{

  await transporter.sendMail({

    from:`"RRHH PYP" <${process.env.SMTP_USER}>`,

    to:email,

    subject:"📚 Recordatorio de capacitación",

    html:`

      <h2>Capacitación programada</h2>

      <p>

      Hola ${nombre}

      </p>

      <p>

      Tiene una capacitación programada.

      </p>

      <p>

      <b>${capacitacion}</b>

      </p>

      <p>

      Fecha: ${fecha}

      </p>

      <p>

      Hora: ${hora}

      </p>

    `

  });

};
export const enviarCorreoContratoVencido = async (

  correoRRHH:string,

  empleado:string,

  fecha:string

)=>{

  try{

    await transporter.sendMail({

      from:`"RRHH PYP" <${process.env.SMTP_USER}>`,

      to:correoRRHH,

      subject:"🚨 Contrato vencido",

      html:`

        <h2>Contrato vencido</h2>

        <p>

        El contrato del trabajador

        <b>${empleado}</b>

        venció el

        <b>${fecha}</b>

        </p>

      `

    });

  }catch(error:any){

    console.log(error.message);

  }

};