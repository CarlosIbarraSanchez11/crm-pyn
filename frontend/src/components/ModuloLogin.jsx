// src/components/ModuloLogin.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usuarios } from "../data/usuarios";
export default function ModuloLogin({
  moduloNombre,
  moduloIcon,
  moduloKey,
  redirectPath
}) {

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

 const handleSubmit = (e) => {

  e.preventDefault();

  setError("");
  setLoading(true);

  try {

    const usuario = usuarios.find(
      u =>
        u.correo === correo &&
        u.password === password
    );

    if (!usuario) {
      setError("Correo o contraseña incorrectos");
      return;
    }

    if (usuario.modulo !== moduloKey.toUpperCase()) {
      setError("No tienes acceso a este módulo");
      return;
    }

    localStorage.setItem(
      `${moduloKey}User`,
      JSON.stringify(usuario)
    );

    const finalRedirect =
      typeof redirectPath === "function"
        ? redirectPath(usuario)
        : redirectPath;

    navigate(finalRedirect);

  } catch (error) {

    console.log(error);
    setError("Ocurrió un error");

  } finally {

    setLoading(false);

  }

};

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#3a48da] to-[#263398] flex items-center justify-center p-4">

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">

          <div className="bg-[#3a48da] p-4 rounded-full mb-4">
            <div className="text-white">{moduloIcon}</div>
          </div>

          <h1 className="text-3xl font-bold text-[#3a48da]">
            {moduloNombre}
          </h1>

          <p className="text-gray-600 text-sm mt-2">
            Ingresa tus credenciales
          </p>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* CORREO */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Correo Electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a48da]"
              placeholder="admin@ips.com"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a48da]"
              placeholder="••••••••"
              required
            />
          </div>

          {/* BOTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3a48da] text-white font-bold py-2 rounded-lg hover:bg-[#263398] transition mt-6 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        {/* LINK */}
        <p className="text-center text-gray-600 text-sm mt-4">
          <a href="/" className="text-[#3a48da] hover:underline">
            Volver al inicio
          </a>
        </p>

      </div>

    </div>
  );
}