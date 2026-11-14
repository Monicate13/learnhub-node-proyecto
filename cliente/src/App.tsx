import { useState, useEffect } from 'react'
import { 
  apiObtenerCursos, 
  apiComprarCurso, 
  apiSuscribirPlan, 
  apiCrearCurso,
  apiActualizarCurso,
  apiEliminarCurso,
  apiObtenerTransaccionesAdmin,
  getAuthToken 
} from './services/api'
import LoginView, { type UserData } from './views/LoginView'
import CatalogView, { type CourseItem } from './views/CatalogView'
import DashboardView, { type SavedCard } from './views/DashboardView'
import PlayerView from './views/PlayerView'
import TeacherDashboard from './views/TeacherDashboard'
import AdminOverview from './views/admin/AdminOverview'
import CatalogManagement from './views/admin/CatalogManagement'
import CourseEditor from './views/admin/CourseEditor'
import TransactionsCenter from './views/admin/TransactionsCenter'
import UserManagement from './views/admin/UserManagement'
import CookieBanner from './components/CookieBanner'
import WhatsAppButton from './components/WhatsAppButton'
import LegalModal from './components/LegalModal'
import NotFoundView from './components/NotFoundView'
import ProfileModal from './components/ProfileModal'
import PlansModal, { type MembershipPlan } from './components/PlansModal'
import CheckoutModal, { type SandboxCheckout } from './components/CheckoutModal'

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan-1m',
    name: 'Plan Mensual (1 Mes)',
    months: 1,
    totalPrice: 29,
    monthlyEquivalent: 29,
    expiresLabel: '24 nov 2026',
    features: [
      'Acceso ilimitado a todos los cursos del catálogo',
      'Seguimiento de progreso en tiempo real',
      'Renovación mensual flexible (cancela cuando quieras)',
    ],
  },
  {
    id: 'plan-6m',
    name: 'Plan Semestral UTP (6 Meses)',
    months: 6,
    totalPrice: 139,
    monthlyEquivalent: 23,
    badge: 'MÁS POPULAR · AHORRA 20%',
    expiresLabel: '24 abr 2027',
    features: [
      'Cubre todo un ciclo universitario completo (6 meses)',
      'Acceso total a todos los cursos y código fuente',
      'Ahorras $35 USD frente al pago mes a mes',
    ],
  },
  {
    id: 'plan-12m',
    name: 'Plan Anual Pro (12 Meses)',
    months: 12,
    totalPrice: 229,
    monthlyEquivalent: 19,
    badge: 'MEJOR VALOR · AHORRA 35%',
    expiresLabel: '24 oct 2027',
    features: [
      '12 meses de formación continua Full-Stack, IA y Datos',
      'Acceso prioritario a nuevos cursos de 2026–2027',
      'Ahorras $119 USD frente al plan mensual',
    ],
  },
]

// Equivalencia entre los planes del frontend (por meses) y Plan_Membresia en MySQL
const PLAN_DB_ID: Record<number, number> = { 1: 1, 12: 2, 6: 3 }

const DEFAULT_USERS: UserData[] = [
  {
    id: 1,
    nombre: 'Bruno',
    apellido: 'Cusi',
    correo: 'estudiante@utp.edu.pe',
    role: 'student',
    password: '12345678',
    hasMembership: false,
    purchasedCourseIds: [2],
  },
  {
    id: 2,
    nombre: 'Roberto',
    apellido: 'Cruz',
    correo: 'admin@learnhub.pe',
    role: 'admin',
    password: '12345678',
    hasMembership: true,
    purchasedCourseIds: [],
  },
]

