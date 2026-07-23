import ModuloLogin from "../../../components/ModuloLogin";
import { ShieldCheck } from 'lucide-react'; // Cambiamos el import

export default function AdministracionLogin() {
  return (
    <ModuloLogin
      moduloNombre="Acceso Administración Central"
      moduloIcon={<ShieldCheck size={40} />}
      moduloKey="administracion"
      redirectPath={(user) => {
        return "/administracion/dashboard";
      }}
    />
  );
}