# TP 09 - Actualización y eliminación de reservas de salas

## Origen y objetivo

Este trabajo parte de una copia del TP 08. Se conserva la aplicación Express modular, las vistas EJS, los recursos estáticos, la conexión a MongoDB Atlas y las operaciones de creación y lectura. Se agregan actualización completa (PUT), actualización parcial (PATCH) y eliminación física por identificador (DELETE).

La aplicación web y la API utilizan el mismo servicio asíncrono y la misma colección `reservas`. No se insertan datos automáticamente al iniciar ni al consultar.

## Tecnologías

- Node.js compatible con `--env-file` (se recomienda Node 22).
- Express 5, EJS, Mongoose 8 y MongoDB Atlas Free.
- CommonJS.
- Prettier, ESLint y pruebas automáticas con `node:test`.

## Preparación

1. Crear una copia de trabajo del TP 08; conservar la entrega original sin modificar.
2. Copiar `.env.example` como `.env`.
3. Configurar `MONGODB_URI` con la URI privada de Atlas y la base `reservas_salas_u9`.
4. Verificar que el usuario de Atlas tenga permisos y que la IP esté autorizada.
5. Abrir una terminal en la carpeta y ejecutar:

```bash
npm ci
node --env-file=.env scripts/comprobar-conexion.js
npm start
```

6. Abrir `http://localhost:3000`, `http://localhost:3000/reservas` y `http://localhost:3000/estado`.

No compartir ni subir `.env`, contraseñas, URI privada, `node_modules` ni datos personales reales. La plantilla `.env.example` no contiene credenciales reales.

## Estructura conservada y ampliada

- `src/config`: configuración del puerto y conexión a MongoDB.
- `src/modelos/reserva.js`: esquema Mongoose.
- `src/servicios/reservas-mongo.js`: operaciones asíncronas de MongoDB.
- `src/controladores/reservas.js`: respuestas HTML y JSON.
- `src/rutas`: rutas de páginas y API.
- `src/middleware`: validación, medición de solicitudes y errores.
- `tests`: pruebas automáticas de las reglas PUT/PATCH.
- `scripts`: comprobación de conexión y utilidades de terminal.
- `views` y `public`: páginas y estilos conservados.

## Campos y reglas

| Campo | Regla |
| --- | --- |
| `estudiante` | Texto obligatorio; se aplica `trim`. |
| `email` | Texto obligatorio; debe contener `@`; se aplica `trim`. |
| `sala` | `Sala Norte`, `Sala Sur` o `Sala Multimedia`. |
| `fecha` | Texto obligatorio; se aplica `trim`. No se valida calendario ni futuro. |
| `turno` | `Mañana`, `Tarde` o `Noche`. |
| `personas` | Entero de 1 a 6. Se admite número o texto numérico no vacío. |
| `estado` | `pendiente` o `confirmada`; al crear se asigna `pendiente`. |

El POST conserva los seis campos originales. No acepta que el cliente asigne `estado` ni `_id`; el servidor crea el estado pendiente y el identificador.

PUT exige los siete campos editables. PATCH admite únicamente `personas` y `estado`, con al menos uno presente. Ambos rechazan campos desconocidos, `_id`, operadores como `$set`, cuerpos ausentes, arreglos y objetos como valor de `personas`. Los datos se validan antes de llegar al servicio; el servicio también activa `runValidators: true`.

No se agregan validaciones de calendario, disponibilidad, solapamiento, cupo compartido ni unicidad.

## Contrato HTTP

Servidor local: `http://localhost:3000`.

| Método | Dirección | Resultado esperado |
| --- | --- | --- |
| GET | `/api/reservas` | 200 y arreglo de reservas. |
| GET | `/api/reservas/:id` | 200 y reserva; 404 si el ID válido no existe. |
| POST | `/api/reservas` | 201, recurso guardado y cabecera `Location`; estado inicial pendiente. |
| PUT | `/api/reservas/:id` | 200 y reemplazo completo con el mismo ID. |
| PATCH | `/api/reservas/:id` | 200 y cambios parciales permitidos con el mismo ID. |
| DELETE | `/api/reservas/:id` | 204 sin cuerpo si eliminó el documento. |
| ID mal formado | Cualquier ruta individual | 400 JSON. |
| ID válido ausente | Consultar, modificar o eliminar | 404 JSON. |
| Entrada inválida | POST, PUT o PATCH | 400 JSON sin modificación. |
| Ruta API desconocida | `/api/...` | 404 JSON. |
| Fallo inesperado | API | 500 JSON seguro, sin trazas ni secretos. |

