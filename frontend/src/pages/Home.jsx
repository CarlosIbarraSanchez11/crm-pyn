import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import WhatsappButton from '../components/layout/WhatsappButton'
import ContactForm from '../components/forms/ContactForm'
import Card from '../components/cards/Card'

import {
  ClipboardCheck,
  Users,
  Clock,
  Wrench,
  AlertCircle
} from 'lucide-react'
import logoEmpresa from '../assets/logo-pyn.png';

// Nuevos módulos para la empresa P&P
const modulos = [
  { id: 1, titulo: "Gestión de Proyectos", icon: <ClipboardCheck size={42} />, link: "/proyectos" },
  { id: 2, titulo: "Recursos Humanos (RRHH)", icon: <Users size={42} />, link: "/rrhh" },
  { id: 3, titulo: "Control de Asistencia", icon: <Clock size={42} />, link: "/asistencia" },
  { id: 4, titulo: "Gestión de Mantenimiento", icon: <Wrench size={42} />, link: "/mantenimiento" },
];

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col w-full overflow-x-hidden">

      {/* NAVBAR */}
      <section className="w-full">
        <Navbar />
      </section>

      {/* MAIN */}
      <main className="flex-grow flex flex-col items-center w-full pt-10 md:pt-14">

        {/* LOGO Y TITULO */}
        <div className="text-center mb-10 md:mb-14 px-4 w-full max-w-[1200px]">
          <div className="flex justify-center mb-6">
            <img 
              src={logoEmpresa} /* Asegúrate de cambiar el nombre al logo de P&P */
              alt="Logo Empresa" 
              className="h-28 md:h-40 object-contain"
            />
          </div>

          <h2 className="text-[#F39200] text-sm md:text-2xl font-black uppercase tracking-widest">
            Sistema de Gestión Integral
          </h2>
        </div>

        {/* CARDS: Grid modificado para ser de 2 en 2 en pantallas grandes (md:grid-cols-2) */}
        <div className="w-full max-w-[900px] px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {modulos.map((card) => (
              <Card
                key={card.id}
                titulo={card.titulo}
                icon={card.icon}
                link={card.link}
              />
            ))}
          </div>
        </div>

      </main>

      {/* CONTACTO */}
      <section className="w-full">
        <ContactForm />
      </section>

      {/* FOOTER */}
      <section className="w-full">
        <Footer />
      </section>

      {/* WHATSAPP */}
      <WhatsappButton />

      {/* BOTON FLOTANTE (Opcional, puedes cambiar 'Brigadista' por otra cosa) */}
      <a
        href="#"
        className="
          hidden md:flex fixed bottom-6 left-0 z-50
          items-center gap-3
          bg-[#F39200] 
          text-white 
          py-3 px-6
          rounded-r-2xl
          shadow-xl
          hover:bg-[#d88100]
          transition-all duration-300
          group
          border-y border-r border-black/10
        "
      >
        <AlertCircle
          size={30}
          className="group-hover:scale-110 transition-transform text-white"
        />

        <div className="flex flex-col leading-tight text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
            Atención al
          </span>
          <span className="text-sm font-black uppercase text-white">
            Cliente
          </span>
        </div>
      </a>

    </div>
  )
}