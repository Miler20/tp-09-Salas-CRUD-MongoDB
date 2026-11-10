const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reserva");

function representar(documento) {
  return {
    id: documento._id.toString(),
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}

function crearServicioReservasMongo() {
  function validarId(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
      const error = new Error("ID inválido");
      error.codigo = "ID_INVALIDO";
      throw error;
    }
  }

  async function listarReservas() {
    const documentos = await Reserva.find().lean();
    return documentos.map(representar);
  }

  async function contarReservas() {
    return Reserva.countDocuments();
  }

  async function buscarReservaPorId(id) {
    validarId(id);
    const documento = await Reserva.findById(id).lean();
    return documento ? representar(documento) : null;
  }

  async function crearReserva(datos) {
    const documento = await Reserva.create({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    });
    return representar(documento);
  }

  async function reemplazarReserva(id, datos) {
    validarId(id);
    const documento = await Reserva.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          estudiante: datos.estudiante,
          email: datos.email,
          sala: datos.sala,
          fecha: datos.fecha,
          turno: datos.turno,
          personas: datos.personas,
          estado: datos.estado,
        },
      },
      {
        new: true,
        runValidators: true,
        upsert: false,
      },
    ).lean();
    return documento ? representar(documento) : null;
  }

  async function modificarReserva(id, datos) {
    validarId(id);
    const documento = await Reserva.findOneAndUpdate(
      { _id: id },
      { $set: datos },
      {
        new: true,
        runValidators: true,
        upsert: false,
      },
    ).lean();
    return documento ? representar(documento) : null;
  }

  async function eliminarReserva(id) {
    validarId(id);
    const documento = await Reserva.findByIdAndDelete(id).lean();
    return documento ? representar(documento) : null;
  }

  return {
    listarReservas,
    contarReservas,
    buscarReservaPorId,
    crearReserva,
    reemplazarReserva,
    modificarReserva,
    eliminarReserva,
  };
}

module.exports = { crearServicioReservasMongo };
