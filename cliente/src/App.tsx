import { useState, useEffect } from 'react'
import { apiObtenerCursos, apiComprarCurso, apiSuscribirPlan, getAuthToken } from './services/api'
import LoginView, { type UserData } from './views/LoginView'
import CatalogView, { type CourseItem } from './views/CatalogView'
import DashboardView, { type SavedCard } from './views/DashboardView'
import PlayerView from './views/PlayerView'
import AdminOverview from './views/admin/AdminOverview'
import CatalogManagement from './views/admin/CatalogManagement'
import CourseEditor from './views/admin/CourseEditor'
import TransactionsCenter from './views/admin/TransactionsCenter'
import CookieBanner from './components/CookieBanner'
import WhatsAppButton from './components/WhatsAppButton'
import LegalModal from './components/LegalModal'
import NotFoundView from './components/NotFoundView'

export interface MembershipPlan {
  id: string
  name: string
  months: number
  totalPrice: number
  monthlyEquivalent: number
  badge?: string
  expiresLabel: string
  features: string[]
}

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
    id: 1,
    title: 'JavaScript Full Stack con Node.js',
    category: 'Backend',
    level: 'Intermedio',
    instructor: 'Valentina Torres',
    rating: 4.9,
    reviews: 3241,
    students: 3241,
    duration: '61h 45m',
    lessons: 96,
    price: 119,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    description: 'Domina el desarrollo Full Stack moderno construyendo APIs REST seguras con Node.js, Express y bases de datos relacionales.',
  },
  {
    id: 2,
    title: 'React + TypeScript: Aplicaciones Modernas',
    category: 'Frontend',
    level: 'Avanzado',
    instructor: 'Carlos Ruiz',
    rating: 4.8,
    reviews: 2103,
    students: 2103,
    duration: '38h 15m',
    lessons: 52,
    price: 89,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    description: 'Construye interfaces web escalables con React 19, tipado estricto en TypeScript, hooks personalizados y arquitectura limpia.',
  },
  {
    id: 3,
    title: 'Python para Ciencia de Datos',
    category: 'Data Science',
    level: 'Intermedio',
    instructor: 'Ana Martínez',
    rating: 4.9,
    reviews: 1842,
    students: 1842,
    duration: '42h 30m',
    lessons: 68,
    price: 79,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    description: 'Aprende Python aplicado a ciencia de datos con NumPy, Pandas, Matplotlib y Scikit-learn con datasets reales de la industria.',
  },
  {
    id: 4,
    title: 'Machine Learning con TensorFlow',
    category: 'IA & ML',
    level: 'Avanzado',
    instructor: 'Rafael Mendoza',
    rating: 4.8,
    reviews: 1456,
    students: 1456,
    duration: '48h 20m',
    lessons: 72,
    price: 99,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    description: 'Entrena redes neuronales profundas, modelos de clasificación y visión computacional utilizando TensorFlow y Keras.',
  },
  {
    id: 5,
    title: 'CSS Avanzado: Animaciones y Layout',
    category: 'Frontend',
    level: 'Principiante',
    instructor: 'Camila Restrepo',
    rating: 4.8,
    reviews: 1205,
    students: 1205,
    duration: '24h 10m',
    lessons: 38,
    price: 49,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    description: 'Domina CSS Grid, Flexbox, diseño responsivo moderno, variables CSS y micro-interacciones fluidas sin librerías externas.',
  },
  {
    id: 6,
    title: 'DevOps con Docker y Kubernetes',
    category: 'DevOps',
    level: 'Avanzado',
    instructor: 'Diego Fernández',
    rating: 4.7,
    reviews: 987,
    students: 987,
    duration: '55h 0m',
    lessons: 84,
    price: 95,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    description: 'Automatiza despliegues con contenedores Docker, orquestación en Kubernetes y pipelines de integración continua CI/CD.',
  },
  {
    id: 7,
    title: 'Diseño de APIs REST con Spring Boot',
    category: 'Backend',
    level: 'Intermedio',
    instructor: 'Roberto Cruz',
    rating: 4.6,
    reviews: 724,
    students: 724,
    duration: '30h 0m',
    lessons: 45,
    price: 69,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80',
    description: 'Desarrolla microservicios empresariales en Java con Spring Boot, Spring Security, JPA e integración con bases de datos.',
  },
  {
    id: 8,
    title: 'Desarrollo iOS con Swift y SwiftUI',
    category: 'Mobile',
    level: 'Principiante',
    instructor: 'Elena Vargas',
    rating: 4.7,
    reviews: 891,
    students: 891,
    duration: '34h 20m',
    lessons: 50,
    price: 75,
    status: 'PUBLICADO',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    description: 'Crea aplicaciones móviles nativas desde cero utilizando el lenguaje Swift e interfaces declarativas con SwiftUI.',
  },
]

