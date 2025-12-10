document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CORE SETUP ---
    lucide.createIcons();
    
    // Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // --- 2. HEADER & MOBILE MENU ---
    const burger = document.querySelector('.header__burger');
    const closeBtn = document.querySelector('.nav__close');
    const nav = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    const toggleMenu = () => {
        nav.classList.toggle('is-open');
        document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
    };

    if(burger) burger.addEventListener('click', toggleMenu);
    if(closeBtn) closeBtn.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('is-open')) toggleMenu();
        });
    });

    // --- 3. HERO ANIMATIONS (Three.js + GSAP) ---
    // Text Reveal
    const heroTl = gsap.timeline();
    heroTl.from('.hero__badge', { y: 20, opacity: 0, duration: 0.8 })
          .from('.hero__title', { y: 30, opacity: 0, duration: 1 }, '-=0.6')
          .from('.hero__desc', { y: 20, opacity: 0, duration: 0.8 }, '-=0.8')
          .from('.hero__actions', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
          .from('.hero__content', { border: '1px solid transparent', duration: 1 }, '-=1');

    // 3D Sphere
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        canvasContainer.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(1.8, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x6366F1, wireframe: true, transparent: true, opacity: 0.5 });
        const pointsMaterial = new THREE.PointsMaterial({ color: 0xD4FF00, size: 0.05 });

        const sphere = new THREE.Mesh(geometry, material);
        const points = new THREE.Points(geometry, pointsMaterial);
        
        const group = new THREE.Group();
        group.add(sphere);
        group.add(points);
        scene.add(group);
        camera.position.z = 5;

        function animateThree() {
            requestAnimationFrame(animateThree);
            group.rotation.x += 0.002;
            group.rotation.y += 0.003;
            group.position.y = Math.sin(Date.now() * 0.001) * 0.1;
            renderer.render(scene, camera);
        }
        animateThree();

        window.addEventListener('resize', () => {
            const width = canvasContainer.clientWidth;
            const height = canvasContainer.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });
    }

    // --- 4. SCROLL ANIMATIONS (Sections) ---
    // Fade Up for Titles
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: { trigger: title, start: 'top 85%' },
            y: 30, opacity: 0, duration: 0.8
        });
    });

    // Bento Cards
    gsap.utils.toArray('.bento-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: { trigger: item, start: 'top 90%' },
            y: 50, opacity: 0, duration: 0.6, delay: i * 0.1
        });
    });

    // Steps
    gsap.utils.toArray('.step').forEach((step, i) => {
        gsap.from(step, {
            scrollTrigger: { trigger: '.steps', start: 'top 80%' },
            y: 30, opacity: 0, duration: 0.6, delay: i * 0.15
        });
    });

// --- 5. CONTACT FORM LOGIC ---
    const form = document.getElementById('lead-form');
    const phoneInput = document.getElementById('phone');
    const captchaInput = document.getElementById('captcha');
    const captchaLabel = document.getElementById('captcha-label');
    const policyCheckbox = document.getElementById('policy'); // <--- Находим чекбокс
    const statusDiv = document.getElementById('form-status');

    // Phone: Digits only
    if(phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Math Captcha
    let num1 = Math.floor(Math.random() * 10);
    let num2 = Math.floor(Math.random() * 10);
    if(captchaLabel) captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            statusDiv.textContent = '';
            statusDiv.className = 'form-status';

            // Reset errors (убираем красную обводку и цвет у чекбокса)
            document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
            document.querySelectorAll('.form-checkbox').forEach(el => el.classList.remove('error'));

            // 1. Name & Email
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            
            if(name.value.trim().length < 2) {
                name.parentElement.classList.add('error');
                isValid = false;
            }
            if(!email.value.includes('@') || !email.value.includes('.')) {
                email.parentElement.classList.add('error');
                isValid = false;
            }

            // 2. Phone
            if(phoneInput.value.length < 6) {
                phoneInput.parentElement.classList.add('error');
                isValid = false;
            }

            // 3. Captcha
            if(parseInt(captchaInput.value) !== (num1 + num2)) {
                captchaInput.parentElement.classList.add('error');
                isValid = false;
            }

            // 4. CHECKBOX (Новая проверка)
            if (!policyCheckbox.checked) {
                policyCheckbox.parentElement.classList.add('error');
                isValid = false;
            }

            // 5. Submit
            if(isValid) {
                const btn = form.querySelector('button');
                const originalText = btn.textContent;
                btn.textContent = 'Отправка...';
                btn.disabled = true;

                // Simulate AJAX
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    form.reset();
                    
                    // New captcha
                    num1 = Math.floor(Math.random() * 10);
                    num2 = Math.floor(Math.random() * 10);
                    captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;
                    
                    statusDiv.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
                    statusDiv.classList.add('success');
                }, 1500);
            }
        });
    }

    // --- 6. COOKIE POPUP ---
    const cookiePopup = document.getElementById('cookie-popup');
    const acceptBtn = document.getElementById('accept-cookies');

    if(!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookiePopup.classList.add('show');
        }, 2000);
    }

    if(acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookiePopup.classList.remove('show');
        });
    }
});