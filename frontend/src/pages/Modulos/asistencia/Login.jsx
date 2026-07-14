import ModuloLogin from "../../../components/ModuloLogin";
import { Users } from 'lucide-react';

export default function AsistenciaLogin() {
  return (
    <ModuloLogin
  moduloNombre="Acceso Asistencia"
  moduloIcon={<Users size={40} />}
  moduloKey="asistencia"
  redirectPath={(user) => {
    return "/asistencia/dashboard";

  }}
/>
  );
}