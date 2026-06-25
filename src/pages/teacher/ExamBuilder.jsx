import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import {
	PlusCircle,
	Trash2,
	Pencil,
	Save,
	Clock,
	Award,
	FileText,
	Search,
	Copy,
	ArrowUpAZ,
	ArrowDownAZ,
	AlertTriangle,
	Shuffle,
} from 'lucide-react'
import ConfirmModal from '../../components/ui/ConfirmModal'
import './ExamBuilder.css'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
import mammoth from 'mammoth'
import { getTasksFn, saveTasksFn, saveExamFn } from '../../context/authUtils'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function ExamBuilder() {
	const { taskId } = useParams()
	const navigate = useNavigate()

	const currentUser = JSON.parse(localStorage.getItem('currentUser'))

	const [tasks, setTasks] = useState([])
	const [task, setTask] = useState(null)
	const [taskIndex, setTaskIndex] = useState(-1)
	const [loading, setLoading] = useState(true)

	/* ================= LOAD FROM FIREBASE ================= */

	useEffect(() => {
		const load = async () => {
			const t = await getTasksFn(currentUser?.id)
			setTasks(t)
			const idx = t.findIndex(x => String(x.id) === String(taskId))
			setTaskIndex(idx)
			if (idx !== -1) {
				const found = t[idx]
				setTask(found)
				setExamTitle(found.examTitle || '')
				setTimeLimit(found.timeLimit || '')
				setMaxTotalPoints(found.maxTotalPoints || '')
				setIsPublished(found.isPublished || false)
				setQuestions(found.questions || [])
				setQuestionsPerStudent(found.questionsPerStudent || '')
			}
			setLoading(false)
		}
		load()
	}, [taskId])

	/* ================= STATE ================= */

	const [examTitle, setExamTitle] = useState('')
	const [timeLimit, setTimeLimit] = useState('')
	const [maxTotalPoints, setMaxTotalPoints] = useState('')
	const [questionsPerStudent, setQuestionsPerStudent] = useState('')
	const [isPublished, setIsPublished] = useState(false)

	const [questions, setQuestions] = useState([])

	const [questionText, setQuestionText] = useState('')
	const [options, setOptions] = useState(['', '', '', ''])
	const [correctIndex, setCorrectIndex] = useState(null)
	const [points, setPoints] = useState(5)

	const [search, setSearch] = useState('')
	const [sortAsc, setSortAsc] = useState(true)

	const [deleteId, setDeleteId] = useState(null)
	const [editingId, setEditingId] = useState(null)

	const [limitModal, setLimitModal] = useState(false)
	const [forceAdd, setForceAdd] = useState(false)
	const [settingsModal, setSettingsModal] = useState(false)

	const [errors, setErrors] = useState({})
	const [isSaving, setIsSaving] = useState(false)
	const [isSaved, setIsSaved] = useState(false)
	const [noQuestionModal, setNoQuestionModal] = useState(false)
	const [publishedEditModal, setPublishedEditModal] = useState(false)
	/* ================= CALCULATIONS ================= */

	const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

	/* ================= VALIDATION ================= */

	const validateSettings = () => {
		const newErrors = {}

		if (!examTitle.trim()) newErrors.examTitle = 'Imtihon nomi majburiy'
		if (!timeLimit) newErrors.timeLimit = 'Vaqt majburiy'
		if (!maxTotalPoints) newErrors.maxTotalPoints = 'Ball limiti majburiy'

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	/* ================= STORAGE ================= */

	const saveToStorage = async (updatedQuestions) => {
		setIsSaving(true)
		setIsSaved(false)

		const updatedTasks = [...tasks]
		updatedTasks[taskIndex] = {
			...task,
			examTitle,
			timeLimit,
			maxTotalPoints,
			questionsPerStudent: questionsPerStudent ? Number(questionsPerStudent) : null,
			questions: updatedQuestions,
			isPublished,
			deadline: task.deadline || null,
		}

		await saveTasksFn(currentUser?.id, updatedTasks)
		setTasks(updatedTasks)

		setTimeout(() => {
			setIsSaving(false)
			setIsSaved(true)
			setTimeout(() => setIsSaved(false), 2000)
		}, 500)
	}

	/* ================= RESET ================= */

	const resetForm = () => {
		setQuestionText('')
		setOptions(['', '', '', ''])
		setCorrectIndex(null)
		setPoints(5)
		setEditingId(null)
	}

	/* ================= ADD / EDIT ================= */

	const handleAddOrEdit = () => {
		// Publish bo‘lsa yangi savol qo‘shish bloklanadi
		if (isPublished && !editingId) {
			setPublishedEditModal(true)
			return
		}

		if (!validateSettings()) {
			setSettingsModal(true)
			return
		}

		if (!questionText.trim() || correctIndex === null) return

		const newTotal = editingId ? totalPoints : totalPoints + Number(points)

		if (maxTotalPoints && newTotal > maxTotalPoints && !forceAdd) {
			setLimitModal(true)
			return
		}

		let updated

		if (editingId) {
			updated = questions.map(q =>
				q.id === editingId
					? { ...q, text: questionText, options, correctIndex, points }
					: q,
			)
		} else {
			const newQuestion = {
				id: Date.now(),
				text: questionText,
				options,
				correctIndex,
				points,
			}
			updated = [...questions, newQuestion]
		}

		setQuestions(updated)
		saveToStorage(updated)
		resetForm()
		setForceAdd(false)
	}

	const confirmDelete = () => {
		const updated = questions.filter(q => q.id !== deleteId)

		// Agar savollar tugasa -> publish bekor qilinadi
		const shouldUnpublish = updated.length === 0

		setQuestions(updated)
		setIsPublished(shouldUnpublish ? false : isPublished)

		saveToStorage(updated)
		setDeleteId(null)
	}

	const duplicateQuestion = q => {
		const copy = { ...q, id: Date.now() }
		const updated = [...questions, copy]
		setQuestions(updated)
		saveToStorage(updated)
	}

	const startEdit = q => {
		if (isPublished) {
			setIsPublished(false)
		}

		setEditingId(q.id)
		setQuestionText(q.text)
		setOptions(q.options)
		setCorrectIndex(q.correctIndex)
		setPoints(q.points)

		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleForceContinue = () => {
		setForceAdd(true)
		setLimitModal(false)
		handleAddOrEdit()
	}
	const parseQuestions = text => {
		// =====================================================
		// QAYSI FORMAT EKANLIGINI ANIQLAYMIZ
		// =====================================================
		// Format 1 (raqamli):  "1. Savol\nA) ...\n#C) ...\nJavob: C"
		// Format 2 (+++++):    "+++++\nSavol matni\n=====# To'g'ri variant\n===== Variant\n..."
		// =====================================================

		const isHashFormat = /^\+{3,}/m.test(text)

		if (isHashFormat) {
			// ── FORMAT 2: +++++ separator, ===== variantlar, =====# to'g'ri ──
			const blocks = text.split(/\n?\+{3,}\n?/).map(b => b.trim()).filter(Boolean)

			if (blocks.length === 0) {
				alert("Savollar topilmadi. +++++ formatini tekshiring.")
				return
			}

			const parsed = blocks.map(block => {
				const lines = block.split('\n').map(l => l.trim()).filter(Boolean)

				// Birinchi qator — savol matni
				const questionText = lines[0] || ''

				const options = []
				let correctIndex = null

				// Qolgan qatorlar — variantlar
				// To'g'ri variant: "=====# matn" yoki "=====#matn"
				// Oddiy variant:   "===== matn"
				lines.slice(1).forEach(line => {
					const correctMatch = line.match(/^=+#\s*(.+)/)
					const normalMatch = line.match(/^=+\s+(.+)/)

					if (correctMatch) {
						correctIndex = options.length
						options.push(correctMatch[1].trim())
					} else if (normalMatch) {
						options.push(normalMatch[1].trim())
					}
				})

				// 4 ta bo'lmasa to'ldiramiz
				while (options.length < 4) options.push('')

				return {
					id: Date.now() + Math.random(),
					text: questionText,
					options: options.slice(0, 4),
					correctIndex,
					points: 1,
				}
			}).filter(q => q.text.length > 0)

			if (parsed.length === 0) {
				alert("Hujjatdan savollar parse qilinmadi. Format to'g'riligini tekshiring.")
				return
			}

			const updated = [...questions, ...parsed]
			setQuestions(updated)
			saveToStorage(updated)
			return
		}

		// ── FORMAT 1: raqamli savollar, # bilan to'g'ri javob ──
		// PDF da matn spaceli keladi, normalize qilamiz
		let normalizedText = text
			// Raqam va nuqta orasidagi bo'sh joyni olib tashlaymiz: "1 ." → "1."
			.replace(/(\d+)\s*\.\s*/g, '\n$1. ')
			// Variant harflari oldidan yangi qator qo'shamiz (agar yo'q bo'lsa)
			// # belgisini ham qo'llab-quvvatlaymiz: "#A)" "#A."
			.replace(/\s(#?[A-D])\)\s*/g, '\n$1) ')
			// Javob/Answer oldidan yangi qator
			.replace(/\s*(Javob|Answer)\s*:/gi, '\nJavob:')
			.trim()

		// Savollarni ajratamiz: "1. " dan boshlanuvchi bloklar
		const questionBlocks = normalizedText.split(/\n(?=\d+\.\s)/).filter(s => s.trim())

		if (questionBlocks.length === 0) {
			alert("Savollar topilmadi. Hujjat formati to'g'ri emasligini tekshiring.\n\nFormat 1 (Javobli): '1. Savol\nA) variant\n#B) to'g'ri variant\nC) variant\nD) variant'\nFormat 2 (Javob qatori): '1. Savol\nA) variant\nB) variant\nJavob: B'")
			return
		}

		const parsed = questionBlocks.map(block => {
			const lines = block.split('\n').map(l => l.trim()).filter(Boolean)

			// 🔹 Savol matni — birinchi qator (raqam va nuqtasiz)
			const questionLine = lines[0] || ''
			const questionText = questionLine.replace(/^\d+\.\s*/, '').trim()

			// 🔹 Variantlarni topish
			const options = ['', '', '', '']
			const optionLetters = ['A', 'B', 'C', 'D']
			let correctIndex = null

			lines.forEach(line => {
				optionLetters.forEach((letter, idx) => {
					// "#A) matn" — to'g'ri javob, "#A. matn" ham
					const correctMatch = line.match(new RegExp(`^#${letter}[).]\\s*(.+)`, 'i'))
					if (correctMatch) {
						options[idx] = correctMatch[1].trim()
						correctIndex = idx
						return
					}
					// "A) matn" yoki "A. matn" — oddiy variant
					const normalMatch = line.match(new RegExp(`^${letter}[).]\\s*(.+)`, 'i'))
					if (normalMatch) {
						options[idx] = normalMatch[1].trim()
					}
				})
			})

			// 🔹 Agar # topilmasa, "Javob: B" formatini tekshiramiz (orqaga mos keluvchi)
			if (correctIndex === null) {
				const answerLine = lines.find(l => /^(Javob|Answer)\s*:/i.test(l))
				if (answerLine) {
					const match = answerLine.match(/:\s*([A-D])/i)
					if (match) {
						correctIndex = match[1].toUpperCase().charCodeAt(0) - 65
					}
				}
			}

			return {
				id: Date.now() + Math.random(),
				text: questionText,
				options,
				correctIndex,
				points: 1,
			}
		}).filter(q => q.text.length > 0)

		if (parsed.length === 0) {
			alert("Hujjatdan savollar parse qilinmadi. Format to'g'riligini tekshiring.")
			return
		}

		const updated = [...questions, ...parsed]
		setQuestions(updated)
		saveToStorage(updated)
	}
	const handleFileUpload = async e => {
		const file = e.target.files[0]
		if (!file) return

		const fileType = file.name.split('.').pop().toLowerCase()

		if (fileType === 'pdf') {
			parsePDF(file)
		} else if (fileType === 'docx') {
			parseDOCX(file)
		} else {
			alert('Faqat PDF yoki DOCX yuklash mumkin')
		}
	}
	const parseDOCX = async file => {
		const reader = new FileReader()

		reader.onload = async function () {
			const arrayBuffer = this.result

			const result = await mammoth.extractRawText({ arrayBuffer })
			const text = result.value

			parseQuestions(text)
		}

		reader.readAsArrayBuffer(file)
	}
	const parsePDF = async file => {
		const reader = new FileReader()

		reader.onload = async function () {
			const typedArray = new Uint8Array(this.result)
			const pdf = await pdfjsLib.getDocument(typedArray).promise

			let fullText = ''

			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i)
				const content = await page.getTextContent()
				const strings = content.items.map(item => item.str)
				fullText += strings.join(' ') + '\n'
			}

			parseQuestions(fullText)
		}

		reader.readAsArrayBuffer(file)
	}

	/* ================= FILTER ================= */

	const filteredQuestions = useMemo(() => {
		let data = questions.filter(q =>
			q.text.toLowerCase().includes(search.toLowerCase()),
		)

		data.sort((a, b) =>
			sortAsc ? a.text.localeCompare(b.text) : b.text.localeCompare(a.text),
		)

		return data
	}, [questions, search, sortAsc])

	/* ================= UI ================= */

	if (loading) return <h2>Yuklanmoqda...</h2>
	if (taskIndex === -1) return <h2>Topshiriq topilmadi</h2>

	return (
		<div className='exam-container'>
			{/* SETTINGS */}
			<div className='exam-card'>
				<h1>
					<FileText size={22} /> Topshiriq sozlamalari
				</h1>

				<div className='input-with-icon'>
					<FileText size={18} />
					<input
						className={errors.examTitle ? 'error-input' : ''}
						placeholder='Topshiriq nomi'
						value={examTitle}
						onChange={e => setExamTitle(e.target.value)}
					/>
				</div>
				{errors.examTitle && (
					<span className='error-text'>{errors.examTitle}</span>
				)}

				<div className='input-with-icon'>
					<Clock size={18} />
					<input
						type='number'
						className={errors.timeLimit ? 'error-input' : ''}
						placeholder='Vaqt (daqiqada)'
						value={timeLimit}
						onChange={e => setTimeLimit(e.target.value)}
					/>
				</div>
				{errors.timeLimit && (
					<span className='error-text'>{errors.timeLimit}</span>
				)}

				<div className='input-with-icon'>
					<Award size={18} />
					<input
						type='number'
						className={errors.maxTotalPoints ? 'error-input' : ''}
						placeholder='Maksimal umumiy ball'
						value={maxTotalPoints}
						onChange={e => setMaxTotalPoints(Number(e.target.value))}
					/>
				</div>
				{errors.maxTotalPoints && (
					<span className='error-text'>{errors.maxTotalPoints}</span>
				)}

				<div className='input-with-icon'>
					<Shuffle size={18} />
					<input
						type='number'
						min='1'
						max={questions.length || undefined}
						placeholder={`Har studentga nechta savol (max: ${questions.length || '?'})`}
						value={questionsPerStudent}
						onChange={e => setQuestionsPerStudent(e.target.value)}
					/>
				</div>
				{questionsPerStudent && questions.length > 0 && Number(questionsPerStudent) > questions.length && (
					<span className='error-text'>
						Savollar soni {questions.length} ta, undan ko'p bo'lishi mumkin emas
					</span>
				)}
				{questionsPerStudent && Number(questionsPerStudent) > 0 && (
					<span style={{ fontSize: 12, color: '#6b7280', marginTop: -8, display: 'block' }}>
						Har o'quvchi {questionsPerStudent} ta random savol oladi ({questions.length} tadan)
					</span>
				)}

				<p className='exam-summary'>
					Savollar: {questions.length} | Umumiy ball: {totalPoints}
				</p>

				{maxTotalPoints && (
					<div className='progress-wrapper'>
						<div
							className='progress-bar'
							style={{
								width: `${Math.min(
									(totalPoints / maxTotalPoints) * 100,
									100,
								)}%`,
							}}
						/>
					</div>
				)}

				<div className='autosave-status'>
					{isSaving && 'Saqlanmoqda...'}
					{isSaved && 'Saqlandi ✓'}
				</div>
			</div>
			{noQuestionModal && (
				<div className='custom-modal-overlay'>
					<div className='custom-modal-box danger-modal'>
						<div className='modal-icon danger'>
							<AlertTriangle size={30} />
						</div>

						<h3>Kamida 1 ta savol kerak</h3>

						<p>
							Imtihonni e’lon qilishdan oldin kamida bitta savol qo‘shishingiz
							kerak.
						</p>

						<div className='custom-modal-actions'>
							<button
								className='modal-primary-btn'
								onClick={() => {
									setNoQuestionModal(false)
									window.scrollTo({ top: 500, behavior: 'smooth' })
								}}
							>
								Savol qo‘shish
							</button>

							<button
								className='modal-secondary-btn'
								onClick={() => setNoQuestionModal(false)}
							>
								Yopish
							</button>
						</div>
					</div>
				</div>
			)}
			{publishedEditModal && (
				<div className='custom-modal-overlay'>
					<div className='custom-modal-box'>
						<div className='modal-icon warning'>
							<AlertTriangle size={28} />
						</div>

						<h3>Imtihon e’lon qilingan</h3>

						<p>
							Yangi savol qo‘shish uchun avval imtihonni qayta tahrirlash
							rejimiga o‘tkazing.
						</p>

						<div className='custom-modal-actions'>
							<button
								className='modal-primary-btn'
								onClick={() => {
									setIsPublished(false)
									setPublishedEditModal(false)
								}}
							>
								Qayta tahrirlash
							</button>

							<button
								className='modal-secondary-btn'
								onClick={() => setPublishedEditModal(false)}
							>
								Yopish
							</button>
						</div>
					</div>
				</div>
			)}
			{/* PUBLISH BUTTON */}
			<button
				className={`publish-btn ${isPublished ? 'published' : ''}`}
				onClick={async () => {
  if (!validateSettings()) return

  if (questions.length === 0) {
    setNoQuestionModal(true)
    return
  }

  const examData = {
    id: task.id,
    examTitle,
    timeLimit,
    maxTotalPoints,
    questionsPerStudent: questionsPerStudent ? Number(questionsPerStudent) : null,
    questions,
    teacherId: currentUser.id,
    classId: task.classId || null,
    deadline: task.deadline || null,
    isPublished: true,
  }

  await saveExamFn(examData)

  setIsPublished(true)
  await saveToStorage(questions)
  navigate('/teacher/tasks')
}}
			>
				{isPublished ? 'E’lon qilingan ✓' : 'Imtihonni e’lon qilish'}{' '}
			</button>
			<div className='exam-card'>
				<h2>📄 Savollarni yuklash (PDF / DOCX)</h2>
				<input type='file' accept='.pdf,.docx' onChange={handleFileUpload} />
			</div>
			{/* BUILDER */}
			<div className='exam-card'>
				<h2>
					<PlusCircle size={20} />
					{editingId ? ' Savolni tahrirlash' : ' Yangi savol'}
				</h2>

				<textarea
					placeholder='Savol matni...'
					value={questionText}
					onChange={e => setQuestionText(e.target.value)}
				/>

				{options.map((opt, index) => (
					<div key={index} className='option-row'>
						<input
							placeholder={`Variant ${index + 1}`}
							value={opt}
							onChange={e => {
								const updated = [...options]
								updated[index] = e.target.value
								setOptions(updated)
							}}
						/>
						<button
							onClick={() => setCorrectIndex(index)}
							className={
								correctIndex === index ? 'correct-btn active' : 'correct-btn'
							}
						>
							To‘g‘ri
						</button>
					</div>
				))}

				<div className='input-with-icon'>
					<Award size={18} />
					<input
						type='number'
						value={points}
						onChange={e => setPoints(Number(e.target.value))}
						placeholder='Ball'
					/>
				</div>

				<button className='primary-btn' onClick={handleAddOrEdit}>
					{editingId ? <Save size={18} /> : <PlusCircle size={18} />}
					{editingId ? 'Saqlash' : 'Qo‘shish'}
				</button>
			</div>

			{/* SEARCH */}
			<div className='exam-card controls-row'>
				<div className='input-with-icon'>
					<Search size={18} />
					<input
						placeholder='Savol qidirish...'
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</div>

				<button onClick={() => setSortAsc(!sortAsc)}>
					{sortAsc ? <ArrowUpAZ size={18} /> : <ArrowDownAZ size={18} />}
				</button>
			</div>

			{/* QUESTIONS */}
			<div className='exam-card'>
				<h2>Savollar ({filteredQuestions.length})</h2>

				{filteredQuestions.map((q, i) => (
					<div key={q.id} className='question-card'>
						<div className='question-header'>
							<strong className='question-title'>
								{i + 1}. {q.text}
							</strong>
							<span className='question-points'>{q.points} ball</span>
						</div>

						<ul className='options-list'>
							{q.options.map((opt, idx) => (
								<li
									key={idx}
									className={`option-item ${idx === q.correctIndex ? 'correct' : ''}`}
								>
									{opt || <span className='empty-option'>— bo'sh variant —</span>}
								</li>
							))}
						</ul>

						<div className='question-actions'>
							<button onClick={() => startEdit(q)} title='Tahrirlash'>
								<Pencil size={16} />
							</button>

							<button onClick={() => duplicateQuestion(q)} title='Nusxa olish'>
								<Copy size={16} />
							</button>

							<button className='delete-btn' onClick={() => setDeleteId(q.id)} title="O'chirish">
								<Trash2 size={16} />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* DELETE MODAL */}
			<ConfirmModal
				isOpen={deleteId !== null}
				title='Savolni o‘chirish'
				message='Rostdan ham ushbu savolni o‘chirmoqchimisiz?'
				onCancel={() => setDeleteId(null)}
				onConfirm={confirmDelete}
			/>

			{/* LIMIT MODAL */}
			<ConfirmModal
				isOpen={limitModal}
				title='Ball limiti oshdi'
				message='Siz maksimal umumiy ball limitiga yetdingiz. Davom etmoqchimisiz?'
				onCancel={() => setLimitModal(false)}
				onConfirm={handleForceContinue}
			/>
		</div>
	)
}
