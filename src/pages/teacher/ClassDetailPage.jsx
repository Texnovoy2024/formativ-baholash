import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  Pencil, Trash2, Save, X, Users, Search
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import "./ClassDetailPage.css";
import { getTeacherClassesFn, saveTeacherClassesFn } from "../../context/authUtils";

export default function ClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editedStudentName, setEditedStudentName] = useState("");

  const [showClassDeleteModal, setShowClassDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    const load = async () => {
      const list = await getTeacherClassesFn(currentUser?.id);
      setClasses(list);
      const found = list.find(c => String(c.id) === String(classId));
      setSelectedClass(found || null);
      if (found) {
        setStudents(found.students || []);
        setEditedName(found.name || "");
      }
      setLoading(false);
    };
    load();
  }, [classId]);

  if (loading) return <div style={{ padding: 40 }}><p>Yuklanmoqda...</p></div>;
  if (!selectedClass) return <h2 style={{ padding: 40 }}>Sinf topilmadi</h2>;

  const updateStorage = async (updatedStudents, updatedClassName = editedName) => {
    const updatedClasses = classes.map(c =>
      String(c.id) === String(selectedClass.id)
        ? { ...c, name: updatedClassName, students: updatedStudents }
        : c
    );
    setClasses(updatedClasses);
    await saveTeacherClassesFn(currentUser?.id, updatedClasses);
  };

  const handleUpdateClass = async () => {
    if (!editedName.trim()) return;
    await updateStorage(students, editedName);
    setEditMode(false);
  };

  const confirmDeleteClass = async () => {
    const updatedClasses = classes.filter(c => String(c.id) !== String(selectedClass.id));
    setClasses(updatedClasses);
    await saveTeacherClassesFn(currentUser?.id, updatedClasses);
    navigate("/teacher/classes");
  };

  const handleAddStudent = async () => {
    if (!newStudent.trim()) return;
    const updated = [...students, { id: Date.now().toString(), name: newStudent }];
    setStudents(updated);
    await updateStorage(updated);
    setNewStudent("");
  };

  const handleStartEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditedStudentName(student.name);
  };

  const handleSaveStudent = async () => {
    const updated = students.map(s =>
      s.id === editingStudentId ? { ...s, name: editedStudentName } : s
    );
    setStudents(updated);
    await updateStorage(updated);
    setEditingStudentId(null);
  };

  const confirmDeleteStudent = async () => {
    const updated = students.filter(s => s.id !== studentToDelete);
    setStudents(updated);
    await updateStorage(updated);
    setStudentToDelete(null);
  };

  const filteredStudents = useMemo(() => {
    let data = students.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    data.sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    return data;
  }, [students, search, sortAsc]);

  return (
    <div className="class-detail-container">
      <div className="class-header-card">
        {editMode ? (
          <div className="edit-section">
            <input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
            />
            <button onClick={handleUpdateClass} className="action-btn save-btn">
              <Save size={16} /> Saqlash
            </button>
            <button onClick={() => setEditMode(false)} className="action-btn cancel-btn">
              <X size={16} /> Bekor
            </button>
          </div>
        ) : (
          <>
            <h1>{editedName}</h1>
            <div className="class-stats">
              <Users size={16} />
              <span>{students.length} ta o'quvchi</span>
            </div>
            <div className="class-actions">
              <button className="action-btn edit-btn" onClick={() => setEditMode(true)}>
                <Pencil size={16} /> Tahrirlash
              </button>
              <button className="action-btn delete-class-btn" onClick={() => setShowClassDeleteModal(true)}>
                <Trash2 size={16} /> O'chirish
              </button>
            </div>
          </>
        )}
      </div>

      <div className="student-section-card">
        <div className="student-controls">
          <div className="student-add-section">
            <input
              placeholder="O'quvchi ismi..."
              value={newStudent}
              onChange={e => setNewStudent(e.target.value)}
            />
            <button onClick={handleAddStudent}>Qo'shish</button>
          </div>

          <div className="student-search">
            <Search size={16} />
            <input
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={() => setSortAsc(!sortAsc)}>
              {sortAsc ? "A-Z" : "Z-A"}
            </button>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-state">Hozircha o'quvchilar yo'q</div>
        ) : (
          <div className="student-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ism</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>
                      {editingStudentId === student.id ? (
                        <input
                          value={editedStudentName}
                          onChange={e => setEditedStudentName(e.target.value)}
                        />
                      ) : (
                        student.name
                      )}
                    </td>
                    <td className="table-actions">
                      {editingStudentId === student.id ? (
                        <>
                          <button onClick={handleSaveStudent} className="icon-btn icon-edit">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingStudentId(null)} className="icon-btn">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEditStudent(student)} className="icon-btn icon-edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setStudentToDelete(student.id)} className="icon-btn icon-delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClassDeleteModal}
        title="Sinfni o'chirish"
        message="Rostdan ham ushbu sinfni o'chirmoqchimisiz?"
        onCancel={() => setShowClassDeleteModal(false)}
        onConfirm={confirmDeleteClass}
      />

      <ConfirmModal
        isOpen={studentToDelete !== null}
        title="O'quvchini o'chirish"
        message="Rostdan ham o'quvchini o'chirmoqchimisiz?"
        onCancel={() => setStudentToDelete(null)}
        onConfirm={confirmDeleteStudent}
      />
    </div>
  );
}
