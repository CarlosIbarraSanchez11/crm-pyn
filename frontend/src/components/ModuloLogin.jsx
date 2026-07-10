// src/components/ModuloLogin.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usuarios } from "../data/usuarios";

export default function ModuloLogin({
  moduloNombre,
  moduloIcon,
  moduloKey,
  redirectPath,
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
        (u) => u.correo === correo && u.password === password
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
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#172554] via-[#1E3A8A] to-[#F39200] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#172554] p-5 rounded-full shadow-lg mb-4">
            <div className="text-white">{moduloIcon}</div>
          </div>

          <h1 className="text-3xl font-bold text-[#172554] text-center">
            {moduloNombre}
          </h1>

          <p className="text-gray-500 text-sm mt-2 text-center">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ERROR */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* CORREO */}
          <div>
            <label className="block text-sm font-semibold text-[#172554] mb-2">
              Correo Electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@ips.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#F39200] focus:border-[#F39200]"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-[#172554] mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#F39200] focus:border-[#F39200]"
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#172554] hover:bg-[#0F1E4F] text-white font-bold py-3 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* LINK */}
        <p className="text-center text-gray-600 text-sm mt-6">
          <a
            href="/"
            className="font-semibold text-[#F39200] hover:text-[#172554] transition-colors"
          >
            Volver al inicio
          </a>
        </p>
      </div>
    </div>
  );
}