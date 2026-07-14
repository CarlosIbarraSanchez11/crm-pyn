import ModuloLogin from "../../../components/ModuloLogin";
import { Users } from "lucide-react";

export default function RRHHLogin() {

  return (
    <ModuloLogin
      moduloNombre="Acceso RRHH"
      moduloIcon={<Users size={40}/>}
      moduloKey="RRHH"
      redirectPath="/rrhh/dashboard"
    />
  );

}