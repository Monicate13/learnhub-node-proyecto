import { useState } from 'react'
import { apiLogin, apiRegistro, apiObtenerMiAprendizaje } from '../services/api'

export interface UserData {
  id: number
  nombre: string
  apellido: string
  correo: string
  role: 'student' | 'admin'
  password?: string
  hasMembership?: boolean
  purchasedCourseIds?: number[]
}

interface LoginViewProps {
  onLogin: (user: UserData) => void
  registeredUsers: UserData[]
  onRegisterUser: (newUser: UserData) => void
}

export default function LoginView({
  onLogin,
  registeredUsers,
  onRegisterUser,
}: LoginViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login')
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student')

  const [email, setEmail] = useState('estudiante@utp.edu.pe')
  const [password, setPassword] = useState('12345678')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const handleRoleSwitch = (role: 'student' | 'admin') => {
    setSelectedRole(role)
    setErrorMsg('')
    setEmail(role === 'admin' ? 'admin@learnhub.pe' : 'estudiante@utp.edu.pe')
  }

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-slate-200', width: '0%' }
    if (pass.length < 6) return { label: 'Débil (mín. 6 caracteres)', color: 'bg-rose-500', width: '33%' }
    if (pass.length < 10 || !/\d/.test(pass)) return { label: 'Media (agrega números)', color: 'bg-amber-500', width: '66%' }
    return { label: 'Fuerte y segura', color: 'bg-emerald-500', width: '100%' }
  }

  const strength = getPasswordStrength(regPassword)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErrorMsg('')
    setLoading(true)

    try {
      // 1. Autenticación contra el backend real de Node.js (JWT)
      const res = await apiLogin(email, password)
      if (res.token) {
        localStorage.setItem('learnhub_jwt', res.token)
      }

      const backendUser: UserData = {
        id: res.usuario?.id_usuario || Date.now(),
        nombre: res.usuario?.nombre || 'Usuario',
        apellido: res.usuario?.apellido || '',
        correo: res.usuario?.correo || email,
        role: res.usuario?.rol === 'Administrador' ? 'admin' : 'student',
        hasMembership: res.usuario?.rol === 'Administrador',
        purchasedCourseIds: [],
      }

      // Recargar compras y membresía guardadas en MySQL para que no se pierdan al volver a entrar
      try {
        const aprendizaje = await apiObtenerMiAprendizaje(res.token)
        backendUser.purchasedCourseIds = (aprendizaje.cursos_en_progreso || []).map(
          (c: { id_curso: number }) => c.id_curso
        )
        if (aprendizaje.membresia?.activo) {
          backendUser.hasMembership = true
        }
      } catch {
        // Si falla, el usuario igual entra; solo no se precargan sus compras
      }

      onLogin(backendUser)
    } catch (err: any) {
      // Si el backend rechazó la contraseña o el correo
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        setErrorMsg(err.message)
        return
      }

      // Modo Respaldo local si el backend estuviera apagado
      const found = registeredUsers.find(
        (u) => u.correo.toLowerCase() === email.toLowerCase()
      )

      if (found) {
        if (found.password && found.password !== password) {
          setErrorMsg('La contraseña ingresada es incorrecta.')
          return
        }
        onLogin(found)
      } else {
        const fallbackRole = email.toLowerCase().includes('admin') ? 'admin' : selectedRole
        onLogin({
          id: Date.now(),
          nombre: fallbackRole === 'admin' ? 'Roberto' : 'Estudiante',
          apellido: fallbackRole === 'admin' ? 'Cruz' : 'Nuevo',
          correo: email,
          role: fallbackRole,
          hasMembership: false,
          purchasedCourseIds: [],
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      setErrorMsg('Por favor ingresa tu nombre y apellido válidos.')
      return
    }
    if (regPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (regPassword !== regConfirm) {
      setErrorMsg('Las contraseñas no coinciden.')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      // 1. Registro real en el backend con hash BCrypt
      const res = await apiRegistro(nombre.trim(), apellido.trim(), regEmail.trim(), regPassword)
      if (res.token) {
        localStorage.setItem('learnhub_jwt', res.token)
      }

      const newUser: UserData = {
        id: res.usuario?.id_usuario || Date.now(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: regEmail.trim(),
        role: 'student',
        password: regPassword,
        hasMembership: false,
        purchasedCourseIds: [],
      }

      onRegisterUser(newUser)
      onLogin(newUser)
    } catch (err: any) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        setErrorMsg(err.message)
        return
      }

      // Modo Respaldo local
      const exists = registeredUsers.some(
        (u) => u.correo.toLowerCase() === regEmail.toLowerCase()
      )
      if (exists) {
        setErrorMsg('Este correo electrónico ya está registrado en LearnHub.')
        return
      }

      const newUser: UserData = {
        id: Date.now(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: regEmail.trim(),
        role: 'student',
        password: regPassword,
        hasMembership: false,
        purchasedCourseIds: [],
      }

      onRegisterUser(newUser)
      onLogin(newUser)
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg(`Hemos enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada.`)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-5 bg-[#0a0a0f] text-white p-12 flex flex-col justify-between">
        <div className="flex items-center gap-2.5 font-extrabold text-sm tracking-wide">
          <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs">
            ✓
          </span>
          <span>LEARNHUB</span>
        </div>

        <div className="my-12">
          <h1 className="text-3xl font-extrabold leading-tight mb-4">
            Aprende las tecnologías más demandadas por la industria.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Compra cursos individuales a tu medida o suscríbete a la Membresía Pro para desbloquear acceso ilimitado a todo el catálogo.
          </p>

          <div className="flex gap-10 border-t border-slate-800 pt-6 mt-8">
            <div>
              <div className="text-xl font-extrabold">120+</div>
              <div className="text-[10px] text-slate-500 tracking-wider mt-1">CURSOS</div>
            </div>
            <div>
              <div className="text-xl font-extrabold">48K</div>
              <div className="text-[10px] text-slate-500 tracking-wider mt-1">ESTUDIANTES</div>
            </div>
            <div>
              <div className="text-xl font-extrabold">4.9 ★</div>
              <div className="text-[10px] text-slate-500 tracking-wider mt-1">VALORACIÓN</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="text-amber-400 text-xs mb-2">★★★★★</div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            "Conseguí mi primer trabajo como desarrollador 4 meses después de comenzar. El nivel de los cursos y el seguimiento de progreso es increíble."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-600 text-[11px] font-bold flex items-center justify-center">
              HS
            </div>
            <div>
              <div className="text-[11px] font-bold">HÉCTOR SOTO</div>
              <div className="text-[10px] text-slate-400">Frontend Developer · UTP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {authMode === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Bienvenido de nuevo</h2>
              <p className="text-xs text-slate-500 mb-5">
                Inicia sesión en LearnHub para continuar tu aprendizaje.
              </p>

              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('student')}
                  className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    selectedRole === 'student'
                      ? 'bg-white text-violet-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🎓 Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-white text-violet-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🛡️ Administrador
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                    <input type="checkbox" defaultChecked /> Recordarme
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('')
                      setSuccessMsg('')
                      setAuthMode('recover')
                    }}
                    className="text-violet-600 font-semibold hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  {loading ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 mt-6">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('')
                    setAuthMode('register')
                  }}
                  className="text-violet-600 font-semibold hover:underline cursor-pointer"
                >
                  Regístrate gratis
                </button>
              </p>
            </>
          )}

          {authMode === 'register' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Crea tu cuenta</h2>
              <p className="text-xs text-slate-500 mb-5">
                Explora el catálogo y elige entre comprar cursos individuales o activar tu Membresía Pro.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Héctor"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Ej. Soto"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="usuario@utp.edu.pe"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                  {regPassword && (
                    <div className="mt-1.5">
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Seguridad: {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg transition cursor-pointer mt-2"
                >
                  {loading ? 'Registrando...' : 'Registrarme ahora'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 mt-5">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('')
                    setAuthMode('login')
                  }}
                  className="text-violet-600 font-semibold hover:underline cursor-pointer"
                >
                  Inicia sesión
                </button>
              </p>
            </>
          )}

          {authMode === 'recover' && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Recuperar acceso</h2>
              <p className="text-xs text-slate-500 mb-5">
                Ingresa tu correo y te enviaremos las instrucciones para restablecer tu contraseña.
              </p>

              {successMsg ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs leading-relaxed mb-5">
                  ✅ {successMsg}
                </div>
              ) : (
                <form onSubmit={handleRecoverSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Correo electrónico asociado
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                  >
                    Enviar enlace de recuperación
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setSuccessMsg('')
                  setAuthMode('login')
                }}
                className="w-full mt-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ‹ Volver al inicio de sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}