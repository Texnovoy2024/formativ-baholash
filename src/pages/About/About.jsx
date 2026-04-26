import './About.css'
import {
	HiOutlineAcademicCap,
	HiOutlineUserGroup,
	HiOutlineChartBar,
	HiOutlineGlobeAlt,
} from 'react-icons/hi'

import {
	HiOutlineClipboardCheck,
	HiOutlineBookOpen,
	HiOutlineLightBulb,
} from 'react-icons/hi'

const About = () => {
	return (
		<div className='about-page'>

			{/* HERO */}
			<section className='about-hero'>
				<div className='container'>
					<div className='about-badge'>2025–2026 o‘quv yili</div>

					<h1>Loyiha haqida</h1>

					<p>
						"Informatika va axborot texnologiyalari" fanini o‘qitishda
						formativ baholash asosida raqamli baholash platformasini
						ishlab chiqish va amaliyotga joriy etishga qaratilgan
						ilmiy-amaliy innovatsion loyiha.
					</p>
				</div>
			</section>

			{/* 1-QISM */}
			<section className='about-goal container'>

				{/* LEFT */}
				<div className='goal-left'>
					<h2>Loyiha maqsadi</h2>

					<p>
						Loyihaning asosiy maqsadi — umumta'lim maktablarida informatika
						fanini o‘qitish jarayonini zamonaviy pedagogik yondashuvlar asosida
						takomillashtirish, o‘quvchilarning algoritmik tafakkuri,
						muammoni hal qilish ko‘nikmalari va amaliy kompetensiyalarini
						rivojlantirishga xizmat qiluvchi shaffof va tizimli
						formativ baholash muhitini yaratishdir.
					</p>

					<div className='goal-stats'>

						<div className='stat-card'>
							<div className='icon globe'>
								<HiOutlineGlobeAlt />
							</div>
							<h3>Pilot hududlar</h3>
							<span>Hududiy sinov bosqichi</span>
						</div>

						<div className='stat-card'>
							<div className='icon chart'>
								<HiOutlineChartBar />
							</div>
							<h3>Kompetensiya o‘sishi</h3>
							<span>Rivojlantiruvchi baholash modeli</span>
						</div>

						<div className='stat-card'>
							<div className='icon school'>
								<HiOutlineAcademicCap />
							</div>
							<h3>Metodik qo‘llanma</h3>
							<span>Standartlashtirilgan mezonlar</span>
						</div>

						<div className='stat-card'>
							<div className='icon time'>
								<HiOutlineUserGroup />
							</div>
							<h3>3 bosqich</h3>
							<span>Tahlil → Sinov → Joriy etish</span>
						</div>

					</div>
				</div>

				{/* RIGHT */}
				<div className='goal-right'>
					<h3>Asosiy vazifalar</h3>

					<div className='task'>
						<HiOutlineClipboardCheck />
						Formativ baholash metodikasini ishlab chiqish va tizimlashtirish
					</div>

					<div className='task'>
						<HiOutlineBookOpen />
						Shakllantiruvchi baholash mezonlari va rubrikalar yaratish
					</div>

					<div className='task'>
						<HiOutlineUserGroup />
						O‘qituvchilar uchun amaliy trening va metodik qo‘llanmalar tayyorlash
					</div>

					<div className='task'>
						<HiOutlineLightBulb />
						Raqamli platforma orqali baholash jarayonini avtomatlashtirish
					</div>
				</div>
			</section>

			{/* ================= BOSQICHLAR ================= */}
			<section className='about-steps'>
				<div className='container'>
					<div className='section-title'>
						<h4>Loyiha bosqichlari</h4>
					</div>

					<div className='steps-grid'>

						{/* 1 */}
						<div className='step-card'>
							<div className='step-icon blue'>
								<HiOutlineClipboardCheck />
							</div>

							<span>I BOSQICH</span>
							<h3>Tahlil va konsepsiya ishlab chiqish</h3>
							<p>2026 (1–2-semestr)</p>

							<ul>
								<li>Mavjud baholash tizimini o‘rganish</li>
								<li>Xalqaro tajribalarni tahlil qilish</li>
								<li>Metodik modelni shakllantirish</li>
							</ul>
						</div>

						{/* 2 */}
						<div className='step-card'>
							<div className='step-icon green'>
								<HiOutlineBookOpen />
							</div>

							<span>II BOSQICH</span>
							<h3>Platforma ishlab chiqish va pilot sinov</h3>
							<p>2027 (1–2-semestr)</p>

							<ul>
								<li>Rubrika va deskriptorlarni integratsiya qilish</li>
								<li>Pilot maktablarda amaliy sinov</li>
								<li>Monitoring va natijalarni tahlil qilish</li>
							</ul>
						</div>

						{/* 3 */}
						<div className='step-card'>
							<div className='step-icon orange'>
								<HiOutlineLightBulb />
							</div>

							<span>III BOSQICH</span>
							<h3>Keng joriy etish va metodik qo‘llab-quvvatlash</h3>
							<p>2028 (1-semestr)</p>

							<ul>
								<li>Hududiy miqyosda joriy etish</li>
								<li>O‘qituvchilarni qayta tayyorlash</li>
								<li>Platformani barqaror ishlashini ta’minlash</li>
							</ul>
						</div>

					</div>
				</div>
			</section>

			{/* ================= JAMOA ================= */}
			{/* <section className='about-team container'>
				<h2 className='section-title'>Loyiha jamoasi</h2>

				<p className='section-sub'>
					Pedagogika, metodika va axborot texnologiyalari yo‘nalishidagi mutaxassislar
				</p>

				<div className='team-grid'>
					<div className='team-card'>
						<div className='avatar'>AK</div>
						<h4>Dr. Aziz Karimov</h4>
						<p>Ilmiy rahbar</p>
					</div>

					<div className='team-card'>
						<div className='avatar'>MY</div>
						<h4>Prof. Malika Yusupova</h4>
						<p>Metodik rahbar</p>
					</div>

					<div className='team-card'>
						<div className='avatar'>ST</div>
						<h4>Sh. Toshmatov</h4>
						<p>Raqamli ta'lim eksperti</p>
					</div>

					<div className='team-card'>
						<div className='avatar'>NR</div>
						<h4>N. Rahimova</h4>
						<p>Ta'lim psixologi</p>
					</div>
				</div>
			</section> */}
		</div>
	)
}

export default About