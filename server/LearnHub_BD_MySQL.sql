-- ============================================================
-- LearnHub - Modelo físico adaptado para MySQL 8+ / MariaDB
-- Adaptación del modelo de 15 tablas del proyecto UTP
-- ============================================================

DROP DATABASE IF EXISTS learnhub;
CREATE DATABASE learnhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learnhub;

-- ---------- 1. SEGURIDAD Y USUARIOS ----------

CREATE TABLE Rol (
    id_rol      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol  VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE Usuario (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    id_rol          INT NOT NULL DEFAULT 1,
    nombre          VARCHAR(50)  NOT NULL,
    apellido        VARCHAR(50)  NOT NULL,
    correo          VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          ENUM('Activo', 'Inactivo', 'Bloqueado') NOT NULL DEFAULT 'Activo',
    CONSTRAINT FK_Usuario_Rol FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
) ENGINE=InnoDB;

CREATE TABLE Sesion (
    id_sesion     INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INT NOT NULL,
    fecha_inicio  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin     DATETIME NULL,
    token_sesion  VARCHAR(255) NULL,
    estado_sesion ENUM('Activa', 'Cerrada', 'Expirada') NOT NULL DEFAULT 'Activa',
    CONSTRAINT FK_Sesion_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- 2. CATÁLOGO DE CURSOS ----------

CREATE TABLE Categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE Curso (
    id_curso            INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria        INT NOT NULL,
    id_administrador    INT NOT NULL,
    titulo              VARCHAR(150) NOT NULL,
    descripcion         TEXT NULL,
    nivel               ENUM('Principiante', 'Intermedio', 'Avanzado') NOT NULL,
    imagen_url          VARCHAR(255) NULL,
    modelo_cobro        ENUM('Individual', 'Membresia', 'Ambos') NOT NULL DEFAULT 'Ambos',
    precio              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado_publicacion  ENUM('Borrador', 'Publicado', 'Archivado') NOT NULL DEFAULT 'Borrador',
    fecha_creacion      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_Curso_Categoria FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
    CONSTRAINT FK_Curso_Admin FOREIGN KEY (id_administrador) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE Modulo (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    id_curso  INT NOT NULL,
    titulo    VARCHAR(150) NOT NULL,
    orden     INT NOT NULL,
    CONSTRAINT FK_Modulo_Curso FOREIGN KEY (id_curso) REFERENCES Curso(id_curso) ON DELETE CASCADE,
    CONSTRAINT UQ_Modulo_Orden UNIQUE (id_curso, orden)
) ENGINE=InnoDB;

CREATE TABLE Leccion (
    id_leccion   INT AUTO_INCREMENT PRIMARY KEY,
    id_modulo    INT NOT NULL,
    titulo       VARCHAR(150) NOT NULL,
    video_url    VARCHAR(255) NOT NULL,
    duracion_seg INT NOT NULL,
    orden        INT NOT NULL,
    CONSTRAINT FK_Leccion_Modulo FOREIGN KEY (id_modulo) REFERENCES Modulo(id_modulo) ON DELETE CASCADE,
    CONSTRAINT UQ_Leccion_Orden UNIQUE (id_modulo, orden)
) ENGINE=InnoDB;

-- ---------- 3. MEMBRESÍAS Y PAGOS ----------

CREATE TABLE Plan_Membresia (
    id_plan      INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(60) NOT NULL UNIQUE,
    descripcion  VARCHAR(300) NULL,
    precio       DECIMAL(10,2) NOT NULL,
    periodicidad ENUM('Mensual', 'Trimestral', 'Anual') NOT NULL,
    estado       ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE Suscripcion (
    id_suscripcion        INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario            INT NOT NULL,
    id_plan               INT NOT NULL,
    fecha_inicio          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento     DATETIME NOT NULL,
    renovacion_automatica BOOLEAN NOT NULL DEFAULT TRUE,
    estado                ENUM('Activa', 'Cancelada', 'Vencida') NOT NULL DEFAULT 'Activa',
    CONSTRAINT FK_Susc_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Susc_Plan FOREIGN KEY (id_plan) REFERENCES Plan_Membresia(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Transaccion (
    id_transaccion          VARCHAR(20) PRIMARY KEY,
    id_usuario              INT NOT NULL,
    id_curso                INT NULL,
    id_suscripcion          INT NULL,
    tipo                    ENUM('Compra', 'Suscripcion', 'Renovacion', 'Reembolso') NOT NULL,
    metodo_pago             VARCHAR(50) NOT NULL,
    monto                   DECIMAL(10,2) NOT NULL,
    estado                  ENUM('Aprobada', 'Rechazada', 'Reembolsada') NOT NULL,
    referencia_pasarela     VARCHAR(100) NULL,
    ultimos_digitos         CHAR(4) NULL,
    transaccion_original_id VARCHAR(20) NULL, -- Corregido para auditoría de reembolsos
    fecha                   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Trans_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Trans_Curso FOREIGN KEY (id_curso) REFERENCES Curso(id_curso),
    CONSTRAINT FK_Trans_Susc FOREIGN KEY (id_suscripcion) REFERENCES Suscripcion(id_suscripcion)
) ENGINE=InnoDB;

-- ---------- 4. APRENDIZAJE Y PROGRESO ----------

CREATE TABLE Inscripcion (
    id_inscripcion    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario        INT NOT NULL,
    id_curso          INT NOT NULL,
    id_transaccion    VARCHAR(20) NULL,
    origen            ENUM('Compra', 'Membresia') NOT NULL,
    fecha_inscripcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    porcentaje_avance DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT FK_Insc_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Insc_Curso FOREIGN KEY (id_curso) REFERENCES Curso(id_curso),
    CONSTRAINT FK_Insc_Trans FOREIGN KEY (id_transaccion) REFERENCES Transaccion(id_transaccion),
    CONSTRAINT UQ_Insc_UsuarioCurso UNIQUE (id_usuario, id_curso)
) ENGINE=InnoDB;

CREATE TABLE Progreso_Leccion (
    id_progreso         INT AUTO_INCREMENT PRIMARY KEY,
    id_inscripcion      INT NOT NULL,
    id_leccion          INT NOT NULL,
    segundo_actual      INT NOT NULL DEFAULT 0,
    completada          BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_Prog_Insc FOREIGN KEY (id_inscripcion) REFERENCES Inscripcion(id_inscripcion) ON DELETE CASCADE,
    CONSTRAINT FK_Prog_Leccion FOREIGN KEY (id_leccion) REFERENCES Leccion(id_leccion) ON DELETE CASCADE,
    CONSTRAINT UQ_Prog UNIQUE (id_inscripcion, id_leccion)
) ENGINE=InnoDB;

CREATE TABLE Valoracion (
    id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INT NOT NULL,
    id_curso      INT NOT NULL,
    puntuacion    TINYINT UNSIGNED NOT NULL,
    comentario    TEXT NULL,
    fecha         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Val_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Val_Curso FOREIGN KEY (id_curso) REFERENCES Curso(id_curso),
    CONSTRAINT UQ_Val UNIQUE (id_usuario, id_curso)
) ENGINE=InnoDB;

CREATE TABLE Notificacion (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    tipo            ENUM('Renovacion', 'Pago', 'Curso', 'Sistema') NOT NULL,
    mensaje         VARCHAR(300) NOT NULL,
    leida           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Notif_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- 5. ÍNDICES DE RENDIMIENTO ----------

CREATE INDEX IX_Curso_Estado ON Curso(estado_publicacion, id_categoria);
CREATE INDEX IX_Susc_Estado_Venc ON Suscripcion(estado, fecha_vencimiento);
CREATE INDEX IX_Trans_Usuario_Fecha ON Transaccion(id_usuario, fecha);

-- ---------- 6. DATOS DE PRUEBA INICIALES ----------

INSERT INTO Rol (id_rol, nombre_rol) VALUES 
(1, 'Estudiante'), 
(2, 'Administrador');

-- Clave cifrada para ambos usuarios de prueba: 'admin123'
INSERT INTO Usuario (id_usuario, id_rol, nombre, apellido, correo, contrasena_hash, estado) VALUES
(1, 2, 'Roberto', 'Cruz',   'admin@learnhub.com', '$2a$10$wK1Gv/1bS8P74Xw8f4jB9eOq52k34M810Z66s3tY7s03q38Qo972e', 'Activo'),
(2, 1, 'Jorge',   'López',  'jorge@learnhub.com', '$2a$10$wK1Gv/1bS8P74Xw8f4jB9eOq52k34M810Z66s3tY7s03q38Qo972e', 'Activo'),
(3, 1, 'Ana',     'García', 'ana@learnhub.com',   '$2a$10$wK1Gv/1bS8P74Xw8f4jB9eOq52k34M810Z66s3tY7s03q38Qo972e', 'Activo');

INSERT INTO Categoria (id_categoria, nombre) VALUES 
(1, 'Data Science'), (2, 'Frontend'), (3, 'Backend'), 
(4, 'DevOps'), (5, 'IA & ML'), (6, 'Mobile');

INSERT INTO Curso (id_curso, id_categoria, id_administrador, titulo, descripcion, nivel, modelo_cobro, precio, estado_publicacion, imagen_url) VALUES
(1, 1, 1, 'Python para Ciencia de Datos', 'Fundamentos de Python aplicados a datos con Pandas y NumPy.', 'Intermedio', 'Membresia', 0.00, 'Publicado', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600'),
(2, 2, 1, 'React + TypeScript: Aplicaciones Modernas', 'Desarrollo frontend profesional con React y TypeScript.', 'Avanzado', 'Individual', 89.00, 'Publicado', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'),
(3, 3, 1, 'JavaScript Full Stack con Node.js', 'Desarrollo integral con Node.js, Express y bases de datos.', 'Intermedio', 'Ambos', 119.00, 'Publicado', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600');

INSERT INTO Modulo (id_modulo, id_curso, titulo, orden) VALUES 
(1, 1, '1. Introducción a Python', 1), 
(2, 1, '2. Fundamentos y Estructuras', 2),
(3, 2, '1. Arquitectura con TypeScript', 1);

INSERT INTO Leccion (id_leccion, id_modulo, titulo, video_url, duracion_seg, orden) VALUES
(1, 1, 'Bienvenida al curso', 'https://www.w3schools.com/html/mov_bbb.mp4', 204, 1),
(2, 1, 'Configuración del entorno', 'https://www.w3schools.com/html/mov_bbb.mp4', 765, 2),
(3, 2, 'Variables y tipos de datos', 'https://www.w3schools.com/html/mov_bbb.mp4', 1112, 1);

INSERT INTO Plan_Membresia (id_plan, nombre, descripcion, precio, periodicidad, estado) VALUES
(1, 'Membresía Pro Mensual', 'Acceso ilimitado al catálogo completo.', 29.00, 'Mensual', 'Activo'),
(2, 'Membresía Pro Anual (-20%)', 'Acceso ilimitado por un año con descuento.', 278.00, 'Anual', 'Activo');

INSERT INTO Suscripcion (id_suscripcion, id_usuario, id_plan, fecha_vencimiento, estado) VALUES
(1, 2, 1, DATE_ADD(NOW(), INTERVAL 1 MONTH), 'Activa');

INSERT INTO Transaccion (id_transaccion, id_usuario, id_curso, id_suscripcion, tipo, metodo_pago, monto, estado, referencia_pasarela, ultimos_digitos) VALUES
('PAY-8821', 2, 2, NULL, 'Compra', 'Visa •••• 4521', 89.00, 'Aprobada', 'SBX-998821', '4521'),
('SUB-3341', 3, NULL, 1, 'Suscripcion', 'Mastercard •••• 7823', 29.00, 'Aprobada', 'SBX-773341', '7823');

INSERT INTO Inscripcion (id_inscripcion, id_usuario, id_curso, id_transaccion, origen, porcentaje_avance) VALUES
(1, 2, 1, NULL, 'Membresia', 23.08),
(2, 2, 2, 'PAY-8821', 'Compra', 61.54);

INSERT INTO Progreso_Leccion (id_inscripcion, id_leccion, segundo_actual, completada) VALUES
(1, 1, 204, TRUE),
(1, 2, 765, TRUE),
(1, 3, 632, FALSE);