const INITIAL_COURSES: CourseItem[] = [
  {
    id: 3,
    title: 'Lógica de Programación y Fundamentos de JavaScript Moderno (2026)',
    category: 'Frontend',
    level: 'Principiante',
    instructor: 'Carlos Mendoza',
    rating: 4.9,
    reviews: 1840,
    students: 1840,
    duration: '28h 30m',
    lessons: 9,
    price: 39,
    modelo_cobro: 'Ambos',
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
    description: 'Aprende a programar desde cero sin conocimientos previos. Domina variables, estructuras de control, funciones, arreglos, manipulación del DOM y sintaxis moderna ES2026 con ejercicios prácticos y proyectos del mundo real.',
    modules: [
      {
        title: 'Módulo 1: Pensamiento Lógico y Primeros Pasos con JavaScript',
        duration: '6h 15m',
        lessons: [
          {
            title: '1.1 ¿Cómo piensa una computadora? Algoritmos y pseudocódigo',
            time: '18:40',
            free: true,
            video_url: 'https://www.youtube.com/embed/7iobxzd_2wY',
            description: 'Entender el flujo secuencial de instrucciones, toma de decisiones y cómo descomponer un problema complejo en pasos simples.'
          },
          {
            title: '1.2 Configuración del entorno: Node.js, VS Code y extensiones 2026',
            time: '24:10',
            free: true,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Instalación paso a paso de Visual Studio Code, configuración de ESLint, Prettier y ejecución de scripts mediante terminal integrada.'
          },
          {
            title: '1.3 Variables, tipos de datos primitivos y operadores',
            time: '22:50',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Uso correcto de const y let, tipos de datos String, Number, Boolean, BigInt, Symbol y operadores aritméticos y lógicos.'
          }
        ]
      },
      {
        title: 'Módulo 2: Estructuras de Control y Modularización',
        duration: '8h 45m',
        lessons: [
          {
            title: '2.1 Condicionales if/else, switch y operador ternario',
            time: '20:30',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Toma de decisiones en el código, tablas de verdad y simplificación de condiciones con cortocircuito lógico.'
          },
          {
            title: '2.2 Bucles modernos: for, for...of, while y métodos funcionales',
            time: '26:15',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Iteración sobre colecciones de datos, cómo evitar bucles infinitos y uso de break y continue.'
          },
          {
            title: '2.3 Funciones flecha, parámetros por defecto y ámbito léxico',
            time: '25:40',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Creación de funciones puras, reutilización de lógica y comprensión del Scope global versus local.'
          }
        ]
      },
      {
        title: 'Módulo 3: Estructuras de Datos y Proyecto Práctico',
        duration: '13h 35m',
        lessons: [
          {
            title: '3.1 Arreglos y métodos esenciales: map, filter, reduce',
            time: '28:10',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Transformación y filtrado de datos sin mutar el arreglo original siguiendo principios de programación funcional.'
          },
          {
            title: '3.2 Objetos literales, desestructuración y operador Spread',
            time: '22:15',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Modelado de entidades del mundo real en objetos clave-valor, clonación segura y extracción limpia de propiedades.'
          },
          {
            title: '3.3 Proyecto: Calculadora de Presupuesto Personal Interactiva',
            time: '32:00',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Construcción completa de una aplicación de consola y navegador que gestiona ingresos, gastos y ahorros.'
          }
        ]
      }
    ],
    recursos: [
      {
        id: 'res-js-1',
        name: 'CheatSheet_JavaScript_Moderno_2026.pdf',
        size: '2.4 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        lesson: '1.3 Variables, tipos de datos primitivos y operadores'
      },
      {
        id: 'res-js-2',
        name: 'Guia_Ejercicios_Algoritmos_Resueltos.pdf',
        size: '3.8 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        lesson: '2.1 Condicionales if/else, switch y operador ternario'
      },
      {
        id: 'res-js-3',
        name: 'Codigo_Proyecto_Calculadora_Presupuesto.zip',
        size: '1.2 MB',
        type: 'zip',
        url: 'https://github.com',
        lesson: '3.3 Proyecto: Calculadora de Presupuesto Personal Interactiva'
      }
    ],
    evaluacion_preguntas: [
      {
        id: 1,
        question: '¿Cuál es la diferencia fundamental entre declarar una variable con const y let en JavaScript?',
        options: [
          'const crea una referencia inmutable que no puede ser reasignada, mientras que let sí permite reasignación',
          'const solo existe en funciones y let solo en bucles',
          'let convierte todos los valores en cadenas de texto',
          'No existe ninguna diferencia; son exactamente equivalentes'
        ],
        correctIndex: 0
      },
      {
        id: 2,
        question: '¿Qué retorna el método Array.prototype.filter() cuando ninguna condición coincide?',
        options: [
          'Un arreglo vacío []',
          'null',
          'undefined',
          'Lanza un error de tipo TypeError'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 1,
    title: 'Python desde Cero e Introducción a la Inteligencia Artificial (2026)',
    category: 'Data Science',
    level: 'Principiante',
    instructor: 'Roberto Cruz',
    rating: 4.9,
    reviews: 2150,
    students: 2150,
    duration: '32h 0m',
    lessons: 8,
    price: 49,
    modelo_cobro: 'Ambos',
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'Iníciate en Python con las mejores prácticas del 2026. Aprende la sintaxis limpia del lenguaje más popular, automatiza tareas cotidianas, manipula datos con Pandas y realiza tus primeras integraciones con modelos de Inteligencia Artificial Generativa.',
    modules: [
      {
        title: 'Módulo 1: Fundamentos y Sintaxis Clara de Python',
        duration: '7h 30m',
        lessons: [
          {
            title: '1.1 Bienvenida al curso e instalación de Python 3.12+ y Jupyter',
            time: '16:20',
            free: true,
            video_url: 'https://www.youtube.com/embed/7iobxzd_2wY',
            description: 'Instalación del intérprete oficial de Python, configuración de entornos virtuales (venv) y primeros comandos interactivos.'
          },
          {
            title: '1.2 Variables dinámicas, f-strings y entrada por teclado',
            time: '21:10',
            free: true,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Manejo de cadenas formateadas, conversión de tipos con int() y float(), y captura de datos con input().'
          },
          {
            title: '1.3 Estructuras clave: Listas, Tuplas, Diccionarios y Sets',
            time: '29:45',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Diferencias de mutabilidad, indexación, métodos útiles (append, pop, keys, items) y comprensión de listas.'
          }
        ]
      },
      {
        title: 'Módulo 2: Modularidad, Archivos y Automatización',
        duration: '10h 15m',
        lessons: [
          {
            title: '2.1 Creación de funciones reutilizables con Type Hints',
            time: '22:15',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Anotaciones de tipo para código robusto, valores por defecto y retorno múltiple en tuplas.'
          },
          {
            title: '2.2 Lectura y escritura de archivos CSV y JSON',
            time: '25:30',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Uso del context manager with open(), procesamiento estructurado de datasets y serialización JSON.'
          }
        ]
      },
      {
        title: 'Módulo 3: Primeros pasos con IA y APIs Modernas',
        duration: '14h 15m',
        lessons: [
          {
            title: '3.1 Introducción a Pandas: DataFrames y análisis exploratorio',
            time: '31:20',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Carga de datos masivos, filtrado por columnas, estadísticas descriptivas y detección de valores nulos.'
          },
          {
            title: '3.2 Conectando Python con APIs de Inteligencia Artificial (Gemini API)',
            time: '33:40',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Uso de requests y librerías oficiales para enviar prompts, recibir respuestas estructuradas y generar análisis inteligentes.'
          }
        ]
      }
    ],
    recursos: [
      {
        id: 'res-py-1',
        name: 'Manual_Python_Sintaxis_Limpia_2026.pdf',
        size: '3.1 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        lesson: '1.2 Variables dinámicas, f-strings y entrada por teclado'
      }
    ],
    evaluacion_preguntas: [
      {
        id: 1,
        question: '¿Cuál es la principal ventaja de utilizar with open(...) en Python?',
        options: [
          'Garantiza que el archivo se cierre automáticamente incluso si ocurre una excepción',
          'Hace que el archivo sea indestructible en el disco',
          'Traduce el archivo automáticamente a lenguaje C',
          'Comprime el archivo en formato ZIP en segundo plano'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 2,
    title: 'Desarrollo Frontend Moderno con React 19 y Tailwind CSS (2026)',
    category: 'Frontend',
    level: 'Principiante',
    instructor: 'Carlos Mendoza',
    rating: 4.8,
    reviews: 1420,
    students: 1420,
    duration: '35h 0m',
    lessons: 6,
    price: 59,
    modelo_cobro: 'Ambos',
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    description: 'Aprende el estándar del desarrollo web moderno. Domina React 19, componentes funcionales, useState, useEffect, diseño de interfaces responsivas con Tailwind CSS y consumo de APIs REST.',
    modules: [
      {
        title: 'Módulo 1: Fundamentos de Componentes e Interfaces Modernas',
        duration: '9h 30m',
        lessons: [
          {
            title: '1.1 Introducción a React 19 y configuración con Vite',
            time: '19:50',
            free: true,
            video_url: 'https://www.youtube.com/embed/7iobxzd_2wY',
            description: 'Arquitectura basada en componentes, JSX y arranque de proyectos ultrarrápidos con Vite.'
          },
          {
            title: '1.2 Maquetación atómica con Tailwind CSS',
            time: '24:30',
            free: true,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Clases utilitarias, Flexbox, Grid, estados hover, focus y diseño adaptado a móviles y tablets.'
          }
        ]
      },
      {
        title: 'Módulo 2: Estado, Efectos y Formularios Reactivos',
        duration: '11h 0m',
        lessons: [
          {
            title: '2.1 Manejo de estado con el hook useState',
            time: '26:40',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Renderizado reactivo, inmutabilidad y actualización de listas y objetos en el estado.'
          },
          {
            title: '2.2 Ciclo de vida y efectos secundarios con useEffect',
            time: '29:15',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Peticiones asíncronas con fetch, sincronización con APIs externas y funciones de limpieza.'
          }
        ]
      }
    ],
    recursos: [
      {
        id: 'res-react-1',
        name: 'Guia_React_19_Hooks_y_Componentes.pdf',
        size: '2.8 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        lesson: '1.1 Introducción a React 19 y configuración con Vite'
      }
    ],
    evaluacion_preguntas: [
      {
        id: 1,
        question: '¿Por qué en React 19 no debemos mutar directamente el estado?',
        options: [
          'Porque React detecta cambios comparando referencias inmutables para re-renderizar la vista',
          'Porque el navegador bloquea la memoria si un arreglo cambia',
          'Porque el estado solo acepta valores booleanos',
          'Porque reinicia el servidor'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 8,
    title: 'Bases de Datos Relacionales con MySQL y Node.js (2026)',
    category: 'Backend',
    level: 'Principiante',
    instructor: 'Héctor Leandro Soto Crespo',
    rating: 4.8,
    reviews: 980,
    students: 980,
    duration: '26h 40m',
    lessons: 5,
    price: 45,
    modelo_cobro: 'Individual',
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    description: 'Domina el almacenamiento de información empresarial. Aprende a diseñar esquemas normalizados, tablas, llaves primarias/foráneas, consultas SQL optimizadas (SELECT, JOIN, GROUP BY) y a conectarte desde una API REST en Node.js.',
    modules: [
      {
        title: 'Módulo 1: Diseño Relacional y Modelado de Datos',
        duration: '8h 20m',
        lessons: [
          {
            title: '1.1 Conceptos relacionales: Tablas, Filas, Columnas y Claves',
            time: '20:10',
            free: true,
            video_url: 'https://www.youtube.com/embed/7iobxzd_2wY',
            description: 'Qué es una base de datos relacional, integridad referencial y modelado Entidad-Relación.'
          },
          {
            title: '1.2 Tipos de datos SQL y restricciones (PRIMARY KEY, FOREIGN KEY)',
            time: '22:45',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Selección precisa de tipos VARCHAR, INT, DECIMAL y diseño sin redundancia.'
          }
        ]
      },
      {
        title: 'Módulo 2: Consultas SQL Profesionales',
        duration: '10h 10m',
        lessons: [
          {
            title: '2.1 Consultas SELECT, filtros WHERE y paginación',
            time: '25:30',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Recuperación de datos eficiente, operadores lógicos y paginación con LIMIT.'
          },
          {
            title: '2.2 Uniones relacionales con INNER JOIN y LEFT JOIN',
            time: '28:50',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Combinación de información entre tablas múltiples respetando la integridad referencial.'
          }
        ]
      }
    ],
    recursos: [
      {
        id: 'res-sql-1',
        name: 'Guia_SQL_Consultas_y_Joins_2026.pdf',
        size: '2.1 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        lesson: '2.2 Uniones relacionales con INNER JOIN y LEFT JOIN'
      }
    ],
    evaluacion_preguntas: [
      {
        id: 1,
        question: '¿Cuál es la principal diferencia entre un INNER JOIN y un LEFT JOIN?',
        options: [
          'INNER JOIN solo devuelve filas con coincidencia en ambas tablas, mientras que LEFT JOIN incluye todas las filas de la tabla izquierda',
          'LEFT JOIN elimina datos de la tabla derecha',
          'INNER JOIN solo funciona con números enteros',
          'Son idénticos'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 9,
    title: 'Git, GitHub y Flujos de Trabajo para Desarrolladores Junior (2026)',
    category: 'DevOps',
    level: 'Principiante',
    instructor: 'Carlos Mendoza',
    rating: 4.9,
    reviews: 1650,
    students: 1650,
    duration: '22h 15m',
    lessons: 5,
    price: 29,
    modelo_cobro: 'Membresia',
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80',
    description: 'El curso indispensable para todo programador. Domina el control de versiones, creación de ramas (branches), resolución de conflictos, Pull Requests en GitHub, Conventional Commits y publicación de proyectos en la nube.',
    modules: [
      {
        title: 'Módulo 1: Control de Versiones Local con Git',
        duration: '7h 0m',
        lessons: [
          {
            title: '1.1 ¿Qué es Git? Instalación y configuración global',
            time: '15:30',
            free: true,
            video_url: 'https://www.youtube.com/embed/7iobxzd_2wY',
            description: 'Configuración de usuario, email, clave SSH y comprensión del working directory y commit.'
          },
          {
            title: '1.2 El ciclo de vida de un cambio: git add, commit y log',
            time: '21:00',
            free: true,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Creación de commits atómicos con mensajes descriptivos siguiendo Conventional Commits.'
          }
        ]
      },
      {
        title: 'Módulo 2: Ramas, Fusiones y Colaboración en GitHub',
        duration: '9h 30m',
        lessons: [
          {
            title: '2.1 Creación de ramas y estrategias de flujo',
            time: '24:10',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Aislamiento de nuevas funcionalidades y git checkout -b.'
          },
          {
            title: '2.2 Resolución de conflictos paso a paso',
            time: '28:40',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Cómo entender las marcas de conflicto y resolver discrepancias limpiamente.'
          }
        ]
      }
    ],
    recursos: [
      {
        id: 'res-git-1',
        name: 'Guia_Comandos_Git_Imprescindibles_2026.pdf',
        size: '1.9 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        lesson: '1.2 El ciclo de vida de un cambio: git add, commit y log'
      }
    ],
    evaluacion_preguntas: [
      {
        id: 1,
        question: '¿Cuál es la función principal de un archivo .gitignore?',
        options: [
          'Especificar archivos que Git nunca debe rastrear ni subir al repositorio',
          'Ocultar los errores del código',
          'Borrar el historial de commits anteriores',
          'Acelerar la conexión a internet'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    id: 11,
    title: 'Estructuras de Datos y Algoritmos para Entrevistas Técnicas (2026)',
    category: 'Backend',
    level: 'Intermedio',
    instructor: 'Roberto Cruz',
    rating: 4.8,
    reviews: 820,
    students: 820,
    duration: '30h 0m',
    lessons: 5,
    price: 69,
    modelo_cobro: 'Ambos',
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1516116211227-bbc679091993?auto=format&fit=crop&w=800&q=80',
    description: 'Prepárate para superar entrevistas técnicas junior y resolver problemas de alta eficiencia. Aprende Notación Big-O, pilas, colas, árboles, grafos, algoritmos de búsqueda y ordenamiento.',
    modules: [
      {
        title: 'Módulo 1: Complejidad Algorítmica y Notación Big-O',
        duration: '8h 0m',
        lessons: [
          {
            title: '1.1 ¿Qué es la Notación Big-O? Complejidad Temporal y Espacial',
            time: '24:30',
            free: true,
            video_url: 'https://www.youtube.com/embed/7iobxzd_2wY',
            description: 'Comparativa entre O(1), O(log n), O(n), O(n log n) y O(n^2).'
          },
          {
            title: '1.2 Arreglos dinámicos vs Listas enlazadas',
            time: '26:10',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Costos de inserción, eliminación y búsqueda en memoria.'
          }
        ]
      },
      {
        title: 'Módulo 2: Pilas, Colas y Búsqueda Binaria',
        duration: '11h 0m',
        lessons: [
          {
            title: '2.1 Pilas (Stacks) y Colas (Queues): Patrones LIFO y FIFO',
            time: '25:40',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Casos de uso reales: historial de navegación y balanceo de paréntesis.'
          },
          {
            title: '2.2 Algoritmo de Búsqueda Binaria (Binary Search)',
            time: '28:15',
            free: false,
            video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            description: 'Resolución de problemas en O(log n) dividiendo el espacio de búsqueda a la mitad.'
          }
        ]
      }
    ],
    recursos: [
      {
        id: 'res-dsa-1',
        name: 'Guia_Big_O_Complejidad_y_Estructuras_2026.pdf',
        size: '2.6 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        lesson: '1.1 ¿Qué es la Notación Big-O? Complejidad Temporal y Espacial'
      }
    ],
    evaluacion_preguntas: [
      {
        id: 1,
        question: '¿Cuál es la complejidad temporal de la Búsqueda Binaria en el peor caso?',
        options: [
          'O(log n)',
          'O(n^2)',
          'O(1)',
          'O(n!)'
        ],
        correctIndex: 0
      }
    ]
  }
]

export default function App() {
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>(() => {
    const saved = localStorage.getItem('learnhub_users_v5')
    return saved ? JSON.parse(saved) : DEFAULT_USERS
  })

  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    const savedSession = localStorage.getItem('learnhub_session_v5')
    return savedSession ? JSON.parse(savedSession) : null
  })

  const [currentView, setCurrentView] = useState<string>(() => {
    const savedView = localStorage.getItem('learnhub_view_v5')
    return savedView || 'login'
  })

  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const savedCourses = localStorage.getItem('learnhub_courses_v5')
    return savedCourses ? JSON.parse(savedCourses) : INITIAL_COURSES
  })

  // Curso seleccionado para editar en el panel de Admin (null = Crear curso nuevo)
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(() => {
    try {
      const savedId = localStorage.getItem('learnhub_editing_course_id')
      if (!savedId) return null
      const savedCourses = localStorage.getItem('learnhub_courses_v5')
      const list: CourseItem[] = savedCourses ? JSON.parse(savedCourses) : INITIAL_COURSES
      return list.find((c) => c.id === Number(savedId)) || null
    } catch {
      return null
    }
  })

  // Persistencia de ID de curso activo para que no se resetee con F5 en el Aula Virtual
  const [activeCourseId, setActiveCourseId] = useState<number>(() => {
    const saved = localStorage.getItem('learnhub_active_course_id')
    return saved ? Number(saved) : 2
  })

  useEffect(() => {
    if (activeCourseId) {
      localStorage.setItem('learnhub_active_course_id', String(activeCourseId))
    }
  }, [activeCourseId])

  useEffect(() => {
    if (editingCourse) {
      localStorage.setItem('learnhub_editing_course_id', String(editingCourse.id))
    } else if (currentView !== 'admin-editor') {
      localStorage.removeItem('learnhub_editing_course_id')
    }
  }, [editingCourse, currentView])

  const [courseProgress, setCourseProgress] = useState<Record<number, string[]>>({
    2: ['0-0', '0-1', '0-2'],
    3: ['0-0', '0-1'],
  })

  const [activePlan, setActivePlan] = useState<MembershipPlan>(MEMBERSHIP_PLANS[1])
  const [plansModalOpen, setPlansModalOpen] = useState(false)
  const [legalModalOpen, setLegalModalOpen] = useState(false)

  const [savedCards, setSavedCards] = useState<SavedCard[]>([])

  const [sandboxModal, setSandboxModal] = useState<SandboxCheckout | null>(null)
  const [checkoutError, setCheckoutError] = useState('')
  const [paying, setPaying] = useState(false)

  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const [transactions, setTransactions] = useState([
    { id: 'PAY-8821', student: 'Jorge López', item: 'React + TypeScript', date: '30 sep 2026', method: 'Visa •••• 4521', amount: '$89', type: 'INDIVIDUAL', status: 'COMPLETADO' },
    { id: 'SUB-3341', student: 'Ana García', item: 'Plan Semestral UTP (6 Meses)', date: '29 sep 2026', method: 'Mastercard •••• 7823', amount: '$139', type: 'SUSCRIPCIÓN', status: 'COMPLETADO' },
    { id: 'SUB-3340', student: 'María Torres', item: 'Plan Mensual (1 Mes)', date: '28 sep 2026', method: 'Visa •••• 1234', amount: '$29', type: 'SUSCRIPCIÓN', status: 'FALLIDO' },
    { id: 'PAY-8818', student: 'Valentina Torres', item: 'CSS Avanzado', date: '27 sep 2026', method: 'Mastercard •••• 3456', amount: '$49', type: 'INDIVIDUAL', status: 'REEMBOLSADO' },
  ])

  // Cargar transacciones financieras reales desde MySQL
  const cargarTransacciones = async () => {
    try {
      const res = await apiObtenerTransaccionesAdmin()
      if (res && res.transacciones && res.transacciones.length > 0) {
        setTransactions(res.transacciones)
      }
    } catch (err: any) {
      console.warn('⚠️ No se pudieron cargar transacciones de MySQL:', err.message)
    }
  }

  // 🚀 Conexión con el Backend: Cargar cursos desde Node.js (MySQL en Aiven)
  useEffect(() => {
    const isAdmin = currentUser?.role === 'admin'
    apiObtenerCursos(isAdmin)
      .then((cursosBackend) => {
        if (cursosBackend && cursosBackend.length > 0) {
          console.log('✅ Cursos recibidos desde el backend de Node.js:', cursosBackend)
          setCourses(cursosBackend)
        }
      })
      .catch((err) => {
        console.warn('⚠️ Backend no disponible en localhost:4000, usando catálogo de respaldo:', err.message)
      })

    if (isAdmin) {
      cargarTransacciones()
    }
  }, [currentUser?.role, currentView])

  useEffect(() => {
    localStorage.setItem('learnhub_users_v5', JSON.stringify(registeredUsers))
  }, [registeredUsers])

  useEffect(() => {
    localStorage.setItem('learnhub_courses_v5', JSON.stringify(courses))
  }, [courses])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('learnhub_session_v5', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('learnhub_session_v5')
    }
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('learnhub_view_v5', currentView)
  }, [currentView])

  const updateCurrentUserData = (updated: UserData) => {
    setCurrentUser(updated)
    setRegisteredUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  const handleLogin = (user: UserData) => {
    setCurrentUser(user)
    if (user.purchasedCourseIds && user.purchasedCourseIds.length > 0) {
      setActiveCourseId(user.purchasedCourseIds[0])
    }
    if (user.role === 'admin') {
      setCurrentView('admin-overview')
    } else if (user.role === 'teacher') {
      setCurrentView('teacher-panel')
    } else {
      setCurrentView('catalog')
    }
  }

  const handleRegisterUser = (newUser: UserData) => {
    setRegisteredUsers((prev) => [...prev, newUser])
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView('login')
    localStorage.removeItem('learnhub_jwt')
    localStorage.removeItem('learnhub_session_v5')
    localStorage.removeItem('learnhub_view_v5')
    localStorage.removeItem('learnhub_active_course_id')
  }

  const handleOpenCoursePlayer = (courseId: number) => {
    setActiveCourseId(courseId)
    setCurrentView('player')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggleLessonComplete = (courseId: number, lessonKey: string) => {
    setCourseProgress((prev) => {
      const currentList = prev[courseId] || []
      const exists = currentList.includes(lessonKey)
      const nextList = exists
        ? currentList.filter((k) => k !== lessonKey)
        : [...currentList, lessonKey]
      return { ...prev, [courseId]: nextList }
    })
  }

  // ==================== FUNCIONES CRUD DEL ADMINISTRADOR ====================
  const handleStartCreateCourse = () => {
    setEditingCourse(null)
    setCurrentView('admin-editor')
  }

  const handleStartEditCourse = (course: CourseItem) => {
    setEditingCourse(course)
    setCurrentView('admin-editor')
  }

  const handleSaveCourseFromEditor = async (savedCourse: CourseItem) => {
    const isNew = !courses.some((c) => c.id === savedCourse.id)

    try {
      const payload = {
        titulo: savedCourse.title,
        descripcion: savedCourse.description,
        categoria: savedCourse.category,
        nivel: savedCourse.level,
        precio: savedCourse.price,
        modelo_cobro: savedCourse.modelo_cobro || 'Ambos',
        status: savedCourse.status,
        imagen_url: savedCourse.image,
        instructor: savedCourse.instructor,
        duracion: savedCourse.duration,
        modules: savedCourse.modules,
        recursos: savedCourse.recursos,
        evaluacion_preguntas: savedCourse.evaluacion_preguntas,
      }

      if (isNew) {
        const res = await apiCrearCurso(payload)
        const idGenerado = res.curso?.id_curso || savedCourse.id
        const persistentCourse: CourseItem = { ...savedCourse, id: idGenerado }
        setCourses((prev) => [persistentCourse, ...prev.filter((c) => c.id !== persistentCourse.id)])
      } else {
        await apiActualizarCurso(savedCourse.id, payload)
        setCourses((prev) =>
          prev.map((c) => (c.id === savedCourse.id ? savedCourse : c))
        )
      }

      // Sincronizar catálogo completo desde MySQL incluyendo borradores del admin
      const cursosActualizados = await apiObtenerCursos(true)
      if (cursosActualizados && cursosActualizados.length > 0) {
        setCourses(cursosActualizados)
      }
    } catch (err: any) {
      console.warn('⚠️ Guardando curso en estado local:', err.message)
      setCourses((prev) => {
        const exists = prev.some((c) => c.id === savedCourse.id)
        if (exists) {
          return prev.map((c) => (c.id === savedCourse.id ? savedCourse : c))
        }
        return [savedCourse, ...prev]
      })
    }
  }

  const handleToggleCourseStatus = async (courseId: number) => {
    const course = courses.find((c) => c.id === courseId)
    if (!course) return
    const nextStatus = course.status === 'PUBLICADO' ? 'BORRADOR' : 'PUBLICADO'

    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: nextStatus } : c))
    )

    try {
      await apiActualizarCurso(courseId, { status: nextStatus })
    } catch (err: any) {
      console.warn('⚠️ Error al actualizar estado en MySQL:', err.message)
    }
  }

  const handleDuplicateCourse = async (course: CourseItem) => {
    try {
      const res = await apiCrearCurso({
        titulo: `${course.title} (Copia)`,
        descripcion: course.description,
        categoria: course.category,
        nivel: course.level,
        precio: course.price,
        status: 'BORRADOR',
        imagen_url: course.image,
        instructor: course.instructor,
        duracion: course.duration,
        modules: course.modules,
      })
      const newId = res.curso?.id_curso || Date.now()
      const copy: CourseItem = {
        ...course,
        id: newId,
        title: `${course.title} (Copia)`,
        status: 'BORRADOR',
        students: 0,
      }
      setCourses((prev) => [copy, ...prev])
    } catch (err: any) {
      console.warn('⚠️ Guardando copia local:', err.message)
      const copy: CourseItem = {
        ...course,
        id: Date.now(),
        title: `${course.title} (Copia)`,
        status: 'BORRADOR',
        students: 0,
      }
      setCourses((prev) => [copy, ...prev])
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId))
    try {
      await apiEliminarCurso(courseId)
    } catch (err: any) {
      console.warn('⚠️ Error al eliminar curso en MySQL:', err.message)
    }
  }

  const handleRefundTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'REEMBOLSADO' } : t))
    )
  }

  const handleRetryTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'COMPLETADO' } : t))
    )
  }

  const openProfileModal = () => {
    if (!currentUser) return
    setProfileModalOpen(true)
  }

  const handleProfileUpdated = (updatedUser: UserData) => {
    updateCurrentUserData(updatedUser)
  }

  const handlePasswordChanged = () => {
    setProfileModalOpen(false)
    handleLogout()
  }

  const fullName = currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Bruno Cusi'

  const handleConfirmSandboxPayment = async ({
    methodUsed,
    last4,
    cardToSave,
  }: {
    methodUsed: string
    last4: string
    cardToSave: SavedCard | null
  }) => {
    if (!sandboxModal || !currentUser || paying) return
    setCheckoutError('')

    // 🚀 Pago real contra el backend: guarda en Transaccion / Inscripcion / Suscripcion (MySQL en Aiven)
    setPaying(true)
    try {
      if (!getAuthToken()) {
        throw new Error('Tu sesión no está conectada al servidor. Cierra sesión e inicia con una cuenta real.')
      }
      if (sandboxModal.type === 'membership' && sandboxModal.plan) {
        const idPlan = PLAN_DB_ID[sandboxModal.plan.months]
        await apiSuscribirPlan(idPlan, last4)
      } else if (sandboxModal.type === 'course' && sandboxModal.courseId) {
        await apiComprarCurso(sandboxModal.courseId, last4)
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'No se pudo procesar el pago.')
      setPaying(false)
      return
    }
    setPaying(false)

    if (cardToSave) {
      setSavedCards((prev) => [...prev, cardToSave])
    }

    if (sandboxModal.type === 'membership' && sandboxModal.plan) {
      setActivePlan(sandboxModal.plan)
      updateCurrentUserData({
        ...currentUser,
        hasMembership: true,
      })
      setTransactions((prev) => [
        {
          id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
          student: fullName,
          item: sandboxModal.plan!.name,
          date: 'Hoy',
          method: methodUsed,
          amount: `$${sandboxModal.price}`,
          type: 'SUSCRIPCIÓN',
          status: 'COMPLETADO',
        },
        ...prev,
      ])
    } else if (sandboxModal.type === 'course' && sandboxModal.courseId) {
      const currentPurchased = currentUser.purchasedCourseIds || []
      updateCurrentUserData({
        ...currentUser,
        purchasedCourseIds: currentPurchased.includes(sandboxModal.courseId)
          ? currentPurchased
          : [...currentPurchased, sandboxModal.courseId],
      })
      setActiveCourseId(sandboxModal.courseId)
      setTransactions((prev) => [
        {
          id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          student: fullName,
          item: sandboxModal.title,
          date: 'Hoy',
          method: methodUsed,
          amount: `$${sandboxModal.price}`,
          type: 'INDIVIDUAL',
          status: 'COMPLETADO',
        },
        ...prev,
      ])
    }

    setSandboxModal(null)
    cargarTransacciones()
  }

  const handleCancelMembership = () => {
    if (!currentUser) return
    updateCurrentUserData({
      ...currentUser,
      hasMembership: false,
    })
  }

  const currentPlayingCourse =
    courses.find((c) => c.id === activeCourseId) || courses[0]

  return (
    <div className="min-h-screen">
      {currentView === 'login' && (
        <LoginView
          onLogin={handleLogin}
          registeredUsers={registeredUsers}
          onRegisterUser={handleRegisterUser}
        />
      )}
      {currentView === 'catalog' && (
        <CatalogView
          courses={courses}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          onOpenCoursePlayer={handleOpenCoursePlayer}
          onBuyCourse={(course: CourseItem) => {
            setCheckoutError('')
            setSandboxModal({
              type: 'course',
              courseId: course.id,
              title: course.title,
              price: course.price,
            })
          }}
          onOpenPlansModal={() => setPlansModalOpen(true)}
          hasMembership={Boolean(currentUser?.hasMembership)}
          membershipPlanName={activePlan.name}
          purchasedCourseIds={currentUser?.purchasedCourseIds || []}
          userName={fullName}
          userRole={currentUser?.role}
          onOpenProfile={openProfileModal}
        />
      )}
      {currentView === 'dashboard' && (
        <DashboardView
          courses={courses}
          courseProgress={courseProgress}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          onOpenCoursePlayer={handleOpenCoursePlayer}
          onOpenPlansModal={() => setPlansModalOpen(true)}
          onCancelMembership={handleCancelMembership}
          hasMembership={Boolean(currentUser?.hasMembership)}
          membershipPlanName={activePlan.name}
          membershipMonths={activePlan.months}
          membershipExpiresAt={activePlan.expiresLabel}
          purchasedCourseIds={currentUser?.purchasedCourseIds || []}
          savedCards={savedCards}
          onAddCard={(card) => setSavedCards((prev) => [...prev, card])}
          onDeleteCard={(id) => setSavedCards((prev) => prev.filter((c) => c.id !== id))}
          userName={fullName}
          onOpenProfile={openProfileModal}
        />
      )}
      {currentView === 'teacher-panel' && (
        <TeacherDashboard
          courses={courses}
          currentUser={currentUser}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          onOpenCoursePlayer={handleOpenCoursePlayer}
          onEditCourse={handleStartEditCourse}
          onCreateNewCourse={handleStartCreateCourse}
          onOpenProfile={openProfileModal}
        />
      )}
      {currentView === 'player' && (
        <PlayerView
          course={currentPlayingCourse}
          completedLessonIds={courseProgress[currentPlayingCourse.id] || []}
          onToggleLessonComplete={handleToggleLessonComplete}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          currentUser={currentUser}
          onUpdateCourse={(updated) => {
            setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
          }}
        />
      )}
      {currentView === 'admin-overview' && (
        <AdminOverview
          courses={courses}
          transactions={transactions}
          totalStudentsCount={registeredUsers.filter((u) => u.role === 'student').length}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          onCreateNewCourse={handleStartCreateCourse}
        />
      )}
      {currentView === 'admin-catalog' && (
        <CatalogManagement
          courses={courses}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          onCreateNewCourse={handleStartCreateCourse}
          onEditCourse={handleStartEditCourse}
          onToggleCourseStatus={handleToggleCourseStatus}
          onDuplicateCourse={handleDuplicateCourse}
          onDeleteCourse={handleDeleteCourse}
          onOpenCoursePlayer={handleOpenCoursePlayer}
        />
      )}
      {currentView === 'admin-editor' && (
        <CourseEditor
          initialCourse={editingCourse}
          onSaveCourse={handleSaveCourseFromEditor}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          currentUser={currentUser}
        />
      )}
      {currentView === 'admin-finance' && (
        <TransactionsCenter
          transactions={transactions}
          registeredUsers={registeredUsers}
          onRefundTransaction={handleRefundTransaction}
          onRetryTransaction={handleRetryTransaction}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
          onRefresh={cargarTransacciones}
        />
      )}
      {currentView === 'admin-users' && (
        <UserManagement
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
        />
      )}

      {/* Modal Selector de Planes por Meses (Modularizado) */}
      <PlansModal
        isOpen={plansModalOpen}
        onClose={() => setPlansModalOpen(false)}
        plans={MEMBERSHIP_PLANS}
        onSelectPlan={(plan) => {
          setPlansModalOpen(false)
          setCheckoutError('')
          setSandboxModal({
            type: 'membership',
            plan,
            title: `${plan.name} — Acceso Ilimitado`,
            price: plan.totalPrice,
          })
        }}
      />

      {/* Modal Pasarela Sandbox de Pagos (Modularizado) */}
      <CheckoutModal
        modalData={sandboxModal}
        onClose={() => setSandboxModal(null)}
        savedCards={savedCards}
        fullName={fullName}
        userEmail={currentUser?.correo}
        paying={paying}
        checkoutError={checkoutError}
        onConfirmPayment={handleConfirmSandboxPayment}
      />

      {/* Modal Mi Perfil con Persistencia en MySQL y BCrypt */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={handleProfileUpdated}
        onPasswordChanged={handlePasswordChanged}
      />

      {/* Puntos 01 y 02: Modal Legal y Privacidad (Ley N.° 29733 de Perú) */}
      <LegalModal isOpen={legalModalOpen} onClose={() => setLegalModalOpen(false)} />

      {/* Punto 03: Banner flotante de consentimiento de cookies */}
      <CookieBanner onOpenLegal={() => setLegalModalOpen(true)} />

      {/* Punto 18: Botón flotante de WhatsApp para soporte */}
      <WhatsAppButton />

      {/* Punto 15: Vista 404 personalizada si la ruta no existe */}
      {!['login', 'catalog', 'dashboard', 'player', 'teacher-panel', 'admin-overview', 'admin-catalog', 'admin-editor', 'admin-finance'].includes(currentView) && (
        <NotFoundView onGoHome={() => setCurrentView('catalog')} />
      )}
    </div>
  )
}