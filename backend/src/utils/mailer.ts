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

  try {

    const info = await transporter.sendMail({

      from: `"RRHH P&P" <${process.env.SMTP_USER}>`,

      to: email,

      subject: "🎉 ¡Feliz cumpleaños!",

      html: `
        <div style="background:#f4f7fb;padding:40px;font-family:Segoe UI,Arial,sans-serif">

        <div style="max-width:650px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08)">

            <div style="background:rgb(23,37,76);padding:30px;text-align:center">

            <h1 style="color:#fff;margin:0">
                Recursos Humanos
            </h1>

            </div>

            <div style="padding:40px;text-align:center">

            <div style="font-size:70px">
                🎉
            </div>

            <h2 style="color:rgb(23,37,76);margin-bottom:10px">
                ¡Feliz cumpleaños!
            </h2>

            <h1 style="color:rgb(243,146,0);margin-top:0">
                ${nombre}
            </h1>

            <p style="color:#555;font-size:16px;line-height:28px">

                Todo el equipo de <b>P&P</b> te desea un día lleno de
                alegría, salud y muchos éxitos.

            </p>

            <div style="margin-top:35px;background:#FFF8ED;border-left:6px solid rgb(243,146,0);padding:18px;border-radius:10px">

                🎂 Que este nuevo año de vida esté lleno de oportunidades,
                crecimiento profesional y grandes momentos.

            </div>

            </div>

            <div style="background:#F5F7FA;padding:18px;text-align:center;color:#777;font-size:13px">

            ERP Recursos Humanos P&P

            </div>

        </div>

        </div>
        `

    });


    console.log("✅ Cumpleaños enviado");
    console.log("📧 Destino:", email);
    console.log("🆔 ID:", info.messageId);


    return true;


  } catch(error:any) {


    console.log(
      "❌ Error cumpleaños:",
      error.message
    );


    return false;

  }

};
export const enviarCorreoContratoNuevo = async (

  correoRRHH:string,

  empleado:string,

  tipo:string,

  inicio:string,

  fin:string

)=>{

  await transporter.sendMail({

    from:`"RRHH P&P" <${process.env.SMTP_USER}>`,

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

  try{


    const info = await transporter.sendMail({

      from:`"RRHH P&P" <${process.env.SMTP_USER}>`,

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


    console.log("✅ Contrato por vencer enviado");
    console.log("🆔 ID:",info.messageId);


    return true;


  }catch(error:any){


    console.log(
      "❌ Error contrato por vencer:",
      error.message
    );


    return false;

  }

};
export const enviarCorreoCapacitacion = async(

  email:string,

  nombre:string,

  capacitacion:string,

  fecha:string,

  hora:string

)=>{

  await transporter.sendMail({

    from:`"RRHH P&P" <${process.env.SMTP_USER}>`,

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

      from:`"RRHH P&P" <${process.env.SMTP_USER}>`,

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
export const enviarCorreoResumenContratos = async (

  correo:string,

  alertas:string[]

)=>{

try{


const info = await transporter.sendMail({

from:`"RRHH P&P" <${process.env.SMTP_USER}>`,

to:correo,

subject:"📄 Resumen de contratos RRHH",

html: `
<div style="background:#f4f7fb;padding:40px;font-family:Segoe UI,Arial,sans-serif">

<div style="max-width:700px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08)">

<div style="background:rgb(23,37,76);padding:30px">

<h1 style="margin:0;color:#fff;text-align:center">

Resumen de Contratos

</h1>

<p style="margin-top:8px;color:#D7DCEA;text-align:center">

Área de Recursos Humanos

</p>

</div>

<div style="padding:35px">

<p style="font-size:16px;color:#555">

Se detectaron las siguientes alertas:

</p>

${alertas.map(a=>`

<div style="background:#FAFAFA;
border-left:6px solid rgb(243,146,0);
padding:18px;
margin-bottom:15px;
border-radius:10px;
font-size:15px;
line-height:24px;
color:#333">

${a}

</div>

`).join("")}

<div style="margin-top:30px;padding:20px;background:#FFF8ED;border-radius:10px">

<b style="color:rgb(23,37,76)">
Importante
</b>

<p style="margin-top:10px;color:#555">

Revise estos contratos desde el módulo de Recursos Humanos para tomar las acciones correspondientes.

</p>

</div>

</div>

<div style="background:#F5F7FA;padding:18px;text-align:center;color:#777;font-size:13px">

ERP Recursos Humanos P&P © ${new Date().getFullYear()}

</div>

</div>

</div>
`

});


console.log(
"✅ Resumen enviado:",
correo,
info.messageId
);


}catch(error:any){

console.log(
"❌ Error resumen contratos:",
error.message
);


}


};
export const enviarCorreoAsistencia = async (
  correo: string,
  data: any
) => {

try {


const info = await transporter.sendMail({

from:
`"RRHH P&P" <${process.env.SMTP_USER}>`,

to: correo,

subject:"📍 Registro de asistencia",


html:`

<div style="background:#f4f7fb;padding:40px;font-family:Segoe UI,Arial,sans-serif">

<div style="
max-width:700px;
margin:auto;
background:#fff;
border-radius:18px;
overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,.08)
">


<!-- HEADER -->

<div style="
background:rgb(23,37,76);
padding:30px;
">

<h1 style="
margin:0;
color:#fff;
text-align:center;
">

Registro de Asistencia

</h1>


<p style="
margin-top:8px;
color:#D7DCEA;
text-align:center;
">

Área de Recursos Humanos

</p>


</div>



<!-- CONTENIDO -->

<div style="padding:35px">


<p style="
font-size:16px;
color:#555;
">

Se ha registrado una nueva asistencia en el sistema.

</p>



<div style="
background:#FAFAFA;
border-left:6px solid rgb(243,146,0);
padding:20px;
margin-top:20px;
border-radius:10px;
font-size:15px;
line-height:26px;
color:#333;
">


<p>
<b>Empleado:</b> ${data.empleado}
</p>


<p>
<b>Tipo:</b> ${data.tipo}
</p>


<p>
<b>Fecha:</b> ${data.fecha}
</p>


<p>
<b>Hora:</b> ${data.hora}
</p>


<p>
<b>Latitud:</b> ${data.latitud}
</p>


<p>
<b>Longitud:</b> ${data.longitud}
</p>


</div>




<div style="
margin-top:30px;
padding:20px;
background:#FFF8ED;
border-radius:10px;
text-align:center;
">


<h3 style="
color:rgb(23,37,76);
">

📸 Foto evidencia

</h3>



${
data.foto
?
`
<img 
src="cid:fotoAsistencia"
style="
width:300px;
border-radius:12px;
margin-top:15px;
"
/>
`
:
`
<p style="color:#777">
No se adjuntó foto de evidencia.
</p>
`
}



</div>



</div>



<!-- FOOTER -->

<div style="
background:#F5F7FA;
padding:18px;
text-align:center;
color:#777;
font-size:13px;
">

ERP Recursos Humanos P&P © ${new Date().getFullYear()}

</div>



</div>

</div>

`,



attachments:
data.foto
?
[
{
filename:"evidencia.jpg",

path:data.foto,

cid:"fotoAsistencia",

contentType:"image/jpeg"

}
]
:
[]


});



console.log(
"✅ Correo asistencia enviado:",
correo,
info.messageId
);



return true;


}catch(error:any){


console.log(
"❌ Error correo asistencia:",
error.message
);


return false;


}

};