PUT y PATCH usan `upsert: false`: un identificador ausente nunca genera una reserva nueva. DELETE elimina un solo documento. Un segundo DELETE del mismo ID y un GET posterior responden 404. Cambiar `estado` a `pendiente` no elimina el documento.

El listado API conserva su respuesta como arreglo, sin metadatos adicionales. El sitio conserva el listado y detalle; ambos muestran el estado actualizado. `/estado` informa el conteo real de documentos de MongoDB.

## Recorrido de prueba con Postman

Se incluye `postman/TP09-Salas.postman_collection.json`. Importar esa colección en Postman; al ejecutar la solicitud de creación, la colección guarda automáticamente el ID devuelto para reutilizarlo en GET, PUT, PATCH y DELETE. Usar Postman de escritorio. En GET y DELETE dejar Body en `none`. En POST, PUT y PATCH seleccionar `Body > raw > JSON` y enviar `Content-Type: application/json`.

### 1. Crear una reserva de prueba

POST `http://localhost:3000/api/reservas`

```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-28",
  "turno": "Mañana",
  "personas": 2
}
```

Esperar 201. Guardar el `id` de la respuesta y la cabecera `Location`. El estado debe ser `pendiente`.

### 2. Reemplazar todos los campos

PUT `http://localhost:3000/api/reservas/ID_RECIBIDO`

```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-28",
  "turno": "Mañana",
  "personas": 2,
  "estado": "confirmada"
}
```

Esperar 200, el mismo ID y los siete campos. Probar también omitiendo un campo: debe responder 400 y el documento debe permanecer sin cambios.

### 3. Cambiar solo personas

PATCH `http://localhost:3000/api/reservas/ID_RECIBIDO`

```json
{
  "personas": 3
}
```

Esperar 200. `personas` debe quedar en 3 y los demás campos, incluido `estado`, deben conservarse.

También probar:

```json
{
  "estado": "pendiente"
}
```

### 4. Eliminar únicamente la reserva de prueba

Antes de borrar, consultar el ID mediante GET y confirmar que corresponde a la reserva creada para este ejercicio.

DELETE `http://localhost:3000/api/reservas/ID_RECIBIDO`

Esperar 204 y cuerpo vacío. Después, el GET del mismo ID debe responder 404 y el listado debe contener una reserva menos. No borrar reservas anteriores del TP 08 ni vaciar la colección.

### 5. Comprobar persistencia

Actualizar una reserva de prueba, guardar su ID y reiniciar el servidor. Consultar el mismo ID: los valores modificados deben seguir guardados. Eliminar otra reserva creada para la práctica, reiniciar y comprobar que sigue ausente.

## Matriz de pruebas

| Caso | Resultado esperado |
| --- | --- |
| POST válido | 201, `Location` y estado pendiente. |
| PUT completo | 200, mismo ID y siete campos. |
| PUT incompleto | 400 y recurso intacto. |
| PATCH personas o estado | 200 y campos omitidos conservados. |
| PATCH vacío, campo extra, `_id` o `$set` | 400 sin modificación. |
| Personas 0, 7, 2.5, `true`, arreglo u objeto | 400 sin modificación. |
| Estado, sala o turno inválido | 400 sin modificación. |
| ID mal formado | 400 JSON. |
| ID válido ausente en PUT/PATCH/DELETE | 404; no se crea recurso. |
| JSON mal formado o cuerpo ausente | 400 JSON. |
| DELETE existente | 204 sin cuerpo; listado con una reserva menos. |
| Repetir DELETE o GET posterior | 404. |
| Reiniciar después de actualizar y eliminar | Cambios persistidos. |
| Sitio, formulario y `/estado` | Continúan funcionando. |
| Fallo inesperado | 500 JSON sin secretos. |

## Calidad y pruebas automáticas

Ejecutar:

```bash
npm run format
npm run check
```

`npm run check` ejecuta Prettier en modo comprobación, ESLint y las pruebas automatizadas de validación PUT/PATCH. Estas pruebas automáticas no sustituyen las pruebas de integración con MongoDB Atlas y Postman.

Registrar en la entrega los resultados realmente observados: ID de prueba, cantidad de reservas antes y después, códigos HTTP y evidencia del reinicio. No marcar como realizada una prueba que todavía no se ejecutó.

## Seguridad y alcance

Este proyecto es una práctica educativa. No incorpora autenticación ni autorización y no debe publicarse como API pública. No se implementan consultas avanzadas, relaciones, control de disponibilidad ni prevención de reservas superpuestas.
