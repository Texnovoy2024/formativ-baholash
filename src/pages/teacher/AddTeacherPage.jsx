import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AddTeacherPage.css'
import { FiEye, FiEyeOff, FiUser, FiUsers, FiTrash2 } from 'react-icons/fi'
import { FiCheckCircle } from 'react-icons/fi'

const AddTeacherPage = () => {
	const { addTeacher } = useAuth()

	const [showPassword, setShowPassword] = useState(false)
	const [successModal, setSuccessModal] = useState(false)

	// 🔥 CONFIRM MODAL STATE
	const [confirmModal, setConfirmModal] = useState(false)
	const [selectedTeacher, setSelectedTeacher] = useState(null)

	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
	})

	const [teachers, setTeachers] = useState([])

	useEffect(() => {
		loadTeachers()
	}, [])

	const loadTeachers = () => {
		const users = JSON.parse(localStorage.getItem('users')) || []
		const onlyTeachers = users.filter(u => u.role === 'teacher')
		setTeachers(onlyTeachers)
	}

	const handleChange = e => {
		setForm({
			...form,
			[e.target.name]: e.target.value,
		})
	}

	const handleSubmit = e => {
		e.preventDefault()

		const res = addTeacher(form)

		if (!res.success) {
			alert(res.message)
			return
		}

		setSuccessModal(true)

		setForm({
			name: '',
			email: '',
			password: '',
		})

		loadTeachers()
	}

	// 🔥 DELETE CLICK → faqat modal ochiladi
	const handleDeleteClick = id => {
		if (id === 'main-teacher') {
			alert('Main Teacher o‘chirilmaydi ❌')
			return
		}

		setSelectedTeacher(id)
		setConfirmModal(true)
	}

	// 🔥 HAQIQIY DELETE
	const confirmDelete = () => {
		const users = JSON.parse(localStorage.getItem('users')) || []

		const updated = users.filter(u => u.id !== selectedTeacher)

		localStorage.setItem('users', JSON.stringify(updated))
		loadTeachers()

		setConfirmModal(false)
		setSelectedTeacher(null)
	}

	return (
		<div className='add-teacher-container'>
			{/* FORM */}
			<div className='teacher-form-card'>
				<div className='form-header'>
					<div className='form-icon'>
						<FiUser size={20} />
					</div>
					<h2>O‘qituvchi qo‘shish</h2>
				</div>

				<form onSubmit={handleSubmit} className='add-teacher-form'>
					<input
						name='name'
						placeholder='Ism'
						value={form.name}
						onChange={handleChange}
						required
					/>

					<input
						name='email'
						placeholder='Email'
						value={form.email}
						onChange={handleChange}
						required
					/>

					<div className='password-field'>
						<input
							name='password'
							type={showPassword ? 'text' : 'password'}
							placeholder='Parol'
							value={form.password}
							onChange={handleChange}
							required
						/>

						<span
							className='eye-icon'
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? <FiEyeOff /> : <FiEye />}
						</span>
					</div>

					<button type='submit' className='primary-btn'>
						+ Qo‘shish
					</button>
				</form>
			</div>

			{/* LIST */}
			<div className='teacher-list-card'>
				<div className='list-header'>
					<div className='form-icon'>
						<FiUsers size={20} />
					</div>
					<h3>O‘qituvchilar ro‘yxati</h3>
				</div>

				{teachers.length === 0 ? (
					<p>Hozircha o'qituvchi yo'q</p>
				) : (
					<>
						<table className='teacher-table'>
							<thead>
								<tr>
									<th>Ism</th>
									<th>Email</th>
									<th>Action</th>
								</tr>
							</thead>

							<tbody>
								{teachers.map(t => (
									<tr key={t.id}>
										<td>{t.name}</td>
										<td>{t.email}</td>
										<td>
											<button
												className='delete-btn icon'
												disabled={t.id === 'main-teacher'}
												onClick={() => handleDeleteClick(t.id)}
												title='O‘chirish'
											>
												<FiTrash2 size={18} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{/* MOBILE */}
						<div className='teacher-cards'>
							{teachers.map(t => (
								<div className='teacher-card' key={t.id}>
									<div className='teacher-left'>
										<div className='avatar'>
											{t.name.slice(0, 2).toUpperCase()}
										</div>

										<div>
											<div className='teacher-name'>{t.name}</div>
											<div className='teacher-email'>{t.email}</div>
										</div>
									</div>

									<button
										className='delete-btn icon'
										disabled={t.id === 'main-teacher'}
										onClick={() => handleDeleteClick(t.id)}
									>
										<FiTrash2 size={18} />
									</button>
								</div>
							))}
						</div>
					</>
				)}
			</div>

			{/* SUCCESS MODAL */}
			{successModal && (
				<div className='modal-overlay'>
					<div className='modal-box success'>
						<div className='modal-icon success'>
							<FiCheckCircle size={22} />
						</div>

						<h3>Muvaffaqiyatli</h3>
						<p>O‘qituvchi qo‘shildi!</p>

						<div className='modal-actions'>
							<button
								className='btn-primary'
								onClick={() => setSuccessModal(false)}
							>
								OK
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 🔥 CONFIRM MODAL */}
			{confirmModal && (
				<div className='modal-overlay'>
					<div className='modal-box delete'>
						<div className='modal-icon delete'>
							<FiTrash2 size={22} />
						</div>

						<h3>O‘chirish</h3>
						<p>Rostdan ham o‘qituvchini o‘chirmoqchimisiz?</p>

						<div className='modal-actions'>
							<button
								className='btn-cancel'
								onClick={() => setConfirmModal(false)}
							>
								Bekor qilish
							</button>

							<button className='btn-danger' onClick={confirmDelete}>
								Davom etish
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default AddTeacherPage
