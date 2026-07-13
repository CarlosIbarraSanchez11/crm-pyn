import ModuloLogin from "../../../components/ModuloLogin";
import { ClipboardCheck } from 'lucide-react';

export default function ProyectoLogin() {
  return (
    <ModuloLogin
  moduloNombre="Acceso Gestión de Proyectos"
  moduloIcon={<ClipboardCheck size={40} />}
  moduloKey="proyectos"
  redirectPath={(user) => {
    return "/proyectos/dashboard";

  }}
/>
  );
}