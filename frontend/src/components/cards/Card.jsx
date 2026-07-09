export default function Card({ titulo, icon, link }) {
  // Clases actualizadas con el nuevo color naranja #F39200
  const cardStyles = `
    group flex flex-col justify-between items-center h-full min-h-[180px] md:min-h-[220px]
    p-6 md:p-8 border-2 border-gray-100 rounded-2xl bg-white
    transition-all duration-300 shadow-md
    hover:-translate-y-2 hover:border-[#F39200] hover:shadow-2xl
  `;

  const iconStyles = `
    text-gray-700 mb-4 md:mb-6 transition-all duration-300
    group-hover:scale-110 group-hover:text-[#F39200]
  `;

  // BOTÓN CON COLOR AZUL CORPORATIVO
  const buttonStyles = `
    mt-4 px-6 py-3 w-[90%] md:w-auto text-center rounded-full
    bg-blue-950 text-white text-[10px] md:text-[11px] font-black
    uppercase tracking-widest transition-all duration-300
    group-hover:bg-[#F39200] group-hover:text-white shadow-sm
  `;

  return (
    <a href={link} className={cardStyles}>
      <div className="flex-grow flex flex-col justify-center items-center w-full">
        <div className={iconStyles}>
          {icon}
        </div>

        <h3 className="text-gray-800 font-black text-base md:text-lg text-center leading-tight">
          {titulo}
        </h3>
      </div>

      <div className={buttonStyles}>
        Ingresar al Módulo
      </div>
    </a>
  );
}