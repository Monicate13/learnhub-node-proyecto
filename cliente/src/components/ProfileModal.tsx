import { useState, useEffect } from 'react'
import { apiActualizarPerfil, apiCambiarPassword } from '../services/api'
import { type UserData } from '../views/LoginView'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserData | null
  onProfileUpdated: (updatedUser: UserData) => void
  onPasswordChanged: () => void
}

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onPasswordChanged,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')

  // Estado del formulario de Información Personal
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoSuccess, setInfoSuccess] = useState('')
  const [infoError, setInfoError] = useState('')

  // Estado del formulario de Seguridad / Contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityLoading, setSecurityLoading] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState('')
  const [securityError, setSecurityError] = useState('')

  useEffect(() => {
    if (currentUser) {
      setNombre(currentUser.nombre || '')
      setApellido(currentUser.apellido || '')
      setInfoSuccess('')
      setInfoError('')
      setSecuritySuccess('')
      setSecurityError('')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [currentUser, isOpen])

  if (!isOpen || !currentUser) return null

  // Guardar cambios en nombre y apellido
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfoLoading(true)
    setInfoSuccess('')
    setInfoError('')

    const cleanNombre = nombre.trim()
    const cleanApellido = apellido.trim()

    if (cleanNombre.length < 2 || cleanApellido.length < 2) {
      setInfoError('El nombre y apellido deben tener al menos 2 caracteres')
      setInfoLoading(false)
      return
    }

    try {
      // Intento en backend (MySQL)
      const res = await apiActualizarPerfil(cleanNombre, cleanApellido)
      const updatedUser: UserData = {
        ...currentUser,
        nombre: res.usuario?.nombre || cleanNombre,
        apellido: res.usuario?.apellido || cleanApellido,
      }
      onProfileUpdated(updatedUser)
      setInfoSuccess('¡Perfil actualizado con éxito en la base de datos!')
      setTimeout(() => {
        setInfoSuccess('')
      }, 2500)
    } catch (err: any) {
      // Fallback local en caso de que el backend no responda
      const updatedUser: UserData = {
        ...currentUser,
        nombre: cleanNombre,
        apellido: cleanApellido,
      }
      onProfileUpdated(updatedUser)
      setInfoError(err.message || 'Error al conectar con la base de datos')
    } finally {
      setInfoLoading(false)
    }
  }

  // Cambio seguro de contraseña
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityLoading(true)
    setSecuritySuccess('')
    setSecurityError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError('Por favor complete todos los campos de contraseña')
      setSecurityLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setSecurityError('La nueva contraseña debe tener al menos 6 caracteres')
      setSecurityLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('La nueva contraseña y su confirmación no coinciden')
      setSecurityLoading(false)
      return
    }

    try {
      await apiCambiarPassword(currentPassword, newPassword)
      setSecuritySuccess('¡Contraseña actualizada exitosamente! Cerrando sesión...')
      setTimeout(() => {
        onPasswordChanged()
      }, 1500)
    } catch (err: any) {
      setSecurityError(err.message || 'No se pudo actualizar la contraseña')
      setSecurityLoading(false)
    }
  }

  const initials = `${currentUser.nombre?.[0] || 'U'}${currentUser.apellido?.[0] || ''}`.toUpperCase()

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabecera del Modal */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-violet-200">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Mi Perfil de Usuario</h3>
              <p className="text-xs text-slate-500">{currentUser.correo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-sm"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Selector de Pestañas (Tabs) */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>👤</span>
            <span>Datos Personales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🔒</span>
            <span>Seguridad & Contraseña</span>
          </button>
        </div>

        {/* Contenido de Pestañas */}
        <div className="p-6">
          {activeTab === 'info' ? (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              {infoSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <span>✓</span>
                  <span>{infoSuccess}</span>
                </div>
              )}
              {infoError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{infoError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600 transition"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600 transition"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Correo Electrónico</label>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">
                    No editable
                  </span>
                </div>
                <input
                  type="email"
                  disabled
                  value={currentUser.correo}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rol en LearnHub</label>
                <div className="px-3.5 py-2 text-xs bg-violet-50 text-violet-700 font-semibold rounded-lg inline-flex items-center gap-1.5 border border-violet-100">
                  <span>{currentUser.role === 'admin' ? '🛡️ Administrador' : '🎓 Estudiante'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={infoLoading}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-violet-200 transition"
                >
                  {infoLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSavePassword} className="space-y-4">
              {securitySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <span>✓</span>
                  <span>{securitySuccess}</span>
                </div>
              )}
              {securityError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{securityError}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                <p className="font-semibold mb-0.5">Nota de seguridad:</p>
                <p className="text-[11px] text-amber-700">
                  Por tu seguridad, al cambiar la contraseña se cerrará la sesión actual automáticamente y deberás iniciar sesión con tu nueva clave.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600 transition"
                  placeholder="Tu contraseña actual"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600 transition"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600 transition"
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-rose-200 transition"
                >
                  {securityLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

