/**
 * monkedDev — Основной JavaScript
 * Функционал: мобильное меню, анимации, отправка формы
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ========================================
    // Мобильное меню
    // ========================================
    
    const burger = document.querySelector('.burger');
    const headerNav = document.querySelector('.header__nav');
    const headerLinks = document.querySelectorAll('.header__link');
    
    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            headerNav.classList.toggle('active');
            
            // Анимация бургера
            const spans = burger.querySelectorAll('span');
            if (burger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
        
        // Закрытие меню при клике на ссылку
        headerLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                headerNav.classList.remove('active');
                const spans = burger.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });
    }
    
    // ========================================
    // Header при скролле
    // ========================================
    
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // ========================================
    // Анимации при скролле (Fade-in)
    // ========================================
    
    const fadeElements = document.querySelectorAll('.service-card, .portfolio-card, .stage-item, .stat-card, .about__content, .order-form');
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        fadeInObserver.observe(el);
    });
    
    // ========================================
    // Плавный скролл к якорям
    // ========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ========================================
    // Обработка формы (Web3Forms)
    // ========================================
    
    const form = document.getElementById('orderForm');
    const formStatus = document.getElementById('formStatus');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Проверка чекбокса
            const privacyCheckbox = document.getElementById('privacy');
            if (!privacyCheckbox.checked) {
                showStatus('Пожалуйста, подтвердите согласие на обработку данных', 'error');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Блокируем кнопку
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            try {
                const formData = new FormData(form);
                
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showStatus('Спасибо! Ваша заявка отправлена. Я свяжусь с вами в ближайшее время.', 'success');
                    form.reset();
                } else {
                    showStatus(result.message || 'Ошибка отправки. Попробуйте позже.', 'error');
                }
            } catch (error) {
                showStatus('Ошибка сети. Проверьте подключение к интернету.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
        
        // Прокрутка к статусу
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Скрытие через 10 секунд для успеха
        if (type === 'success') {
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 10000);
        }
    }
    
    // ========================================
    // Валидация полей в реальном времени
    // ========================================
    
    const inputs = form?.querySelectorAll('.form-input[required]');
    inputs?.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#E74C3C';
            } else {
                this.style.borderColor = '';
                
                // Дополнительная валидация для email
                if (this.type === 'email' || this.id === 'contact') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                    const value = this.value.trim();
                    
                    if (!emailRegex.test(value) && !phoneRegex.test(value) && !value.includes('@')) {
                        // Не показываем ошибку, если это может быть Telegram или телефон
                    }
                }
            }
        });
        
        input.addEventListener('input', function() {
            this.style.borderColor = '';
        });
    });
    
    // ========================================
    // Консоль для разработчиков
    // ========================================
    
    console.log('%cmonkedDev Site', 'font-size: 20px; font-weight: bold; color: #7B8FD4;');
    console.log('%cСайт готов к работе!', 'font-size: 14px; color: #6B6B75;');
});