interface SandboxCheckout {
  type: 'course' | 'membership'
  courseId?: number
  plan?: MembershipPlan
  title: string
  price: number
}

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
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null)

  const [activeCourseId, setActiveCourseId] = useState<number>(2)

  const [courseProgress, setCourseProgress] = useState<Record<number, string[]>>({
    2: ['0-0', '0-1', '0-2'],
    3: ['0-0', '0-1'],
  })

  const [activePlan, setActivePlan] = useState<MembershipPlan>(MEMBERSHIP_PLANS[1])
  const [plansModalOpen, setPlansModalOpen] = useState(false)
  const [legalModalOpen, setLegalModalOpen] = useState(false)

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: 'c1', brand: 'Visa', last4: '4821', holder: 'BRUNO CUSI', expiry: '09/28' },
    { id: 'c2', brand: 'Mastercard', last4: '7823', holder: 'BRUNO CUSI', expiry: '11/27' },
  ])

  const [sandboxModal, setSandboxModal] = useState<SandboxCheckout | null>(null)
  const [paymentMode, setPaymentMode] = useState<'saved' | 'new' | 'paypal'>('saved')
  const [selectedCardId, setSelectedCardId] = useState<string>('c1')
  const [newCardNumber, setNewCardNumber] = useState('')
  const [newCardHolder, setNewCardHolder] = useState('')
  const [newCardExpiry, setNewCardExpiry] = useState('')
  const [newCardCvv, setNewCardCvv] = useState('')
  const [saveNewCardCheck, setSaveNewCardCheck] = useState(true)
  const [checkoutError, setCheckoutError] = useState('')
  const [paying, setPaying] = useState(false)

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editApellido, setEditApellido] = useState('')
  const [profileSavedMsg, setProfileSavedMsg] = useState(false)

  const [transactions, setTransactions] = useState([
    { id: 'PAY-8821', student: 'Jorge López', item: 'React + TypeScript', date: '30 sep 2026', method: 'Visa •••• 4521', amount: '$89', type: 'INDIVIDUAL', status: 'COMPLETADO' },
    { id: 'SUB-3341', student: 'Ana García', item: 'Plan Semestral UTP (6 Meses)', date: '29 sep 2026', method: 'Mastercard •••• 7823', amount: '$139', type: 'SUSCRIPCIÓN', status: 'COMPLETADO' },
    { id: 'SUB-3340', student: 'María Torres', item: 'Plan Mensual (1 Mes)', date: '28 sep 2026', method: 'Visa •••• 1234', amount: '$29', type: 'SUSCRIPCIÓN', status: 'FALLIDO' },
    { id: 'PAY-8818', student: 'Valentina Torres', item: 'CSS Avanzado', date: '27 sep 2026', method: 'Mastercard •••• 3456', amount: '$49', type: 'INDIVIDUAL', status: 'REEMBOLSADO' },
  ])

  // 🚀 Conexión con el Backend: Cargar cursos desde Node.js (MySQL en Aiven)
  useEffect(() => {
    apiObtenerCursos()
      .then((cursosBackend) => {
        if (cursosBackend && cursosBackend.length > 0) {
          console.log('✅ Cursos recibidos desde el backend de Node.js:', cursosBackend)
          setCourses(cursosBackend)
        }
      })
      .catch((err) => {
        console.warn('⚠️ Backend no disponible en localhost:4000, usando catálogo de respaldo:', err.message)
      })
  }, [])

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
    setCurrentView(user.role === 'admin' ? 'admin-overview' : 'catalog')
  }

  const handleRegisterUser = (newUser: UserData) => {
    setRegisteredUsers((prev) => [...prev, newUser])
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView('login')
    localStorage.removeItem('learnhub_session_v5')
    localStorage.removeItem('learnhub_view_v5')
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

  const handleSaveCourseFromEditor = (savedCourse: CourseItem) => {
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === savedCourse.id)
      if (exists) {
        return prev.map((c) => (c.id === savedCourse.id ? savedCourse : c))
      }
      return [savedCourse, ...prev]
    })
  }

  const handleToggleCourseStatus = (courseId: number) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, status: c.status === 'PUBLICADO' ? 'BORRADOR' : 'PUBLICADO' }
          : c
      )
    )
  }

  const handleDuplicateCourse = (course: CourseItem) => {
    const copy: CourseItem = {
      ...course,
      id: Date.now(),
      title: `${course.title} (Copia)`,
      status: 'BORRADOR',
      students: 0,
    }
    setCourses((prev) => [copy, ...prev])
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
    setEditNombre(currentUser.nombre)
    setEditApellido(currentUser.apellido)
    setProfileSavedMsg(false)
    setProfileModalOpen(true)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    const updated: UserData = {
      ...currentUser,
      nombre: editNombre.trim() || currentUser.nombre,
      apellido: editApellido.trim() || currentUser.apellido,
    }
    updateCurrentUserData(updated)
    setProfileSavedMsg(true)
    setTimeout(() => setProfileModalOpen(false), 800)
  }

  const fullName = currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : 'Bruno Cusi'

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const handleConfirmSandboxPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sandboxModal || !currentUser || paying) return
    setCheckoutError('')

    let methodUsed = 'PayPal Sandbox'
    let last4ForApi = ''
    let cardToSave: SavedCard | null = null

    if (paymentMode === 'saved') {
      const card = savedCards.find((c) => c.id === selectedCardId) || savedCards[0]
      methodUsed = card ? `${card.brand} •••• ${card.last4}` : 'Visa •••• 4821'
      last4ForApi = card ? card.last4 : ''
    } else if (paymentMode === 'new') {
      const digits = newCardNumber.replace(/\D/g, '')
      if (digits.length < 15) {
        setCheckoutError('Ingresa un número de tarjeta válido de 16 dígitos.')
        return
      }
      if (newCardExpiry.length < 5 || newCardCvv.length < 3) {
        setCheckoutError('Completa la fecha de vencimiento (MM/AA) y el código CVV.')
        return
      }
      const brand: 'Visa' | 'Mastercard' = digits.startsWith('5') ? 'Mastercard' : 'Visa'
      const last4 = digits.slice(-4)
      methodUsed = `${brand} •••• ${last4}`
      last4ForApi = last4

      if (saveNewCardCheck) {
        cardToSave = {
          id: `card-${Date.now()}`,
          brand,
          last4,
          holder: newCardHolder.trim() || fullName.toUpperCase(),
          expiry: newCardExpiry,
        }
      }
    }

    // 🚀 Pago real contra el backend: guarda en Transaccion / Inscripcion / Suscripcion (MySQL en Aiven)
    setPaying(true)
    try {
      if (!getAuthToken()) {
        throw new Error('Tu sesión no está conectada al servidor. Cierra sesión e inicia con una cuenta real.')
      }
      if (sandboxModal.type === 'membership' && sandboxModal.plan) {
        const idPlan = PLAN_DB_ID[sandboxModal.plan.months]
        await apiSuscribirPlan(idPlan, last4ForApi)
      } else if (sandboxModal.type === 'course' && sandboxModal.courseId) {
        await apiComprarCurso(sandboxModal.courseId, last4ForApi)
      }
    } catch (err: any) {
      // Pago rechazado o error del servidor: no se desbloquea nada
      setCheckoutError(err?.message || 'No se pudo procesar el pago.')
      setPaying(false)
      return
    }
    setPaying(false)

    if (cardToSave) {
      setSavedCards((prev) => [...prev, cardToSave!])
      setSelectedCardId(cardToSave.id)
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
    setNewCardNumber('')
    setNewCardExpiry('')
    setNewCardCvv('')
  }

  const handleCancelMembership = () => {
    if (!currentUser) return
    updateCurrentUserData({
      ...currentUser,
      hasMembership: false,
    })
  }

  const studentHasAnyAccess =
    Boolean(currentUser?.hasMembership) ||
    Boolean(currentUser?.purchasedCourseIds && currentUser.purchasedCourseIds.length > 0) ||
    currentView === 'player'

  const currentPlayingCourse =
    courses.find((c) => c.id === activeCourseId) || courses[0]

  return (
    <div className={currentView === 'login' ? 'min-h-screen' : 'min-h-screen pb-20'}>
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
      {currentView === 'player' && (
        <PlayerView
          course={currentPlayingCourse}
          completedLessonIds={courseProgress[currentPlayingCourse.id] || []}
          onToggleLessonComplete={handleToggleLessonComplete}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
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
          onDeleteCourse={(id) => setCourses(courses.filter((c) => c.id !== id))}
        />
      )}
      {currentView === 'admin-editor' && (
        <CourseEditor
          initialCourse={editingCourse}
          onSaveCourse={handleSaveCourseFromEditor}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
        />
      )}
      {currentView === 'admin-finance' && (
        <TransactionsCenter
          transactions={transactions}
          registeredUsers={registeredUsers}
          onRefundTransaction={handleRefundTransaction}
          onRetryTransaction={handleRetryTransaction}
          onNavigate={(view) => (view === 'login' ? handleLogout() : setCurrentView(view))}
        />
      )}

      {/* Modal Selector de Planes por Meses */}
      {plansModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-7 shadow-2xl my-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 mb-1.5">
                  MEMBRESÍA LEARNHUB PRO
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Elige el plan de meses que mejor se adapte a tu estudio
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Todos los planes desbloquean acceso ilimitado a todos los cursos del catálogo, código fuente y seguimiento de progreso.
                </p>
              </div>
              <button
                onClick={() => setPlansModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {MEMBERSHIP_PLANS.map((plan) => {
                const isRecommended = plan.months === 6
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-6 flex flex-col justify-between border-2 transition relative ${
                      isRecommended
                        ? 'border-violet-600 bg-violet-50/40 shadow-lg'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-5 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-600 text-white shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <div className="text-sm font-extrabold text-slate-900 mb-1">{plan.name}</div>
                      <div className="text-xs text-slate-500 mb-4">
                        Duración: <strong>{plan.months} {plan.months === 1 ? 'mes' : 'meses'}</strong>
                      </div>

                      <div className="mb-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          ${plan.monthlyEquivalent}
                        </span>
                        <span className="text-xs text-slate-500"> USD / mes</span>
                      </div>
                      <div className="text-[11px] text-violet-700 font-semibold mb-5">
                        {plan.months === 1
                          ? 'Cobro mensual de $29 USD'
                          : `Pago único de $${plan.totalPrice} USD por ${plan.months} meses`}
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setPlansModalOpen(false)
                        setCheckoutError('')
                        setSandboxModal({
                          type: 'membership',
                          plan,
                          title: `${plan.name} — Acceso Ilimitado`,
                          price: plan.totalPrice,
                        })
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                        isRecommended
                          ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      Elegir {plan.months} {plan.months === 1 ? 'mes' : 'meses'} (${plan.totalPrice})
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pasarela Sandbox con Tarjeta 3D */}
      {sandboxModal && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 mb-1">
                  {sandboxModal.type === 'membership'
                    ? `SUSCRIPCIÓN POR ${sandboxModal.plan?.months} MES(ES)`
                    : 'COMPRA DE CURSO INDIVIDUAL'}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Pasarela de Pago Segura (Entorno Sandbox)
                </h3>
              </div>
              <button
                onClick={() => setSandboxModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setPaymentMode('saved')}
                className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition ${
                  paymentMode === 'saved'
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                💳 Tarjeta guardada ({savedCards.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('new')
                  setNewCardHolder(fullName.toUpperCase())
                }}
                className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition ${
                  paymentMode === 'new'
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                ➕ Nueva tarjeta
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('paypal')}
                className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition ${
                  paymentMode === 'paypal'
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                🅿️ PayPal Sandbox
              </button>
            </div>

            {checkoutError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleConfirmSandboxPayment}>
              {paymentMode === 'saved' && (
                <div className="space-y-3 mb-6">
                  <div className="text-xs font-semibold text-slate-700">
                    Selecciona una tarjeta de tu billetera:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedCards.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCardId(c.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                          selectedCardId === c.id
                            ? 'border-violet-600 bg-violet-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-extrabold text-slate-900">{c.brand}</span>
                          <span className="text-[11px] text-slate-400">Exp. {c.expiry}</span>
                        </div>
                        <div className="text-sm font-mono font-bold text-slate-800 mb-1">
                          •••• •••• •••• {c.last4}
                        </div>
                        <div className="text-[10px] text-slate-500">{c.holder}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paymentMode === 'new' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6 items-center">
                  <div className="md:col-span-5">
                    <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-violet-950 to-violet-700 text-white shadow-lg flex flex-col justify-between h-44">
                      <div className="flex justify-between items-center">
                        <div className="w-9 h-6 rounded bg-amber-300/80" />
                        <span className="text-xs font-extrabold tracking-widest">
                          {newCardNumber.startsWith('5') ? 'MASTERCARD' : 'VISA'}
                        </span>
                      </div>
                      <div className="text-sm font-mono tracking-widest my-2">
                        {newCardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between items-end text-[10px]">
                        <div>
                          <div className="text-[8px] text-violet-200 uppercase">Titular</div>
                          <div className="font-bold truncate max-w-[110px]">
                            {newCardHolder || fullName.toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="text-[8px] text-violet-200 uppercase">Vence</div>
                          <div className="font-bold">{newCardExpiry || 'MM/AA'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Número de tarjeta
                      </label>
                      <input
                        type="text"
                        placeholder="4532 8910 2345 6789"
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(formatCardNumber(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nombre del titular
                      </label>
                      <input
                        type="text"
                        value={newCardHolder}
                        onChange={(e) => setNewCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Expiración (MM/AA)
                        </label>
                        <input
                          type="text"
                          placeholder="10/29"
                          value={newCardExpiry}
                          onChange={(e) => setNewCardExpiry(formatExpiry(e.target.value))}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          value={newCardCvv}
                          onChange={(e) =>
                            setNewCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-600 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveNewCardCheck}
                        onChange={(e) => setSaveNewCardCheck(e.target.checked)}
                      />
                      Guardar esta tarjeta en mi cuenta para futuros pagos
                    </label>
                  </div>
                </div>
              )}

              {paymentMode === 'paypal' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center mb-6">
                  <div className="text-2xl mb-1">🅿️</div>
                  <div className="text-sm font-bold text-slate-900">
                    Cuenta de pruebas PayPal Sandbox conectada
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Se procesará la simulación de cargo con el correo <strong>{currentUser?.correo}</strong> sin usar dinero real.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-500">Concepto a procesar:</div>
                  <div className="text-sm font-extrabold text-slate-900">{sandboxModal.title}</div>
                  {sandboxModal.plan && (
                    <div className="text-[11px] text-emerald-600 font-semibold">
                      Vigencia garantizada hasta el {sandboxModal.plan.expiresLabel}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Total Sandbox</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    ${sandboxModal.price} USD
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={() => setSandboxModal(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  {paying ? 'Procesando pago...' : `Confirmar pago de $${sandboxModal.price} USD ›`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mi Perfil */}
      {profileModalOpen && currentUser && (
        <div className="fixed inset-0 bg-slate-900/55 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Mi Perfil en LearnHub</h3>
            <p className="text-xs text-slate-500 mb-4">
              Actualiza tus datos personales ({currentUser.correo})
            </p>

            {profileSavedMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                ✓ Datos actualizados correctamente
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  value={editApellido}
                  onChange={(e) => setEditApellido(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barra Flotante Inferior según el Rol */}
      {currentView !== 'login' && currentUser && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#11131a] border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-2 z-40 shadow-2xl">
          {currentUser.role === 'student' && (
            <>
              <span className="text-[9px] font-bold text-slate-400 mr-1">ESTUDIANTE</span>
              <button
                onClick={() => setCurrentView('catalog')}
                className={`px-3 py-1 rounded-md text-xs cursor-pointer transition ${
                  currentView === 'catalog'
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Catálogo
              </button>

              {studentHasAnyAccess && (
                <button
                  onClick={() => setCurrentView('player')}
                  className={`px-3 py-1 rounded-md text-xs cursor-pointer transition flex items-center gap-1.5 ${
                    currentView === 'player'
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>▶</span>
                  <span className="max-w-[130px] truncate">
                    {currentPlayingCourse.title}
                  </span>
                </button>
              )}

              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-1 rounded-md text-xs cursor-pointer transition ${
                  currentView === 'dashboard'
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Mi aprendizaje
              </button>
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              <span className="text-[9px] font-bold text-slate-400 mr-1">ADMIN</span>
              <button
                onClick={() => setCurrentView('admin-overview')}
                className={`px-3 py-1 rounded-md text-xs cursor-pointer transition ${
                  currentView === 'admin-overview'
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setCurrentView('admin-catalog')}
                className={`px-3 py-1 rounded-md text-xs cursor-pointer transition ${
                  currentView === 'admin-catalog'
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Cursos
              </button>
              <button
                onClick={handleStartCreateCourse}
                className={`px-3 py-1 rounded-md text-xs cursor-pointer transition ${
                  currentView === 'admin-editor'
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setCurrentView('admin-finance')}
                className={`px-3 py-1 rounded-md text-xs cursor-pointer transition ${
                  currentView === 'admin-finance'
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Finanzas
              </button>
            </>
          )}

          <div className="h-4 w-[1px] bg-slate-700 mx-1" />
          <button
            onClick={handleLogout}
            className="px-2.5 py-1 rounded-md text-xs text-rose-400 hover:bg-rose-500/10 font-medium cursor-pointer"
          >
            Salir
          </button>
        </div>
      )}

      {/* Puntos 01 y 02: Modal Legal y Privacidad (Ley N.° 29733 de Perú) */}
      <LegalModal isOpen={legalModalOpen} onClose={() => setLegalModalOpen(false)} />

      {/* Punto 03: Banner flotante de consentimiento de cookies */}
      <CookieBanner onOpenLegal={() => setLegalModalOpen(true)} />

      {/* Punto 18: Botón flotante de WhatsApp para soporte */}
      <WhatsAppButton />

      {/* Punto 15: Vista 404 personalizada si la ruta no existe */}
      {!['login', 'catalog', 'dashboard', 'player', 'admin-overview', 'admin-catalog', 'admin-editor', 'admin-finance'].includes(currentView) && (
        <NotFoundView onGoHome={() => setCurrentView('catalog')} />
      )}
    </div>
  )
}