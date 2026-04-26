import React, { useState } from 'react'
import './Register.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
	HiOutlineUser,
	HiOutlineMail,
	HiOutlineLockClosed,
	HiOutlineEye,
	HiOutlineEyeOff,
	HiOutlineAcademicCap,
	HiOutlineBookOpen,
} from 'react-icons/hi'

const Register = () => {
	const { register } = useAuth()
	const navigate = useNavigate()

	const [role, setRole] = useState('student')
	const [showPass, setShowPass] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	})

	const handleChange = e => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const handleSubmit = e => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Parollar mos emas!");
    return;
  }

  const result = register({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    role: role,
  });

  if (!result.success) {
    alert(result.message);
    return;
  }

  // 🔥 ALERTNI O‘CHIRDIK
  navigate("/login"); 
};

	return (
		<div className='register-page'>
			<div className='register-header'>
				<div className='register-logo'>
					<HiOutlineAcademicCap />
				</div>
				<h1>Ro'yxatdan o'tish</h1>
				<p>Platformaga qo'shiling</p>
			</div>

			<div className='register-tabs'>
				<button
					className={`tab ${role === 'student' ? 'active' : ''}`}
					onClick={() => setRole('student')}
				>
					<HiOutlineUser />
					O'quvchi
				</button>

				<button
					className={`tab ${role === 'teacher' ? 'active' : ''}`}
					onClick={() => setRole('teacher')}
				>
					<HiOutlineBookOpen />
					O'qituvchi
				</button>
			</div>

			<form className='register-card' onSubmit={handleSubmit}>
				<div className='form-group'>
					<label>To'liq ism</label>
					<div className='input-box'>
						<HiOutlineUser />
						<input
							type='text'
							name='name'
							value={formData.name}
							onChange={handleChange}
							placeholder='Ism Familiya'
						/>
					</div>
				</div>

				<div className='form-group'>
					<label>Email manzil</label>
					<div className='input-box'>
						<HiOutlineMail />
						<input
							type='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
							placeholder='example@gmail.com'
						/>
					</div>
				</div>

				<div className='form-group'>
					<label>Parol</label>
					<div className='input-box'>
						<HiOutlineLockClosed />
						<input
							type={showPass ? 'text' : 'password'}
							name='password'
							value={formData.password}
							onChange={handleChange}
							placeholder='********'
						/>
						<span className='eye' onClick={() => setShowPass(!showPass)}>
							{showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
						</span>
					</div>
				</div>

				<div className='form-group'>
					<label>Parolni tasdiqlang</label>
					<div className='input-box'>
						<HiOutlineLockClosed />
						<input
							type={showConfirm ? 'text' : 'password'}
							name='confirmPassword'
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder='********'
						/>
						<span className='eye' onClick={() => setShowConfirm(!showConfirm)}>
							{showConfirm ? <HiOutlineEyeOff /> : <HiOutlineEye />}
						</span>
					</div>
				</div>

				<button type='submit' className='register-btn'>
					{role === 'student'
						? "O'quvchi sifatida ro'yxatdan o'tish"
						: "O'qituvchi sifatida ro'yxatdan o'tish"}
				</button>
				<p className='switch-text'>
					Hisobingiz bormi?
					<span onClick={() => navigate('/login')}>Tizimga kiring</span>
				</p>
			</form>
			<div className='back-link' onClick={() => navigate('/')}>
				← Bosh sahifaga qaytish
			</div>
		</div>
	)
}

export default Register
