import { useState, useEffect } from 'react'
import AdminNav from '../../components/AdminNav'
import {
  apiObtenerUsuariosAdmin,
  apiActualizarRolUsuario,
  apiActualizarMembresiaUsuario,
} from '../../services/api'

interface UserManagementProps {
  onNavigate: (view: string) => void
}

interface AdminUser {
  id_usuario: number
  nombre: string
  apellido: string
  correo: string
  estado: string
  id_rol: number
  rol: string
  tieneMembresia: boolean
  fecha_vencimiento?: string | null
}

export default function UserManagement({ onNavigate }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchUsers = async (search?: string) => {
    setLoading(true)
    try {
      const data = await apiObtenerUsuariosAdmin(search)
      if (data && data.usuarios) {
        setUsers(data.usuarios)
      }
    } catch (err: any) {
      console.warn('Aviso al cargar usuarios de MySQL:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchTerm.trim())
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    fetchUsers('')
  }

  const handleChangeRole = async (userId: number, newRolId: number) => {
    setUpdatingId(userId)
    setStatusMessage(null)
    try {
      const res = await apiActualizarRolUsuario(userId, newRolId)
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === userId
            ? { ...u, id_rol: newRolId, rol: res.rol || (newRolId === 3 ? 'Docente' : newRolId === 2 ? 'Administrador' : 'Estudiante') }
            : u
        )
      )
      setStatusMessage({ text: res.mensaje || 'Rol actualizado con éxito en MySQL', type: 'success' })
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error al actualizar rol', type: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleMembership = async (userId: number, currentHasMembership: boolean) => {
    setUpdatingId(userId)
    setStatusMessage(null)
    const nextState = !currentHasMembership
    try {
      const res = await apiActualizarMembresiaUsuario(userId, nextState)
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === userId
            ? {
                ...u,
                tieneMembresia: nextState,
                fecha_vencimiento: res.fecha_vencimiento || (nextState ? 'En 6 meses' : null),
              }
            : u
        )
      )
      setStatusMessage({ text: res.mensaje || 'Membresía actualizada con éxito en MySQL', type: 'success' })
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error al cambiar membresía', type: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  const studentCount = users.filter((u) => u.id_rol === 1 || u.rol === 'Estudiante').length
  const teacherCount = users.filter((u) => u.id_rol === 3 || u.rol === 'Docente').length
  const adminCount = users.filter((u) => u.id_rol === 2 || u.rol === 'Administrador').length
  const vipCount = users.filter((u) => u.tieneMembresia).length

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav activeSection="users" onNavigate={onNavigate} />

      <main className="flex-1 p-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PANEL DE CONTROL DE USUARIOS
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Buscar y Gestionar Usuarios</h1>
            <p className="text-xs text-slate-500 mt-1">
              Consulta usuarios por correo, actualiza sus roles (Estudiante, Docente, Administrador) y administra membresías VIP.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MySQL Sincronizado
            </span>
          </div>
        </div>

        {/* Notificación de estado */}
        {statusMessage && (
          <div
            className={`p-3.5 mb-5 rounded-xl text-xs font-semibold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-3 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Barra de Búsqueda por Correo */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuario por correo electrónico (ej. alumno@learnhub.com)"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition"
              >
                Buscar Usuario
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3.5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer transition"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>

          {/* Tarjetas de Resumen Rápido */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 bg-violet-50 rounded-xl">
              <div className="text-[10px] font-bold text-violet-600 uppercase">Estudiantes</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">{studentCount}</div>
            </div>
            <div className="p-2.5 bg-violet-50 rounded-xl">
              <div className="text-[10px] font-bold text-violet-600 uppercase">Docentes</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">{teacherCount}</div>
            </div>
            <div className="p-2.5 bg-violet-50 rounded-xl">
              <div className="text-[10px] font-bold text-violet-600 uppercase">Administradores</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">{adminCount}</div>
            </div>
            <div className="p-2.5 bg-violet-50 rounded-xl">
              <div className="text-[10px] font-bold text-violet-600 uppercase">Membresía VIP</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">{vipCount}</div>
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios Registrados */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Usuarios Encontrados ({users.length})
            </h2>
            <button
              onClick={() => fetchUsers(searchTerm)}
              className="text-xs text-violet-600 hover:underline font-semibold cursor-pointer"
            >
              Recargar datos
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Cargando usuarios desde la base de datos MySQL...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No se encontraron usuarios con el correo o criterio ingresado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Correo Electrónico</th>
                    <th className="py-3 px-4">Rol Asignado</th>
                    <th className="py-3 px-4">Membresía VIP</th>
                    <th className="py-3 px-4 text-right">Acciones Directas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isBusy = updatingId === u.id_usuario
                    const initials = `${(u.nombre || 'U')[0]}${(u.apellido || '')[0] || ''}`.toUpperCase()

                    return (
                      <tr key={u.id_usuario} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {u.nombre} {u.apellido}
                              </div>
                              <span className="text-[10px] text-slate-400">ID #{u.id_usuario}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700 text-xs">
                          {u.correo}
                        </td>

                        {/* Selector de Rol interactivo */}
                        <td className="py-3 px-4">
                          <select
                            disabled={isBusy}
                            value={u.id_rol}
                            onChange={(e) => handleChangeRole(u.id_usuario, Number(e.target.value))}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer ${
                              u.id_rol === 3
                                ? 'bg-violet-50 text-violet-800 border-violet-200'
                                : u.id_rol === 2
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value={1}>👨‍🎓 Estudiante</option>
                            <option value={3}>👨‍🏫 Docente</option>
                            <option value={2}>🛡️ Administrador</option>
                          </select>
                        </td>

                        {/* Estado de Membresía VIP */}
                        <td className="py-3 px-4">
                          {u.tieneMembresia ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                               VIP Activa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Sin Membresía
                            </span>
                          )}
                        </td>

                        {/* Botón para dar o revocar membresía */}
                        <td className="py-3 px-4 text-right">
                          <button
                            disabled={isBusy}
                            onClick={() => handleToggleMembership(u.id_usuario, u.tieneMembresia)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition disabled:opacity-50 ${
                              u.tieneMembresia
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isBusy
                              ? 'Guardando...'
                              : u.tieneMembresia
                              ? '✕ Revocar VIP'
                              : ' Dar Membresía VIP'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
