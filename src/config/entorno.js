function leerConfiguracion(entorno = process.env) {
  const puerto = Number(entorno.PORT ?? 3000);

  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535");
  }

  const formatoRegistro =
    entorno.NODE_ENV === "production" ? "combined" : "dev";

  return { puerto, formatoRegistro };
}

function leerUriMongo(entorno = process.env) {
  const uri = entorno.MONGODB_URI;
  if (!uri || !uri.startsWith("mongodb+srv://")) {
    throw new Error("Falta MONGODB_URI o su formato no es correcto.");
  }
  return uri;
}

module.exports = { leerConfiguracion, leerUriMongo };
