import multer from "multer";
import fs from "fs";
import path from "path";


const storage = multer.diskStorage({

destination:(req,file,cb)=>{


let dir =
"uploads/rrhh/registro";


// EMPLEADOS
if(
req.originalUrl.includes("/empleados")
){

dir =
"uploads/rrhh/registro";

}


// CAPACITACIONES
if(
req.originalUrl.includes("/capacitaciones")
){

dir =
"uploads/rrhh/capacitaciones";

}



if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}


cb(null,dir);


},



filename:(req,file,cb)=>{


const extension =
path.extname(file.originalname);


const nombre =
`${Date.now()}${extension}`;


cb(null,nombre);


}


});



export const upload = multer({

storage,


limits:{
fileSize:10 * 1024 * 1024
},



fileFilter:(req,file,cb)=>{


const permitidos=[

"image/jpeg",
"image/png",
"image/jpg",
"application/pdf"

];


if(
permitidos.includes(file.mimetype)
){

cb(null,true);


}else{


cb(
new Error(
"Solo se permiten imágenes JPG, PNG o PDF"
)
);


}


}


});