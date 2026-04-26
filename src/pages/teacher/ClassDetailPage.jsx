import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Save,
  X,
  Users,
  Search
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import "./ClassDetailPage.css";

export default function ClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const classes = currentUser?.classes || [];

  const selectedClass = classes.find(
    (c) => Number(c.id) === Number(classId)
  );

  /* ================= SAFE DEFAULTS ================= */

  const initialStudents = selectedClass?.students || [];
  const initialName = selectedClass?.name || "";

  /* ================= STATES ================= */

  const [students, setStudents] = useState(initialStudents);
  const [newStudent, setNewStudent] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(initialName);

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editedStudentName, setEditedStudentName] = useState("");

  const [showClassDeleteModal, setShowClassDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  /* ================= EARLY RETURN (HOOK SAFE) ================= */

  if (!selectedClass) {
    return <h2 style={{ padding: 40 }}>Sinf topilmadi</h2>;
  }

  /* ================= STORAGE HELPER ================= */

  const updateStorage = (updatedStudents, updatedClassName = editedName) => {
    const updatedClasses = classes.map((c) =>
      c.id === selectedClass.id
        ? { ...c, name: updatedClassName, students: updatedStudents }
        : c
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...currentUser, classes: updatedClasses })
    );
  };

  /* ================= CLASS UPDATE ================= */

  const handleUpdateClass = () => {
    if (!editedName.trim()) return;
    updateStorage(students, editedName);
    setEditMode(false);
  };

  const confirmDeleteClass = () => {
    const updatedClasses = classes.filter(
      (c) => c.id !== selectedClass.id
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...currentUser, classes: updatedClasses })
    );

    navigate("/teacher/classes");
  };

  /* ================= STUDENT CRUD ================= */

  const handleAddStudent = () => {
    if (!newStudent.trim()) return;

    const updated = [
      ...students,
      { id: Date.now(), name: newStudent }
    ];

    updateStorage(updated);
    setStudents(updated);
    setNewStudent("");
  };

  const handleStartEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditedStudentName(student.name);
  };

  const handleSaveStudent = () => {
    const updated = students.map((s) =>
      s.id === editingStudentId
        ? { ...s, name: editedStudentName }
        : s
    );

    updateStorage(updated);
    setStudents(updated);
    setEditingStudentId(null);
  };

  const confirmDeleteStudent = () => {
    const updated = students.filter(
      (s) => s.id !== studentToDelete
    );

    updateStorage(updated);
    setStudents(updated);
    setStudentToDelete(null);
  };

  /* ================= SEARCH + SORT ================= */

  const filteredStudents = useMemo(() => {
    let data = students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );

    data.sort((a, b) =>
      sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return data;
  }, [students, search, sortAsc]);

  /* ================= UI ================= */

  return (
    <div className="class-detail-container">

      <div className="class-header-card">
        {editMode ? (
          <div className="edit-section">
            <input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
            <button onClick={handleUpdateClass} className="action-btn save-btn">
              <Save size={16}/> Saqlash
            </button>
            <button onClick={() => setEditMode(false)} className="action-btn cancel-btn">
              <X size={16}/> Bekor
            </button>
          </div>
        ) : (
          <>
            <h1>{editedName}</h1>

            <div className="class-stats">
              <Users size={16}/>
              <span>{students.length} ta o‘quvchi</span>
            </div>

            <div className="class-actions">
              <button className="action-btn edit-btn" onClick={() => setEditMode(true)}>
                <Pencil size={16}/> Tahrirlash
              </button>

              <button className="action-btn delete-class-btn" onClick={() => setShowClassDeleteModal(true)}>
                <Trash2 size={16}/> O‘chirish
              </button>
            </div>
          </>
        )}
      </div>

      <div className="student-section-card">

        <div className="student-controls">

          <div className="student-add-section">
            <input
              placeholder="O‘quvchi ismi..."
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
            />
            <button onClick={handleAddStudent}>
              Qo‘shish
            </button>
          </div>

          <div className="student-search">
            <Search size={16}/>
            <input
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={() => setSortAsc(!sortAsc)}>
              {sortAsc ? "A-Z" : "Z-A"}
            </button>
          </div>

        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            Hozircha o‘quvchilar yo‘q
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    {editingStudentId === student.id ? (
                      <input
                        value={editedStudentName}
                        onChange={(e) =>
                          setEditedStudentName(e.target.value)
                        }
                      />
                    ) : (
                      student.name
                    )}
                  </td>

                  <td className="table-actions">
                    {editingStudentId === student.id ? (
                      <>
                        <button onClick={handleSaveStudent} className="icon-btn icon-edit">
                          <Save size={16}/>
                        </button>
                        <button onClick={() => setEditingStudentId(null)} className="icon-btn">
                          <X size={16}/>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEditStudent(student)} className="icon-btn icon-edit">
                          <Pencil size={16}/>
                        </button>
                        <button onClick={() => setStudentToDelete(student.id)} className="icon-btn icon-delete">
                          <Trash2 size={16}/>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={showClassDeleteModal}
        title="Sinfni o‘chirish"
        message="Rostdan ham ushbu sinfni o‘chirmoqchimisiz?"
        onCancel={() => setShowClassDeleteModal(false)}
        onConfirm={confirmDeleteClass}
      />

      <ConfirmModal
        isOpen={studentToDelete !== null}
        title="O‘quvchini o‘chirish"
        message="Rostdan ham o‘quvchini o‘chirmoqchimisiz?"
        onCancel={() => setStudentToDelete(null)}
        onConfirm={confirmDeleteStudent}
      />
    </div>
  );
}