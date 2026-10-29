# LearnHub - Backend API REST (Node.js + Express)

Backend desacoplado para la plataforma web **LearnHub** (devflow), desarrollado para el curso *Curso Integrador I: Sistemas Software (UTP)*.

---

## 🚀 Tecnologías Implementadas
- **Node.js** (v24+) y **Express** (Framework HTTP modular)
- **ES Modules** (`import` / `export`)
- **JSON Web Tokens (JWT)** para autenticación y control de roles
- **BCrypt** para hashing seguro de contraseñas (RNF-01)
- **CORS** habilitado para conexión con React
- **Dotenv** para configuración de variables de entorno

---

## 👥 Cuentas de Prueba Preconfiguradas

| Rol | Correo | Contraseña | Token / Permisos |
|---|---|---|---|
| **Administrador** | `admin@learnhub.com` | `admin123` | Acceso a métricas, finanzas y edición de cursos |
| **Estudiante** | `jorge@learnhub.com` | `admin123` | Cursos en progreso, compras y membresía Pro activa |
| **Estudiante** | `ana@learnhub.com` | `admin123` | Nueva estudiante |

---

## 📌 Mapa de Endpoints y Cobertura SRS / Figma

### 1. Autenticación y Perfil (`/api/auth`)
* `POST /api/auth/registro` -> **RF-01** (Registro con validación de correo único y hash BCrypt)
* `POST /api/auth/login` -> **RF-02, RF-04** (Login con emisión de JWT y verificación de rol)
* `GET /api/auth/perfil` -> Datos del usuario autenticado (requiere `Authorization: Bearer <token>`)

### 2. Catálogo de Cursos (`/api/cursos`)
* `GET /api/cursos` -> **RF-05** (Catálogo con búsqueda `?busqueda=`, filtro `?categoria=`, `?nivel=`, `?modelo_cobro=` y ordenamiento `?ordenar=`)
* `GET /api/cursos/categorias` -> Lista de categorías para los filtros laterales
* `GET /api/cursos/:id` -> **RF-06** (Detalle del curso con módulos y lecciones para el reproductor)

### 3. Aprendizaje y Seguimiento (`/api/aprendizaje`)
* `GET /api/aprendizaje/mi-aprendizaje` -> **RF-16** (Pantalla *Mi Aprendizaje*, tarjetas de horas, racha de días, cursos en progreso y membresía actual)
* `POST /api/aprendizaje/progreso` -> **RF-14, RF-15** (Guarda segundo actual del video, marca lección como completada y **recalcula automáticamente el porcentaje de avance del curso**)

### 4. Pagos y Membresías Sandbox (`/api/pagos`)
* `GET /api/pagos/planes` -> **RF-10** (Lista de planes Pro Mensual y Anual)
* `POST /api/pagos/comprar` -> **RF-07, RF-08, RF-09** (Compra individual en Sandbox; tarjeta terminada en `0000` simula rechazo; otras aprueban y otorgan acceso inmediato)
* `POST /api/pagos/suscribir` -> **RF-10, RF-11** (Activa membresía ilimitada y calcula fecha de vencimiento)
* `PUT /api/pagos/cancelar-membresia` -> **RF-12** (Cancela renovación automática manteniendo acceso hasta el vencimiento)

### 5. Panel de Administración (`/api/admin`) *(Requiere rol Administrador)*
* `GET /api/admin/dashboard` -> **RF-20** (Pantalla *Overview*: ingresos desglosados, estudiantes activos, cursos publicados, tasa de finalización y feed en tiempo real)
* `POST /api/admin/cursos` -> **RF-18, RF-19** (Crear nuevo curso en borrador)
* `PUT /api/admin/cursos/:id` -> **RF-18** (Editar o publicar curso)
* `GET /api/admin/transacciones` -> **RF-21, RF-22** (Pantalla *Finanzas*: historial de compras, suscripciones, fallidos y reembolsos auditados)

---

## 🛠️ Ejecución

```bash
# Modo desarrollo con recarga automática:
npm run dev

# Modo producción:
npm start
```
El servidor responderá en `http://localhost:4000`.
