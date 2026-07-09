import {
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaLocationDot,
  FaEnvelope,
  FaClock,
} from "react-icons/fa6";
import logoEmpresa from '../../assets/logo-pyn.png';

export default function Footer() {
  return (
    // Aplicamos el gradiente lineal idéntico al Navbar
    <footer className="w-full bg-gradient-to-r from-[#FFAB40] to-[#F39200] text-white pt-12 pb-8 shadow-inner">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">

          {/* LOGO: Conectado con la identidad visual del Navbar */}
          <div className="bg-white px-5 py-5 rounded-br-[2.5rem] rounded-tl-[1rem] shadow-xl flex items-center justify-center">
            <img
              src={logoEmpresa}/* Asegúrate de que apunte al logo de P&P */
              alt="Logo P&P Ingenieros"
              className="h-[60px] object-contain"
            />
          </div>

          {/* INFORMACIÓN DE CONTACTO */}
          <div className="flex flex-col gap-5 text-sm md:text-base text-white/90 font-medium">

            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm">
                <FaLocationDot className="text-white text-lg" />
              </div>
              <span>Sede Principal: Av. Alfredo Mendiola 6062, Los Olivos.</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm">
                <FaEnvelope className="text-white text-lg" />
              </div>
              <a
                href="mailto:contacto@pypingenieros.com"
                className="hover:text-black transition-colors duration-300 font-bold"
              >
                contacto@pypingenieros.com
              </a>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm">
                <FaClock className="text-white text-lg" />
              </div>
              <span>Lunes a viernes de 9:00 a.m. a 6:00 p.m.</span>
            </div>

          </div>
        </div>

        {/* LÍNEA DIVISORIA */}
        <hr className="border-white/20 mb-6" />

        {/* COPYRIGHT + REDES SOCIALES */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="text-white/90 text-sm font-bold tracking-wide uppercase">
            © 2026 - P&P Ingenieros | Todos los derechos reservados
          </div>

          {/* ÍCONOS DE REDES SOCIALES (Efecto Inverso al pasar el mouse) */}
          <div className="flex gap-4 text-lg">
            
            <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-[#d96600] hover:scale-110 transition-all duration-300 shadow-sm">
              <FaLinkedinIn />
            </a>

            <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-[#d96600] hover:scale-110 transition-all duration-300 shadow-sm">
              <FaInstagram />
            </a>

            <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-[#d96600] hover:scale-110 transition-all duration-300 shadow-sm">
              <FaFacebookF />
            </a>

            <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-[#d96600] hover:scale-110 transition-all duration-300 shadow-sm">
              <FaTwitter />
            </a>

            <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-[#d96600] hover:scale-110 transition-all duration-300 shadow-sm">
              <FaYoutube />
            </a>

            <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-[#d96600] hover:scale-110 transition-all duration-300 shadow-sm">
              <FaTiktok />
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
}