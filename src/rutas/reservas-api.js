const express = require("express");
const { validarReserva } = require("../middleware/reservas");
const {
  validarPutReserva,
  validarPatchReserva,
} = require("../middleware/actualizacion-reservas");

function crearRouterReservasApi(controlador) {
  const router = express.Router();
  router.get("/", controlador.listarApi);
  router.get("/:id", controlador.obtenerApi);
  router.post("/", validarReserva, controlador.crearApi);
  router.put("/:id", validarPutReserva, controlador.reemplazarApi);
  router.patch("/:id", validarPatchReserva, controlador.modificarApi);
  router.delete("/:id", controlador.eliminarApi);
  return router;
}

module.exports = { crearRouterReservasApi };
