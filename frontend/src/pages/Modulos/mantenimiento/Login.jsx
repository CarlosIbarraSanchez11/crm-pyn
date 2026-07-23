import ModuloLogin from "../../../components/ModuloLogin";
import { Wrench } from 'lucide-react';

export default function MantenimientoLogin() {
  return (
    <ModuloLogin
  moduloNombre="Acceso Gestión de Mantenimiento"
  moduloIcon={<Wrench size={40} />}
  moduloKey="mantenimiento"
  redirectPath={(user) => {
    return "/mantenimiento/dashboard";

  }}
/>
  );
}