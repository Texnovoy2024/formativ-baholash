import { useState, useEffect } from 'react'
import { Pencil, Trash2, Save, X, Plus, Users, BookOpen } from 'lucide-react'
import { FiTrash2 } from 'react-icons/fi'
import {
  getAdminClassesFn,
  addAdminClassFn,
  updateAdminClassFn,
  deleteClassCascadeFn,
  getAllClassesFn,
} from '../../context/authUtils'
import './AdminClassesPage.css'

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [newClassName, setNewClassName] = useState('')
  const [addError, setAddError] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editedName, setEditedName] = useState('')

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name }
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteStep, setDeleteStep] = useState('confirm') // 'confirm' | 'progress' | 'done'

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    setLoading(true)
    const data = await getAdminClassesFn()
    setClasses(data)
    setLoading(false)
  }

  /* ── QO'SHISH ─────────────────────────────────────────── */
  const handleAdd = async () => {
    setAddError('')
    const name = newClassName.trim()
    if (!name) { setAddError("Sinf nomi bo'sh bo'lmasin"); return }
    if (classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setAddError('Bu nom allaqachon mavjud')
      return
    }
    setIsAdding(true)
    const newClass = { id: Date.now().toString(), name, teacherName: 'Admin' }
    const res = await addAdminClassFn(newClass)
    if (res.success) {
      setClasses(prev => [...prev, newClass])
      setNewClassName('')
    } else {
      setAddError(res.message || 'Xatolik yuz berdi')
    }
    setIsAdding(false)
  }

  /* ── TAHRIRLASH ───────────────────────────────────────── */
  const startEdit = (cls) => {
    setEditingId(cls.id)
    setEditedName(cls.name)
  }

  const saveEdit = async () => {
    const name = editedName.trim()
    if (!name) return
    const res = await updateAdminClassFn(editingId, name)
    if (res.success) {
      setClasses(prev => prev.map(c => c.id === editingId ? { ...c, name } : c))
    }
    setEditingId(null)
  }

  /* ── O'CHIRISH ────────────────────────────────────────── */
  const openDeleteModal = (cls) => {
    setDeleteTarget(cls)
    setDeleteStep('confirm')
    setDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteStep('progress')
    setIsDeleting(true)
    const res = await deleteClassCascadeFn(deleteTarget.id)
    setIsDeleting(false)
    if (res.success) {
      setClasses(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteStep('done')
    } else {
      setDeleteModal(false)
      alert('Xatolik: ' + res.message)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal(false)
    setDeleteTarget(null)
    setDeleteStep('confirm')
  }

  /* ── UI ───────────────────────────────────────────────── */
  return (
    <div className="acl-page">
      <h1 className="acl-title">
        <BookOpen size={24} />
        Sinflar boshqaruvi
      </h1>

      {/* QO'SHISH FORMASI */}
      <div className="acl-card">
        <h2 className="acl-card-title">
          <Plus size={18} />
          Yangi sinf qo'shish
        </h2>
        <div className="acl-add-row">
          <input
            className="acl-input"
            placeholder="Sinf nomi (masalan: 11-A yoki 682-22)"
            value={newClassName}
            onChange={e => { setNewClassName(e.target.value); setAddError('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            className="acl-btn-primary"
            onClick={handleAdd}
            disabled={isAdding}
          >
            {isAdding ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
          </button>
        </div>
        {addError && <p className="acl-error">{addError}</p>}
      </div>

      {/* SINFLAR RO'YXATI */}
      <div className="acl-card">
        <h2 className="acl-card-title">
          <Users size={18} />
          Mavjud sinflar ({classes.length})
        </h2>

        {loading ? (
          <div className="acl-skeleton-list">
            {[1, 2, 3].map(i => <div key={i} className="acl-skeleton-row" />)}
          </div>
        ) : classes.length === 0 ? (
          <p className="acl-empty">Hozircha sinflar mavjud emas</p>
        ) : (
          <ul className="acl-list">
            {classes.map((cls, i) => (
              <li key={cls.id} className="acl-list-item">
                <div className="acl-item-left">
                  <span className="acl-index">{i + 1}</span>
                  {editingId === cls.id ? (
                    <input
                      className="acl-input acl-edit-input"
                      value={editedName}
                      autoFocus
                      onChange={e => setEditedName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                  ) : (
                    <span className="acl-class-name">{cls.name}</span>
                  )}
                </div>

                <div className="acl-item-actions">
                  {editingId === cls.id ? (
                    <>
                      <button className="acl-action-btn save" onClick={saveEdit} title="Saqlash">
                        <Save size={16} />
                      </button>
                      <button className="acl-action-btn cancel" onClick={() => setEditingId(null)} title="Bekor">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="acl-action-btn edit" onClick={() => startEdit(cls)} title="Tahrirlash">
                        <Pencil size={16} />
                      </button>
                      <button className="acl-action-btn delete" onClick={() => openDeleteModal(cls)} title="O'chirish">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="acl-modal-overlay" onClick={deleteStep !== 'progress' ? closeDeleteModal : undefined}>
          <div className="acl-modal" onClick={e => e.stopPropagation()}>

            {/* CONFIRM STEP */}
            {deleteStep === 'confirm' && (
              <>
                <div className="acl-modal-icon danger">
                  <FiTrash2 size={26} />
                </div>
                <h3>Sinfni o'chirish</h3>
                <p className="acl-modal-name">"{deleteTarget?.name}"</p>
                <p className="acl-modal-warning">
                  Bu amal quyidagi <strong>barcha ma'lumotlarni</strong> o'chirib yuboradi:
                </p>
                <ul className="acl-modal-list">
                  <li>📚 Ushbu sinf o'quvchilari</li>
                  <li>📝 Sinf uchun yaratilgan testlar</li>
                  <li>📁 Sinf uchun yaratilgan loyihalar</li>
                  <li>📊 Barcha natijalar va topshirishlar</li>
                </ul>
                <p className="acl-modal-irreversible">Bu amalni qaytarib bo'lmaydi!</p>
                <div className="acl-modal-actions">
                  <button className="acl-modal-cancel" onClick={closeDeleteModal}>
                    Bekor qilish
                  </button>
                  <button className="acl-modal-confirm" onClick={confirmDelete}>
                    Ha, o'chirish
                  </button>
                </div>
              </>
            )}

            {/* PROGRESS STEP */}
            {deleteStep === 'progress' && (
              <>
                <div className="acl-modal-spinner" />
                <h3>O'chirilmoqda...</h3>
                <p>Sinf va bog'liq ma'lumotlar o'chirilmoqda, iltimos kuting.</p>
              </>
            )}

            {/* DONE STEP */}
            {deleteStep === 'done' && (
              <>
                <div className="acl-modal-icon success">
                  ✓
                </div>
                <h3>Muvaffaqiyatli o'chirildi</h3>
                <p>"{deleteTarget?.name}" sinfi va unga bog'liq barcha ma'lumotlar o'chirildi.</p>
                <div className="acl-modal-actions">
                  <button className="acl-btn-primary" onClick={closeDeleteModal}>
                    Yopish
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
