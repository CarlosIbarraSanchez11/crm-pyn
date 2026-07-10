import ModuloLogin from "../../../components/ModuloLogin";
import { Users } from 'lucide-react';

export default function RRRHHLogin() {
  return (
    <ModuloLogin
  moduloNombre="Acceso RRHH"
  moduloIcon={<Users size={40} />}
  moduloKey="rrhh"
  redirectPath={(user) => {
    return "/rrhh/dashboard";

  }}
/>
  );
}