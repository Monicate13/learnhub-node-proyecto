import { pool } from "../config/db.js";

export const seed2026Courses = async () => {
  console.log("🌱 Iniciando sincronización de cursos 2026 para principiantes...");

  const coursesData = [
    {
      id_curso: 3,
      id_categoria: 2, // Frontend
      titulo: "Lógica de Programación y Fundamentos de JavaScript Moderno (2026)",
      descripcion: "Aprende a programar desde cero sin conocimientos previos. Domina variables, estructuras de control, funciones, arreglos, manipulación del DOM y sintaxis moderna ES2026 con ejercicios prácticos y proyectos del mundo real.",
      nivel: "Principiante",
      modelo_cobro: "Ambos",
      precio: 39,
      estado_publicacion: "Publicado",
      instructor: "Carlos Mendoza",
      duracion: "28h 30m",
      imagen_url: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80",
      modules: [
        {
          title: "Módulo 1: Pensamiento Lógico y Primeros Pasos con JavaScript",
          duration: "6h 15m",
          lessons: [
            {
              title: "1.1 ¿Cómo piensa una computadora? Algoritmos y pseudocódigo",
              time: "18:40",
              free: true,
              video_url: "https://www.youtube.com/embed/7iobxzd_2wY",
              description: "Entender el flujo secuencial de instrucciones, toma de decisiones y cómo descomponer un problema complejo en pasos simples."
            },
            {
              title: "1.2 Configuración del entorno: Node.js, VS Code y extensiones 2026",
              time: "24:10",
              free: true,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Instalación paso a paso de Visual Studio Code, configuración de ESLint, Prettier y ejecución de scripts mediante terminal integrada."
            },
            {
              title: "1.3 Variables, tipos de datos primitivos y operadores",
              time: "22:50",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Uso correcto de const y let, tipos de datos String, Number, Boolean, BigInt, Symbol y operadores aritméticos y lógicos."
            }
          ]
        },
        {
          title: "Módulo 2: Estructuras de Control y Modularización",
          duration: "8h 45m",
          lessons: [
            {
              title: "2.1 Condicionales if/else, switch y operador ternario",
              time: "20:30",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Toma de decisiones en el código, tablas de verdad y simplificación de condiciones con cortocircuito lógico."
            },
            {
              title: "2.2 Bucles modernos: for, for...of, while y métodos funcionales",
              time: "26:15",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Iteración sobre colecciones de datos, cómo evitar bucles infinitos y uso de break y continue."
            },
            {
              title: "2.3 Funciones flecha, parámetros por defecto y ámbito léxico",
              time: "25:40",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Creación de funciones puras, reutilización de lógica y comprensión del Scope global versus local."
            }
          ]
        },
        {
          title: "Módulo 3: Estructuras de Datos y Proyecto Práctico",
          duration: "13h 35m",
          lessons: [
            {
              title: "3.1 Arreglos y métodos esenciales: map, filter, reduce",
              time: "28:10",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Transformación y filtrado de datos sin mutar el arreglo original siguiendo principios de programación funcional."
            },
            {
              title: "3.2 Objetos literales, desestructuración y operador Spread",
              time: "22:15",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Modelado de entidades del mundo real en objetos clave-valor, clonación segura y extracción limpia de propiedades."
            },
            {
              title: "3.3 Proyecto: Calculadora de Presupuesto Personal Interactiva",
              time: "32:00",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Construcción completa de una aplicación de consola y navegador que gestiona ingresos, gastos y ahorros."
            }
          ]
        }
      ],
      recursos: [
        {
          id: "res-js-1",
          name: "CheatSheet_JavaScript_Moderno_2026.pdf",
          size: "2.4 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "1.3 Variables, tipos de datos primitivos y operadores"
        },
        {
          id: "res-js-2",
          name: "Guia_Ejercicios_Algoritmos_Resueltos.pdf",
          size: "3.8 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "2.1 Condicionales if/else, switch y operador ternario"
        },
        {
          id: "res-js-3",
          name: "Codigo_Proyecto_Calculadora_Presupuesto.zip",
          size: "1.2 MB",
          type: "zip",
          url: "https://github.com",
          lesson: "3.3 Proyecto: Calculadora de Presupuesto Personal Interactiva"
        }
      ],
      evaluacion_preguntas: [
        {
          id: 1,
          question: "¿Cuál es la diferencia fundamental entre declarar una variable con 'const' y 'let' en JavaScript?",
          options: [
            "'const' crea una referencia inmutable que no puede ser reasignada, mientras que 'let' sí permite reasignación",
            "'const' solo existe en funciones y 'let' solo en bucles",
            "'let' convierte todos los valores en cadenas de texto",
            "No existe ninguna diferencia; son exactamente equivalentes"
          ],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Qué retorna el método Array.prototype.filter() cuando ninguna condición coincide?",
          options: [
            "Un arreglo vacío []",
            "null",
            "undefined",
            "Lanza un error de tipo TypeError"
          ],
          correctIndex: 0
        },
        {
          id: 3,
          question: "¿Para qué sirve el operador Spread (...) al trabajar con arreglos u objetos?",
          options: [
            "Para expandir o clonar los elementos de una colección en una nueva estructura sin mutar la original",
            "Para eliminar los elementos duplicados de la memoria RAM",
            "Para pausar la ejecución del hilo principal de JavaScript",
            "Para forzar la conversión de números a booleanos"
          ],
          correctIndex: 0
        },
        {
          id: 4,
          question: "¿Cuál es el resultado de evaluar: Boolean(0) en JavaScript?",
          options: [
            "false, ya que el número 0 es un valor 'falsy'",
            "true, porque es un número definido",
            "undefined",
            "NaN"
          ],
          correctIndex: 0
        }
      ]
    },
    {
      id_curso: 1,
      id_categoria: 1, // Data Science
      titulo: "Python desde Cero e Introducción a la Inteligencia Artificial (2026)",
      descripcion: "Iníciate en Python con las mejores prácticas del 2026. Aprende la sintaxis limpia del lenguaje más popular, automatiza tareas cotidianas, manipula datos con Pandas y realiza tus primeras integraciones con modelos de Inteligencia Artificial Generativa.",
      nivel: "Principiante",
      modelo_cobro: "Ambos",
      precio: 49,
      estado_publicacion: "Publicado",
      instructor: "Roberto Cruz",
      duracion: "32h 0m",
      imagen_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      modules: [
        {
          title: "Módulo 1: Fundamentos y Sintaxis Clara de Python",
          duration: "7h 30m",
          lessons: [
            {
              title: "1.1 Bienvenida al curso e instalación de Python 3.12+ y Jupyter",
              time: "16:20",
              free: true,
              video_url: "https://www.youtube.com/embed/7iobxzd_2wY",
              description: "Instalación del intérprete oficial de Python, configuración de entornos virtuales (venv) y primeros comandos interactivos."
            },
            {
              title: "1.2 Variables dinámicas, f-strings y entrada por teclado",
              time: "21:10",
              free: true,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Manejo de cadenas formateadas, conversión de tipos con int() y float(), y captura de datos con input()."
            },
            {
              title: "1.3 Estructuras clave: Listas, Tuplas, Diccionarios y Sets",
              time: "29:45",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Diferencias de mutabilidad, indexación, métodos útiles (append, pop, keys, items) y comprensión de listas."
            }
          ]
        },
        {
          title: "Módulo 2: Modularidad, Archivos y Automatización",
          duration: "10h 15m",
          lessons: [
            {
              title: "2.1 Creación de funciones reutilizables con Type Hints",
              time: "22:15",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Anotaciones de tipo para código robusto, valores por defecto y retorno múltiple en tuplas."
            },
            {
              title: "2.2 Lectura y escritura de archivos CSV y JSON",
              time: "25:30",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Uso del context manager with open(), procesamiento estructurado de datasets y serialización JSON."
            },
            {
              title: "2.3 Scripting práctico: Automatización de reportes",
              time: "28:00",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Automatización de lectura de hojas de cálculo y exportación de resúmenes consolidados."
            }
          ]
        },
        {
          title: "Módulo 3: Primeros pasos con IA y APIs Modernas",
          duration: "14h 15m",
          lessons: [
            {
              title: "3.1 Introducción a Pandas: DataFrames y análisis exploratorio",
              time: "31:20",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Carga de datos masivos, filtrado por columnas, estadísticas descriptivas y detección de valores nulos."
            },
            {
              title: "3.2 Conectando Python con APIs de Inteligencia Artificial (Gemini API)",
              time: "33:40",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Uso de requests y librerías oficiales para enviar prompts, recibir respuestas estructuradas y generar análisis inteligentes."
            }
          ]
        }
      ],
      recursos: [
        {
          id: "res-py-1",
          name: "Manual_Python_Sintaxis_Limpia_2026.pdf",
          size: "3.1 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "1.2 Variables dinámicas, f-strings y entrada por teclado"
        },
        {
          id: "res-py-2",
          name: "Jupyter_Notebooks_Ejercicios_Completos.zip",
          size: "4.5 MB",
          type: "zip",
          url: "https://github.com",
          lesson: "3.1 Introducción a Pandas: DataFrames y análisis exploratorio"
        }
      ],
      evaluacion_preguntas: [
        {
          id: 1,
          question: "¿Cuál es la principal ventaja de utilizar el context manager 'with open(...)' en Python al leer archivos?",
          options: [
            "Garantiza que el archivo se cierre automáticamente incluso si ocurre una excepción",
            "Hace que el archivo sea indestructible en el disco",
            "Traduce el archivo automáticamente a lenguaje C",
            "Comprime el archivo en formato ZIP en segundo plano"
          ],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Qué tipo de dato en Python se caracteriza por ser inmutable y ordenado?",
          options: [
            "Tupla (tuple)",
            "Lista (list)",
            "Diccionario (dict)",
            "Conjunto (set)"
          ],
          correctIndex: 0
        },
        {
          id: 3,
          question: "¿Cuál es la forma moderna recomendada para formatear cadenas de texto en Python 3?",
          options: [
            "f-strings (ej. f'Hola, {nombre}')",
            "Concatenación manual con operador + repetido",
            "Operador de porcentaje antiguo %s",
            "Llamar al comando print() una vez por cada palabra"
          ],
          correctIndex: 0
        }
      ]
    },
    {
      id_curso: 2,
      id_categoria: 2, // Frontend
      titulo: "Desarrollo Frontend Moderno con React 19 y Tailwind CSS (2026)",
      descripcion: "Aprende el estándar del desarrollo web moderno. Domina React 19, componentes funcionales, useState, useEffect, diseño de interfaces responsivas con Tailwind CSS y consumo de APIs REST.",
      nivel: "Principiante",
      modelo_cobro: "Ambos",
      precio: 59,
      estado_publicacion: "Publicado",
      instructor: "Carlos Mendoza",
      duracion: "35h 0m",
      imagen_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
      modules: [
        {
          title: "Módulo 1: Fundamentos de Componentes e Interfaces Modernas",
          duration: "9h 30m",
          lessons: [
            {
              title: "1.1 Introducción a React 19 y configuración con Vite",
              time: "19:50",
              free: true,
              video_url: "https://www.youtube.com/embed/7iobxzd_2wY",
              description: "Arquitectura basada en componentes, JSX y arranque de proyectos ultrarrápidos con Vite."
            },
            {
              title: "1.2 Maquetación atómica con Tailwind CSS",
              time: "24:30",
              free: true,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Clases utilitarias, Flexbox, Grid, estados hover, focus y diseño adaptado a móviles y tablets."
            },
            {
              title: "1.3 Props y reusabilidad de componentes",
              time: "22:10",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Paso de datos unidireccional, children props y buenas prácticas de tipado en TypeScript."
            }
          ]
        },
        {
          title: "Módulo 2: Estado, Efectos y Formularios Reactivos",
          duration: "11h 0m",
          lessons: [
            {
              title: "2.1 Manejo de estado con el hook useState",
              time: "26:40",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Renderizado reactivo, inmutabilidad y actualización de listas y objetos en el estado."
            },
            {
              title: "2.2 Ciclo de vida y efectos secundarios con useEffect",
              time: "29:15",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Peticiones asíncronas con fetch, sincronización con APIs externas y funciones de limpieza (cleanup)."
            }
          ]
        },
        {
          title: "Módulo 3: Proyecto Final Full Responsive",
          duration: "14h 30m",
          lessons: [
            {
              title: "3.1 Dashboard Interactivo de Cursos y Métricas",
              time: "35:00",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Integración de componentes complejos, filtros en vivo, modales accesibles y animaciones con Tailwind."
            }
          ]
        }
      ],
      recursos: [
        {
          id: "res-react-1",
          name: "Guia_React_19_Hooks_y_Componentes.pdf",
          size: "2.8 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "1.1 Introducción a React 19 y configuración con Vite"
        },
        {
          id: "res-react-2",
          name: "Plantilla_Starter_React19_Tailwind.zip",
          size: "3.4 MB",
          type: "zip",
          url: "https://github.com",
          lesson: "1.2 Maquetación atómica con Tailwind CSS"
        }
      ],
      evaluacion_preguntas: [
        {
          id: 1,
          question: "¿Por qué en React 19 no debemos mutar directamente el estado (ej. state.push(item))?",
          options: [
            "Porque React detecta los cambios mediante comparación de referencias inmutables para re-renderizar la vista",
            "Porque el navegador bloquea la memoria si un arreglo cambia de tamaño",
            "Porque el estado solo acepta valores de tipo boolean",
            "Porque causa un reinicio de la base de datos"
          ],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Qué utilidad tiene el arreglo de dependencias en el hook useEffect?",
          options: [
            "Determina en qué momentos debe volver a ejecutarse el efecto según los valores que hayan cambiado",
            "Sirve para listar los estilos CSS que necesita el componente",
            "Convierte las funciones síncronas en promesas nativas",
            "Obliga a que el componente se monte dos veces en producción"
          ],
          correctIndex: 0
        }
      ]
    },
    {
      id_curso: 8,
      id_categoria: 3, // Backend
      titulo: "Bases de Datos Relacionales con MySQL y Node.js (2026)",
      descripcion: "Domina el almacenamiento de información empresarial. Aprende a diseñar esquemas normalizados, tablas, llaves primarias/foráneas, consultas SQL optimizadas (SELECT, JOIN, GROUP BY) y a conectarte desde una API REST en Node.js.",
      nivel: "Principiante",
      modelo_cobro: "Individual",
      precio: 45,
      estado_publicacion: "Publicado",
      instructor: "Héctor Leandro Soto Crespo",
      duracion: "26h 40m",
      imagen_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
      modules: [
        {
          title: "Módulo 1: Diseño Relacional y Modelado de Datos",
          duration: "8h 20m",
          lessons: [
            {
              title: "1.1 Conceptos relacionales: Tablas, Filas, Columnas y Claves",
              time: "20:10",
              free: true,
              video_url: "https://www.youtube.com/embed/7iobxzd_2wY",
              description: "Qué es una base de datos relacional, integridad referencial y modelado Entidad-Relación (ER)."
            },
            {
              title: "1.2 Tipos de datos SQL y restricciones (PRIMARY KEY, FOREIGN KEY, NOT NULL)",
              time: "22:45",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Selección precisa de tipos VARCHAR, INT, DECIMAL, TIMESTAMP y diseño sin redundancia."
            }
          ]
        },
        {
          title: "Módulo 2: Consultas SQL Profesionales",
          duration: "10h 10m",
          lessons: [
            {
              title: "2.1 Consultas SELECT, filtros WHERE, ORDER BY y LIMIT",
              time: "25:30",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Recuperación de datos eficiente, operadores lógicos y paginación de registros."
            },
            {
              title: "2.2 Uniones relacionales con INNER JOIN y LEFT JOIN",
              time: "28:50",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Combinación de información entre tablas múltiples respetando la integridad referencial."
            }
          ]
        },
        {
          title: "Módulo 3: Conexión con Node.js y Express",
          duration: "8h 10m",
          lessons: [
            {
              title: "3.1 Creación de Pool de Conexiones con mysql2/promise",
              time: "26:00",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Gestión eficiente de conexiones concurrentes y prevención de inyecciones SQL mediante consultas parametrizadas."
            }
          ]
        }
      ],
      recursos: [
        {
          id: "res-sql-1",
          name: "Guia_SQL_Consultas_y_Joins_2026.pdf",
          size: "2.1 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "2.2 Uniones relacionales con INNER JOIN y LEFT JOIN"
        },
        {
          id: "res-sql-2",
          name: "Diagrama_ER_Base_Datos_LearnHub.pdf",
          size: "1.6 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "1.1 Conceptos relacionales: Tablas, Filas, Columnas y Claves"
        }
      ],
      evaluacion_preguntas: [
        {
          id: 1,
          question: "¿Cuál es la principal diferencia entre un INNER JOIN y un LEFT JOIN?",
          options: [
            "INNER JOIN solo devuelve filas que coinciden en ambas tablas, mientras que LEFT JOIN incluye todas las filas de la tabla izquierda aunque no tengan coincidencia",
            "LEFT JOIN elimina permanentemente los datos de la tabla derecha",
            "INNER JOIN solo funciona con números enteros",
            "No existe ninguna diferencia; son sinónimos"
          ],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Por qué es crucial utilizar consultas preparadas (queries parametrizadas con '?') en Node.js?",
          options: [
            "Para prevenir vulnerabilidades graves de Inyección SQL (SQL Injection)",
            "Para cambiar el color de la consola en Node.js",
            "Porque MySQL no acepta consultas sin el signo de interrogación",
            "Para reiniciar el servicio de base de datos automáticamente"
          ],
          correctIndex: 0
        }
      ]
    },
    {
      id_curso: 9,
      id_categoria: 4, // DevOps
      titulo: "Git, GitHub y Flujos de Trabajo para Desarrolladores Junior (2026)",
      descripcion: "El curso indispensable para todo programador. Domina el control de versiones, creación de ramas (branches), resolución de conflictos, Pull Requests en GitHub, Conventional Commits y publicación de proyectos en la nube.",
      nivel: "Principiante",
      modelo_cobro: "Membresia",
      precio: 29,
      estado_publicacion: "Publicado",
      instructor: "Carlos Mendoza",
      duracion: "22h 15m",
      imagen_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80",
      modules: [
        {
          title: "Módulo 1: Control de Versiones Local con Git",
          duration: "7h 0m",
          lessons: [
            {
              title: "1.1 ¿Qué es Git? Instalación y configuración global",
              time: "15:30",
              free: true,
              video_url: "https://www.youtube.com/embed/7iobxzd_2wY",
              description: "Configuración de usuario, email, clave SSH y comprensión del working directory, staging area y repository."
            },
            {
              title: "1.2 El ciclo de vida de un cambio: git add, commit y log",
              time: "21:00",
              free: true,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Creación de commits atómicos con mensajes descriptivos siguiendo el estándar Conventional Commits."
            }
          ]
        },
        {
          title: "Módulo 2: Ramas, Fusiones y Colaboración en GitHub",
          duration: "9h 30m",
          lessons: [
            {
              title: "2.1 Creación de ramas (branches) y estrategias de flujo",
              time: "24:10",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Aislamiento de nuevas funcionalidades, git checkout -b, switch y buenas prácticas en equipo."
            },
            {
              title: "2.2 Fusión con git merge y resolución de conflictos paso a paso",
              time: "28:40",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Cómo entender las marcas de conflicto (<<<<<<<, =======, >>>>>>>) y resolver discrepancias limpiamente."
            }
          ]
        },
        {
          title: "Módulo 3: Colaboración Profesional y Pull Requests",
          duration: "5h 45m",
          lessons: [
            {
              title: "3.1 Creación de Pull Requests profesionales en GitHub",
              time: "26:00",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Redacción de descripciones claras, revisión de código por pares y merge exitoso en la rama main."
            }
          ]
        }
      ],
      recursos: [
        {
          id: "res-git-1",
          name: "Guia_Comandos_Git_Imprescindibles_2026.pdf",
          size: "1.9 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "1.2 El ciclo de vida de un cambio: git add, commit y log"
        }
      ],
      evaluacion_preguntas: [
        {
          id: 1,
          question: "¿Qué comando se utiliza para descartar los cambios no confirmados en un archivo del directorio de trabajo?",
          options: [
            "git restore <archivo>",
            "git push --force",
            "git delete branch",
            "git commit -m 'descartar'"
          ],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Cuál es la función principal de un archivo .gitignore?",
          options: [
            "Especificar archivos y carpetas locales (como node_modules o .env) que Git nunca debe rastrear ni subir al repositorio",
            "Ocultar los errores ortográficos del programador",
            "Borrar el historial de commits anteriores",
            "Acelerar la conexión a internet"
          ],
          correctIndex: 0
        }
      ]
    },
    {
      id_curso: 11,
      id_categoria: 3, // Backend
      titulo: "Estructuras de Datos y Algoritmos para Entrevistas Técnicas (2026)",
      descripcion: "Prepárate para superar entrevistas técnicas junior y resolver problemas de alta eficiencia. Aprende Notación Big-O, pilas, colas, árboles, grafos, algoritmos de búsqueda y ordenamiento.",
      nivel: "Intermedio",
      modelo_cobro: "Ambos",
      precio: 69,
      estado_publicacion: "Publicado",
      instructor: "Roberto Cruz",
      duracion: "30h 0m",
      imagen_url: "https://images.unsplash.com/photo-1516116211227-bbc679091993?auto=format&fit=crop&w=800&q=80",
      modules: [
        {
          title: "Módulo 1: Complejidad Algorítmica y Notación Big-O",
          duration: "8h 0m",
          lessons: [
            {
              title: "1.1 ¿Qué es la Notación Big-O? Complejidad Temporal y Espacial",
              time: "24:30",
              free: true,
              video_url: "https://www.youtube.com/embed/7iobxzd_2wY",
              description: "Comparativa entre O(1), O(log n), O(n), O(n log n) y O(n^2), y cómo analizar la escalabilidad de un algoritmo."
            },
            {
              title: "1.2 Arreglos dinámicos vs Listas enlazadas",
              time: "26:10",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Costos de inserción, eliminación y búsqueda en memoria continua versus nodos referenciados."
            }
          ]
        },
        {
          title: "Módulo 2: Pilas, Colas y Búsqueda Binaria",
          duration: "11h 0m",
          lessons: [
            {
              title: "2.1 Pilas (Stacks) y Colas (Queues): Patrones LIFO y FIFO",
              time: "25:40",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Casos de uso reales: historial de navegación, procesamiento de tareas en colas y validación de paréntesis."
            },
            {
              title: "2.2 Algoritmo de Búsqueda Binaria (Binary Search)",
              time: "28:15",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Resolución de problemas en O(log n) dividiendo el espacio de búsqueda a la mitad en arreglos ordenados."
            }
          ]
        },
        {
          title: "Módulo 3: Resolución de Casos Tipo LeetCode",
          duration: "11h 0m",
          lessons: [
            {
              title: "3.1 Problemas clásicos resueltos paso a paso",
              time: "34:20",
              free: false,
              video_url: "https://www.youtube.com/embed/W6NZfCO5SIk",
              description: "Patrón Two Pointers, Sliding Window y Hash Maps para reducir problemas de O(n^2) a O(n)."
            }
          ]
        }
      ],
      recursos: [
        {
          id: "res-dsa-1",
          name: "Guia_Big_O_Complejidad_y_Estructuras_2026.pdf",
          size: "2.6 MB",
          type: "pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          lesson: "1.1 ¿Qué es la Notación Big-O? Complejidad Temporal y Espacial"
        }
      ],
      evaluacion_preguntas: [
        {
          id: 1,
          question: "¿Cuál es la complejidad temporal de la Búsqueda Binaria (Binary Search) en el peor caso?",
          options: [
            "O(log n)",
            "O(n^2)",
            "O(1)",
            "O(n!)"
          ],
          correctIndex: 0
        },
        {
          id: 2,
          question: "¿Qué principio rige a una estructura de datos de tipo Pila (Stack)?",
          options: [
            "LIFO (Last In, First Out): El último elemento en entrar es el primero en salir",
            "FIFO (First In, First Out): El primer elemento en entrar es el primero en salir",
            "Acceso aleatorio en tiempo constante",
            "Ordenamiento por inserción automática"
          ],
          correctIndex: 0
        }
      ]
    }
  ];

  for (const c of coursesData) {
    const modJson = JSON.stringify(c.modules);
    const recJson = JSON.stringify(c.recursos);
    const pregJson = JSON.stringify(c.evaluacion_preguntas);

    // Actualizar curso existente o insertarlo
    await pool.query(
      `INSERT INTO Curso (
        id_curso, id_categoria, id_administrador, titulo, descripcion, nivel,
        modelo_cobro, precio, estado_publicacion, instructor, duracion, imagen_url,
        contenido_modulos, recursos, evaluacion_preguntas
      ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id_categoria = VALUES(id_categoria),
        titulo = VALUES(titulo),
        descripcion = VALUES(descripcion),
        nivel = VALUES(nivel),
        modelo_cobro = VALUES(modelo_cobro),
        precio = VALUES(precio),
        estado_publicacion = VALUES(estado_publicacion),
        instructor = VALUES(instructor),
        duracion = VALUES(duracion),
        imagen_url = VALUES(imagen_url),
        contenido_modulos = VALUES(contenido_modulos),
        recursos = VALUES(recursos),
        evaluacion_preguntas = VALUES(evaluacion_preguntas)`,
      [
        c.id_curso,
        c.id_categoria,
        c.titulo,
        c.descripcion,
        c.nivel,
        c.modelo_cobro,
        c.precio,
        c.estado_publicacion,
        c.instructor,
        c.duracion,
        c.imagen_url,
        modJson,
        recJson,
        pregJson
      ]
    );

    console.log(`✅ Curso sincronizado: "${c.titulo}" (Docente/Instructor: ${c.instructor})`);
  }

  // Asegurar preguntas en Foro_Pregunta para cada curso
  const sampleQuestions = [
    {
      id_curso: 3,
      id_usuario: 2,
      nombre_usuario: "Jorge Valdivia",
      rol_usuario: "Estudiante",
      leccion: "1.3 Variables, tipos de datos primitivos y operadores",
      pregunta: "Profesor Carlos, ¿cuándo es estrictamente necesario usar Symbol o BigInt en JavaScript para proyectos iniciales?",
      respuestas: JSON.stringify([
        {
          id: 1,
          author: "Carlos Mendoza",
          role: "Docente",
          text: "¡Excelente pregunta Jorge! En proyectos iniciales rara vez los necesitarás directamente. Number soporta enteros seguros hasta 9 billones (2^53 - 1). BigInt se usa para criptografía o IDs gigantescos de bases de datos, y Symbol para propiedades privadas de objetos.",
          date: "Hace 1 día"
        }
      ])
    },
    {
      id_curso: 1,
      id_usuario: 2,
      nombre_usuario: "Jorge Valdivia",
      rol_usuario: "Estudiante",
      leccion: "2.1 Creación de funciones reutilizables con Type Hints",
      pregunta: "¿Es obligatorio usar Type Hints en Python o solo es una buena práctica recomendada?",
      respuestas: JSON.stringify([
        {
          id: 1,
          author: "Roberto Cruz",
          role: "Administrador",
          text: "Hola Jorge. No son obligatorios porque Python sigue siendo de tipado dinámico, pero en equipos profesionales del 2026 se consideran indispensables para que el autocompletado y herramientas como mypy detecten errores antes de ejecutar el código.",
          date: "Hace 2 días"
        }
      ])
    },
    {
      id_curso: 2,
      id_usuario: 2,
      nombre_usuario: "Jorge Valdivia",
      rol_usuario: "Estudiante",
      leccion: "2.1 Manejo de estado con el hook useState",
      pregunta: "Profesor Carlos, ¿qué pasa si actualizo un arreglo en el estado haciendo arreglo.push()?",
      respuestas: JSON.stringify([
        {
          id: 1,
          author: "Carlos Mendoza",
          role: "Docente",
          text: "React no se dará cuenta de que cambió porque la referencia de memoria sigue siendo la misma. Siempre usa el operador spread: setArreglo([...arreglo, nuevoElemento]). Así creas una nueva referencia y React re-renderiza tu pantalla.",
          date: "Hace pocas horas"
        }
      ])
    }
  ];

  for (const q of sampleQuestions) {
    const [exist] = await pool.query(
      "SELECT id_pregunta FROM Foro_Pregunta WHERE id_curso = ? AND pregunta = ?",
      [q.id_curso, q.pregunta]
    );
    if (exist.length === 0) {
      await pool.query(
        `INSERT INTO Foro_Pregunta (id_curso, id_usuario, nombre_usuario, rol_usuario, leccion, pregunta, respuestas)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [q.id_curso, q.id_usuario, q.nombre_usuario, q.rol_usuario, q.leccion, q.pregunta, q.respuestas]
      );
    }
  }

  // Asegurar notas en Nota_Estudiante
  const sampleNotes = [
    {
      id_curso: 3,
      id_usuario: 2,
      leccion: "1.3 Variables, tipos de datos primitivos y operadores",
      texto: "Regla de oro: usar const por defecto siempre. Solo cambiar a let cuando una variable realmente vaya a reasignarse en un bucle o contador.",
      tiempo: "08:15"
    },
    {
      id_curso: 1,
      id_usuario: 2,
      leccion: "1.3 Estructuras clave: Listas, Tuplas, Diccionarios y Sets",
      texto: "Diferencia rápida: Listas son mutables []; Tuplas son inmutables (); Diccionarios son clave-valor {}; Sets no permiten duplicados.",
      tiempo: "14:20"
    },
    {
      id_curso: 2,
      id_usuario: 2,
      leccion: "1.2 Maquetación atómica con Tailwind CSS",
      texto: "Para centrar cualquier elemento en Tailwind: flex items-center justify-center. Para grid responsivo: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.",
      tiempo: "11:05"
    }
  ];

  for (const n of sampleNotes) {
    const [exist] = await pool.query(
      "SELECT id_nota FROM Nota_Estudiante WHERE id_curso = ? AND id_usuario = ? AND texto = ?",
      [n.id_curso, n.id_usuario, n.texto]
    );
    if (exist.length === 0) {
      await pool.query(
        `INSERT INTO Nota_Estudiante (id_curso, id_usuario, leccion, texto, tiempo)
         VALUES (?, ?, ?, ?, ?)`,
        [n.id_curso, n.id_usuario, n.leccion, n.texto, n.tiempo]
      );
    }
  }

  console.log("🎉 Sincronización de cursos 2026 completada exitosamente en MySQL.");
};
