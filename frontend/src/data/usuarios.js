export const usuarios = [
  {
    id: 1,
    nombre: "Administrador",
    correo: "admin@ips.com",
    password: "123456",
    modulo: "ADMIN",
    rol: "Administrador",

    permisos: {
      modulos: [
        "Personal",
        "Contratos",
        "Calendario",
        "Configuración",
        "Capacitaciones"
      ],
      acciones: [
        "Crear",
        "Editar",
        "Eliminar"
      ]
    }
  },

  {
    id: 2,
    nombre: "RRHH",
    correo: "rrhh@ips.com",
    password: "123456",
    modulo: "RRHH",
    rol: "Usuario",

    permisos: {
      modulos: [
        "Personal",
        "Contratos",
        "Calendario",
        "Capacitaciones"
      ],
      acciones: [
        "Crear",
        "Editar"
      ]
    }
  },

  {
    id: 3,
    nombre: "SSOMA",
    correo: "ssoma@ips.com",
    password: "123456",
    modulo: "SSOMA",
    rol: "Usuario",

    permisos: {
      modulos: [
        "Calendario"
      ],
      acciones: [
        "Editar"
      ]
    }
  },

  {
    id: 4,
    nombre: "Asistencia",
    correo: "asistencia@ips.com",
    password: "123456",
    modulo: "ASISTENCIA",
    rol: "Usuario",

    permisos: {
      modulos: [
        "Calendario"
      ],
      acciones: []
    }
  },

  {
    id: 5,
    nombre: "Llaves",
    correo: "llaves@ips.com",
    password: "123456",
    modulo: "LLAVES",
    rol: "Usuario",

    permisos: {
      modulos: [
        "Calendario"
      ],
      acciones: [
        "Crear"
      ]
    }
  },

  {
    id: 6,
    nombre: "Gestor Proyectos",
    correo: "proyectos@ips.com",
    password: "123456",
    modulo: "PROYECTOS",
    rol: "Usuario",  
     permisos: {
      modulos: ["Resumen", "Proyectos", "Tareas", "Equipo", "Calendario"],
      acciones: ["Crear", "Editar", "Eliminar"]
    }
  }
];