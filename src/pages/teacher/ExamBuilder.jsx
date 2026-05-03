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
			}
			setLoading(false)
		}
		load()
	}, [taskId])

	/* ================= STATE ================= */

	const [examTitle, setExamTitle] = useState('')
	const [timeLimit, setTimeLimit] = useState('')
	const [maxTotalPoints, setMaxTotalPoints] = useState('')
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
			questions: updatedQuestions,
			isPublished,
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
		const questionBlocks = text.split(/\n?\d+\.\s+/).filter(Boolean)

		const parsed = questionBlocks.map(block => {
			// 🔹 Har doim 1 ball
			const points = 1

			// 🔹 Javob kaliti parsing (Answer: B yoki Javob: C)
			let correctIndex = null

			const answerMatch = block.match(/Answer:\s*([A-D])/i)
			const javobMatch = block.match(/Javob:\s*([A-D])/i)

			const correctLetter = answerMatch?.[1] || javobMatch?.[1]

			if (correctLetter) {
				correctIndex = correctLetter.toUpperCase().charCodeAt(0) - 65
			}

			// 🔹 Variant parsing
			const optionMatches = block.match(
				/A\)(.*?)B\)(.*?)C\)(.*?)D\)(.*?)(Answer:|Javob:|$)/s,
			)

			let options = ['', '', '', '']

			if (optionMatches) {
				options = [
					optionMatches[1].trim(),
					optionMatches[2].trim(),
					optionMatches[3].trim(),
					optionMatches[4].trim(),
				]
			}

			// 🔹 Savol matni
			const questionText = block.split(/A\)/)[0].trim()

			return {
				id: Date.now() + Math.random(),
				text: questionText,
				options,
				correctIndex,
				points, // ← HAR DOIM 1
			}
		})

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
    questions,
    teacherId: currentUser.id,
    classId: task.classId || null,
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
							<strong>
								{i + 1}. {q.text}
							</strong>
							<span className='question-points'>{q.points} ball</span>
						</div>

						<ul>
							{q.options.map((opt, idx) => (
								<li
									key={idx}
									className={idx === q.correctIndex ? 'correct' : ''}
								>
									{opt}
								</li>
							))}
						</ul>

						<div className='question-actions'>
							<button onClick={() => startEdit(q)}>
								<Pencil size={16} />
							</button>

							<button onClick={() => duplicateQuestion(q)}>
								<Copy size={16} />
							</button>

							<button className='delete-btn' onClick={() => setDeleteId(q.id)}>
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
