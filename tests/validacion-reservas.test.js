const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validarCamposCompletos,
  validarCamposParciales,
  validarPersonas,
} = require("../src/middleware/actualizacion-reservas");

const reservaCompleta = {
  estudiante: " Ana Ejemplo ",
  email: " ana@example.com ",
  sala: "Sala Norte",
  fecha: "2026-10-28",
  turno: "Mañana",
  personas: "2",
  estado: "confirmada",
};

test("PUT acepta los siete campos y normaliza textos y personas", () => {
  assert.deepEqual(validarCamposCompletos(reservaCompleta), {
    estudiante: "Ana Ejemplo",
    email: "ana@example.com",
    sala: "Sala Norte",
    fecha: "2026-10-28",
    turno: "Mañana",
    personas: 2,
    estado: "confirmada",
  });
});

test("PUT rechaza campos faltantes, extra, _id y operadores", () => {
  const incompleta = { ...reservaCompleta };
  delete incompleta.estado;
  assert.equal(validarCamposCompletos(incompleta), null);
  assert.equal(
    validarCamposCompletos({ ...reservaCompleta, extra: "no permitido" }),
    null,
  );
  assert.equal(
    validarCamposCompletos({ ...reservaCompleta, _id: "123" }),
    null,
  );
  assert.equal(
    validarCamposCompletos({ ...reservaCompleta, $set: { personas: 3 } }),
    null,
  );
});

test("PATCH acepta solamente personas y/o estado", () => {
  assert.deepEqual(validarCamposParciales({ personas: "3" }), {
    personas: 3,
  });
  assert.deepEqual(validarCamposParciales({ estado: "pendiente" }), {
    estado: "pendiente",
  });
  assert.deepEqual(
    validarCamposParciales({ personas: 4, estado: "confirmada" }),
    {
      personas: 4,
      estado: "confirmada",
    },
  );
});

test("PATCH rechaza cuerpo vacío, campos extra y operadores", () => {
  assert.equal(validarCamposParciales({}), null);
  assert.equal(validarCamposParciales({ email: "x@example.com" }), null);
  assert.equal(validarCamposParciales({ _id: "123" }), null);
  assert.equal(
    validarCamposParciales({ $set: { estado: "confirmada" } }),
    null,
  );
});

test("personas acepta enteros de 1 a 6 y rechaza valores inseguros", () => {
  for (const valor of [1, 2, 3, 4, 5, 6, "1", "6"]) {
    assert.equal(validarPersonas(valor), Number(valor));
  }
  for (const valor of [0, 7, 2.5, true, false, "", " ", "abc", [], {}, null]) {
    assert.equal(validarPersonas(valor), null);
  }
});

test("PUT rechaza valores inválidos de estado y enumeraciones", () => {
  assert.equal(
    validarCamposCompletos({ ...reservaCompleta, estado: "cancelada" }),
    null,
  );
  assert.equal(
    validarCamposCompletos({ ...reservaCompleta, sala: "Sala Este" }),
    null,
  );
  assert.equal(
    validarCamposCompletos({ ...reservaCompleta, turno: "Madrugada" }),
    null,
  );
});
