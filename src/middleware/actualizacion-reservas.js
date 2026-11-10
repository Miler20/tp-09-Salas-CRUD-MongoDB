const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];
const estadosPermitidos = ["pendiente", "confirmada"];
const camposPut = [
  "estudiante",
  "email",
  "sala",
  "fecha",
  "turno",
  "personas",
  "estado",
];
const camposPatch = ["personas", "estado"];

function esObjetoPlano(valor) {
  return (
    valor !== null &&
    typeof valor === "object" &&
    !Array.isArray(valor) &&
    (Object.getPrototypeOf(valor) === Object.prototype ||
      Object.getPrototypeOf(valor) === null)
  );
}

function validarPersonas(valor) {
  const tipoValido =
    typeof valor === "number" ||
    (typeof valor === "string" && valor.trim() !== "");
  if (!tipoValido) return null;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || !Number.isInteger(numero)) return null;
  if (numero < 1 || numero > 6) return null;
  return numero;
}

function validarCamposCompletos(datos) {
  if (!esObjetoPlano(datos)) return null;
  const claves = Object.keys(datos);
  if (
    claves.length !== camposPut.length ||
    claves.some((campo) => !camposPut.includes(campo)) ||
    camposPut.some((campo) => !Object.hasOwn(datos, campo))
  ) {
    return null;
  }

  const estudiante =
    typeof datos.estudiante === "string" ? datos.estudiante.trim() : "";
  const email = typeof datos.email === "string" ? datos.email.trim() : "";
  const sala = typeof datos.sala === "string" ? datos.sala.trim() : "";
  const fecha = typeof datos.fecha === "string" ? datos.fecha.trim() : "";
  const turno = typeof datos.turno === "string" ? datos.turno.trim() : "";
  const personas = validarPersonas(datos.personas);
  const estado = datos.estado;

  if (
    !estudiante ||
    !email.includes("@") ||
    !salasPermitidas.includes(sala) ||
    !fecha ||
    !turnosPermitidos.includes(turno) ||
    personas === null ||
    !estadosPermitidos.includes(estado)
  ) {
    return null;
  }

  return { estudiante, email, sala, fecha, turno, personas, estado };
}

function validarCamposParciales(datos) {
  if (!esObjetoPlano(datos)) return null;
  const claves = Object.keys(datos);
  if (
    claves.length === 0 ||
    claves.some((campo) => !camposPatch.includes(campo))
  ) {
    return null;
  }

  const resultado = {};
  if (Object.hasOwn(datos, "personas")) {
    const personas = validarPersonas(datos.personas);
    if (personas === null) return null;
    resultado.personas = personas;
  }
  if (Object.hasOwn(datos, "estado")) {
    if (!estadosPermitidos.includes(datos.estado)) return null;
    resultado.estado = datos.estado;
  }
  return resultado;
}

function responderEntradaInvalida(req, res, next, datos, validador) {
  const resultado = validador(datos);
  if (!resultado) {
    return res.status(400).json({
      error: "Cuerpo inválido. Revisá los campos permitidos y sus valores.",
    });
  }
  req.datosActualizacion = resultado;
  next();
}

function validarPutReserva(req, res, next) {
  return responderEntradaInvalida(
    req,
    res,
    next,
    req.body,
    validarCamposCompletos,
  );
}

function validarPatchReserva(req, res, next) {
  return responderEntradaInvalida(
    req,
    res,
    next,
    req.body,
    validarCamposParciales,
  );
}

module.exports = {
  validarPutReserva,
  validarPatchReserva,
  validarCamposCompletos,
  validarCamposParciales,
  validarPersonas,
};
