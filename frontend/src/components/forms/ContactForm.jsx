import Swal from "sweetalert2";

export default function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();

    Swal.fire({
      icon: "success",
      title: "¡Enviado!",
      text: "Correo enviado satisfactoriamente",
      confirmButtonColor: "#F39200", // Color naranja de P&P
    });
  };

  return (
    // Aplicamos el mismo gradiente lineal del Navbar y Footer
    <section className="w-full bg-gradient-to-r from-[#FFAB40] to-[#F39200] text-white py-14 px-6 border-t border-white/10">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-16">

        {/* IZQUIERDA - Textos en blanco para contrastar con el naranja */}
        <div className="flex flex-col justify-start">

          <h2 className="text-4xl font-black mb-12 uppercase tracking-tight drop-shadow-sm">
            Contáctanos
          </h2>

          <div className="mb-12">
            <p className="text-sm mb-2 font-bold uppercase tracking-widest text-white/80">
              Ventas y Consultas
            </p>

            <h3 className="text-4xl font-black tracking-tight drop-shadow-sm">
              968 403 485
            </h3>
          </div>

          <div>
            <p className="text-sm mb-2 font-bold uppercase tracking-widest text-white/80">
              Soporte Técnico
            </p>

            <h3 className="text-4xl font-black leading-tight tracking-tight drop-shadow-sm">
              954 712 026
            </h3>

            <p className="text-lg font-medium mt-2 text-white/90">
              Atención a nivel nacional
            </p>
          </div>

        </div>

        {/* DERECHA - Formulario con estilo Glassmorphism (Vidrio esmerilado) */}
        <div className="bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md">

          <h2 className="text-2xl font-black uppercase mb-8 border-b-2 border-white/20 pb-4">
            Envíanos un mensaje
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/90">
                  Nombres
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-12 bg-white border-none text-black px-4 rounded-xl outline-none focus:ring-4 focus:ring-black/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/90">
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-12 bg-white border-none text-black px-4 rounded-xl outline-none focus:ring-4 focus:ring-black/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/90">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full h-12 bg-white border-none text-black px-4 rounded-xl outline-none focus:ring-4 focus:ring-black/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/90">
                  Celular
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-12 bg-white border-none text-black px-4 rounded-xl outline-none focus:ring-4 focus:ring-black/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/90">
                Mensaje
              </label>
              <textarea
                rows="4"
                required
                className="w-full bg-white border-none text-black px-4 py-3 rounded-xl outline-none resize-none focus:ring-4 focus:ring-black/20 transition-all shadow-inner"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white px-10 py-4 rounded-xl uppercase font-black tracking-widest hover:bg-black hover:text-[#F39200] active:scale-95 transition-all duration-300 shadow-xl mt-4"
            >
              Enviar Mensaje
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}