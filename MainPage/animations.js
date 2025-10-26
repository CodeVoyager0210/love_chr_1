// 粒子背景实现
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 粒子系统
    const particles = [];
    const particleCount = 150;
    const colors = ['#00CED1', '#9370DB', '#6A5ACD', '#20B2AA', '#FFFFFF'];
    
    // 粒子类
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 0.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedX = Math.random() * 1.5 - 0.75;
            this.speedY = Math.random() * 1.5 - 0.75;
            this.alpha = Math.random() * 0.7 + 0.2;
            this.life = Math.random() * 150 + 75;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;
            this.pulsePhase += this.pulseSpeed;

            // Add floating motion
            this.x += Math.sin(this.pulsePhase) * 0.2;
            this.y += Math.cos(this.pulsePhase) * 0.2;

            // Add size pulsing
            const pulseFactor = 1 + Math.sin(this.pulsePhase * 2) * 0.3;
            this.currentSize = this.size * pulseFactor;

            if (this.life <= 0 ||
                this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize || this.size, 0, Math.PI * 2);
            ctx.fill();

            // Add glow effect
            ctx.globalAlpha = this.alpha * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, (this.currentSize || this.size) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // 连线函数
    function connectParticles() {
        const maxDistance = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const alpha = 0.3 * (1 - distance / maxDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 206, 209, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();

                    // Add gradient effect
                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );
                    gradient.addColorStop(0, particles[i].color);
                    gradient.addColorStop(1, particles[j].color);
                    ctx.globalAlpha = alpha * 0.5;
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.3;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 更新和绘制粒子
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // 连接粒子
        connectParticles();
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// 页面加载时初始化粒子背景
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有粒子画布，有则初始化
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        initParticleBackground();
    }
});

// 页面滚动初始化脚本
window.onload = function () {
    window.scrollTo(0, 0);
}

// 开始查询按钮功能 - 已移除
// 此功能已移至launch_monitoring.js以便更好地组织代码

// 主要动画效果
anime.timeline({
    easing: 'easeOutExpo',
})
    .add({
        targets: 'h1',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 1200,
    })
    .add({
        targets: '.tagline',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1200,
    }, '-=1000')
    .add({
        targets: '.cta-button',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 1200,
    }, '-=1000')
    .add({
        targets: '.animation-title',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
    }, '-=500')
    .add({
        targets: '.animation-showcase',
        opacity: [0, 1],
        duration: 1000,
    }, '-=500');

// 组件组装动画
const assemblyContainer = document.querySelector('.component-assembly');
const assemblyFragment = document.createDocumentFragment();
const numberOfDots = 40;

// 创建数据点
for (let i = 0; i < numberOfDots; i++) {
    const dot = document.createElement('div');
    dot.classList.add('assembly-dot');
    assemblyFragment.appendChild(dot);
}

// 组件布局
const layouts = [
    // 宽屏水平布局
    {
        width: '75%',
        height: '300px',
        html: `<div class="component-header">
            <div class="traffic-lights">
                <div class="traffic-light red"></div>
                <div class="traffic-light yellow"></div>
                <div class="traffic-light green"></div>
            </div>
            <div class="header-text">海洋表面温度监测</div>
        </div>
        <div class="content-layout-1">
            <div class="horizontal-section"></div>
            <div class="horizontal-section"></div>
            <div class="horizontal-section"></div>
            <div class="grid-overlay"></div>
        </div>`
    },
    // 窄屏垂直布局
    {
        width: '50%',
        height: '500px',
        html: `<div class="component-header">
            <div class="traffic-lights">
                <div class="traffic-light red"></div>
                <div class="traffic-light yellow"></div>
                <div class="traffic-light green"></div>
            </div>
            <div class="header-text">海域温度数据分析</div>
        </div>
        <div class="content-layout-2">
            <div class="vertical-section">
                <div class="pulse-dot"></div>
            </div>
            <div class="vertical-section">
                <div class="pulse-dot"></div>
            </div>
            <div class="vertical-section">
                <div class="pulse-dot"></div>
            </div>
            <div class="grid-overlay"></div>
        </div>`
    },
    // 中等方形布局
    {
        width: '50%',
        height: '400px',
        html: `<div class="component-header">
            <div class="traffic-lights">
                <div class="traffic-light red"></div>
                <div class="traffic-light yellow"></div>
                <div class="traffic-light green"></div>
            </div>
            <div class="header-text">温度变化趋势图表</div>
        </div>
        <div class="content-layout-3">
            <div class="animated-shape-container">
                <div class="glow-effect"></div>
                <div class="shape-element"></div>
                <div class="shape-element"></div>
                <div class="shape-element"></div>
                <div class="shape-core"></div>
                <div class="energy-ring"></div>
                ${Array(12).fill().map(() => '<div class="particle-burst"></div>').join('')}
            </div>
            <div class="grid-overlay"></div>
        </div>`
    }
];

let currentLayoutIndex = 0;

// 创建网站组件
const websiteComponent = document.createElement('div');
websiteComponent.classList.add('website-component');
updateComponent(layouts[0]);

function updateComponent(layout) {
    websiteComponent.style.setProperty('--component-width', layout.width);
    websiteComponent.style.setProperty('--component-height', layout.height);
    websiteComponent.innerHTML = layout.html;
}

assemblyContainer.appendChild(assemblyFragment);
assemblyContainer.appendChild(websiteComponent);

// 动画时间线
const assemblyTimeline = anime.timeline({
    easing: 'easeOutExpo'
});

// 初始数据点扩散
assemblyTimeline
    .add({
        targets: '.assembly-dot',
        opacity: [0, 0.8],
        scale: [0, 1],
        translateX: function () {
            return anime.random(-300, 300);
        },
        translateY: function () {
            return anime.random(-200, 200);
        },
        rotate: function () {
            return anime.random(-360, 360);
        },
        delay: anime.stagger(30, { from: 'center' }),
        duration: 1000
    })
    // 向中心聚集
    .add({
        targets: '.assembly-dot',
        translateX: 0,
        translateY: 0,
        scale: 0.5,
        rotate: 0,
        duration: 800,
        delay: anime.stagger(10),
        easing: 'easeInExpo'
    })
    // 闪烁和变换
    .add({
        targets: '.assembly-dot',
        opacity: 0,
        scale: 0,
        duration: 300,
        delay: anime.stagger(5),
        complete: function () {
            // 开始网站组件动画
            anime({
                targets: '.website-component',
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 1000,
                easing: 'easeOutElastic(1, 0.8)'
            });
        }
    });

// 添加粒子爆炸动画
function animateParticles() {
    const particles = document.querySelectorAll('.particle-burst');
    particles.forEach(particle => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);

        anime({
            targets: particle,
            opacity: [1, 0],
            scale: [1, 0],
            translateX: x,
            translateY: y,
            duration: 1500 + Math.random() * 1000,
            easing: 'easeOutExpo',
            complete: function () {
                particle.style.transform = 'translate(0, 0) scale(1)';
                particle.style.opacity = '1';
            }
        });
    });
}

// 更新间隔回调以包含粒子动画
setInterval(() => {
    anime({
        targets: '.website-component',
        opacity: 0,
        scale: 0.8,
        duration: 300,
        easing: 'easeInQuad',
        complete: function () {
            currentLayoutIndex = (currentLayoutIndex + 1) % layouts.length;
            updateComponent(layouts[currentLayoutIndex]);
            assemblyTimeline.restart();
            if (currentLayoutIndex === 2) {
                setInterval(animateParticles, 2000);
            }
        }
    });
}, 6000);

// 动画控制器类和来自原animations.js的其他代码
class AnimationController {
    constructor() {
        this.inputField = document.querySelector('.input-field');
        this.cursor = document.querySelector('.cursor');
        this.animationStage = document.querySelector('.animation-stage');
        this.currentText = '';
        this.isTyping = false;
        this.currentAnimation = null;
        this.isRotating = false;
        this.isVertical = false;
        this.setupEventListeners();
        this.initializeComponent();
    }

    setupEventListeners() {
        this.inputField.addEventListener('focus', () => this.cursor.classList.add('active'));
        this.inputField.addEventListener('blur', () => this.cursor.classList.remove('active'));
        this.inputField.addEventListener('input', (e) => this.handleInput(e));
    }

    handleInput(e) {
        const text = e.target.value;
        this.updateCursorPosition();
        this.triggerAnimation(text);
    }

    updateCursorPosition() {
        const textWidth = this.getTextWidth(this.inputField.value);
        this.cursor.style.left = `${textWidth + 24}px`;
    }

    getTextWidth(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = getComputedStyle(this.inputField).font;
        return context.measureText(text).width;
    }

    async typeText(text, delay = 50) {
        if (this.isTyping) return;
        this.isTyping = true;
        this.inputField.value = '';
        this.currentText = '';

        for (let char of text) {
            this.currentText += char;
            this.inputField.value = this.currentText;
            this.updateCursorPosition();
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        this.isTyping = false;
        this.triggerAnimation(text);
    }

    initializeComponent() {
        const component = document.createElement('div');
        component.classList.add('component');
        
        const header = document.createElement('div');
        header.classList.add('component-header');
        header.innerHTML = '<div class="component-title">My Life\'s Work</div>';
        
        const content = document.createElement('div');
        content.classList.add('component-content');
        content.innerHTML = `
            <div class="content-line"></div>
            <div class="content-line"></div>
            <div class="content-line"></div>
            <button class="cta-btn">View Project →</button>
        `;

        const glow = document.createElement('div');
        glow.classList.add('glow');
        
        component.appendChild(header);
        component.appendChild(content);
        component.appendChild(glow);
        this.animationStage.appendChild(component);

        // 移除默认悬停效果 - 仅在请求时添加
        component.addEventListener('mousemove', (e) => {
            if (!this.hoverEnabled) return;
            
            const rect = component.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            glow.style.setProperty('--x', `${x}%`);
            glow.style.setProperty('--y', `${y}%`);
            glow.style.opacity = '0.15';
        });

        component.addEventListener('mouseleave', () => {
            if (!this.hoverEnabled) return;
            glow.style.opacity = '0';
        });
    }

    clearCurrentAnimation() {
        if (this.currentAnimation) {
            anime.remove(this.currentAnimation.targets);
            if (this.currentAnimation.cleanup) {
                this.currentAnimation.cleanup();
            }
        }
    }

    triggerAnimation(text) {
        const normalizedText = text.toLowerCase().trim();
        const component = document.querySelector('.component');
        
        this.clearCurrentAnimation();
        
        if (normalizedText.includes('vertical')) {
            this.hoverEnabled = false;
            this.isVertical = true;
            this.currentAnimation = this.changeAspectRatio(component, 'vertical');
        } else if (normalizedText.includes('horizontal')) {
            this.hoverEnabled = false;
            this.isVertical = false;
            this.currentAnimation = this.changeAspectRatio(component, 'horizontal');
        }
        
        // 应用额外的动画同时保持宽高比
        if (normalizedText.includes('rotate')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.rotateComponent(component);
        } else if (normalizedText.includes('stop') && normalizedText.includes('rotat')) {
            this.hoverEnabled = false;
            this.isRotating = false;
            this.currentAnimation = this.stopRotation(component);
        } else if (normalizedText.includes('hover')) {
            this.hoverEnabled = true;
            this.currentAnimation = this.animateHover(component);
        } else if (normalizedText.includes('float')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.animateFloat(component);
        } else if (normalizedText.includes('bigger') && normalizedText.includes('glow')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.makeBiggerAndGlow(component);
        } else if (normalizedText.includes('shake')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.shakeComponent(component);
        }
    }

    rotateComponent(component) {
        // 在旋转期间保持垂直状态
        if (this.isVertical) {
            component.classList.add('vertical');
        }
        
        this.isRotating = true;
        const animation = anime({
            targets: component,
            rotate: '360deg',
            duration: 2000,
            loop: true,
            easing: 'linear'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                this.isRotating = false;
                component.style.transform = 'rotate(0deg)';
                // 清理后保持垂直状态
                if (this.isVertical) {
                    component.classList.add('vertical');
                }
            }
        };
    }

    stopRotation(component) {
        const currentRotation = getComputedStyle(component).transform;
        const animation = anime({
            targets: component,
            scale: 1.2,
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = 'scale(1.2)';
            }
        };
    }

    shakeComponent(component) {
        const animation = anime({
            targets: component,
            translateX: [
                { value: -10, duration: 100, delay: 0 },
                { value: 10, duration: 100, delay: 0 },
                { value: -10, duration: 100, delay: 0 },
                { value: 10, duration: 100, delay: 0 },
                { value: 0, duration: 100, delay: 0 }
            ],
            loop: true,
            easing: 'easeInOutSine'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = 'translateX(0)';
            }
        };
    }

    animateHover(component) {
        // 悬停期间保持垂直状态
        if (this.isVertical) {
            component.classList.add('vertical');
        }
        
        const animation = anime({
            targets: component,
            translateY: -30,
            rotate: [{ value: -2, duration: 1000 }, { value: 2, duration: 1000 }],
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = '';
                this.hoverEnabled = false;
                // 清理后保持垂直状态
                if (this.isVertical) {
                    component.classList.add('vertical');
                }
            }
        };
    }

    animateFloat(component) {
        const animation = anime({
            targets: component,
            translateY: [0, -15],
            duration: 1500,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = 'translateY(0)';
            }
        };
    }

    changeAspectRatio(component, orientation) {
        const isChangingToVertical = orientation === 'vertical';
        
        if (isChangingToVertical) {
            component.classList.add('vertical');
            component.style.width = '280px';
            component.style.height = '400px';
        } else {
            component.classList.remove('vertical');
            component.style.width = '400px';
            component.style.height = '280px';
        }

        const animation = anime({
            targets: component,
            scale: [0.9, 1],
            opacity: [0.5, 1],
            duration: 800,
            easing: 'easeOutExpo'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                // 动画后保持宽高比
                if (isChangingToVertical) {
                    component.classList.add('vertical');
                    component.style.width = '280px';
                    component.style.height = '400px';
                }
            }
        };
    }

    changeGradient(component) {
        component.style.background = 'linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 100, 255, 0.2))';
        
        anime({
            targets: component,
            scale: [0.95, 1],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }

    makeBiggerAndGlow(component) {
        const glow = component.querySelector('.glow');
        glow.style.background = 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255, 255, 255, 0.3) 0%, transparent 70%)';
        glow.style.filter = 'blur(20px)';

        const animation = anime({
            targets: component,
            scale: [1, 1.2],
            rotate: [{ value: -5, duration: 400 }, { value: 5, duration: 400 }],
            direction: 'alternate',
            loop: true,
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });

        anime({
            targets: glow,
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutExpo'
        });

        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = '';
                glow.style.opacity = '0';
            }
        };
    }

    static async runDemoSequence(controller) {
        const demos = [
            {
                text: '',
                wait: 2500,
                setup: (component) => {
                    component.style.background = 'linear-gradient(45deg, rgba(255, 27, 107, 0.1), rgba(69, 202, 255, 0.1))';
                    component.classList.remove('vertical');
                    component.style.transform = '';
                    component.style.width = '400px';
                    component.style.height = '280px';
                    controller.isVertical = false;
                }
            },
            {
                text: 'Make it vertical and hover...',
                wait: 2500,
                setup: (component) => {
                    const glow = component.querySelector('.glow');
                    glow.style.opacity = '0';
                    controller.isVertical = true;
                }
            },
            {
                text: 'Now rotate it...',
                wait: 2500,
                setup: (component) => {
                    component.style.transform = '';
                    // Maintain vertical state
                    if (controller.isVertical) {
                        component.classList.add('vertical');
                    }
                }
            },
            {
                text: 'Stop rotating and make it big...',
                wait: 2500,
                setup: (component) => {
                    // Maintain vertical state
                    if (controller.isVertical) {
                        component.classList.add('vertical');
                    }
                }
            },
            {
                text: 'Shake it up!',
                wait: 2500,
                setup: (component) => {
                    component.style.transform = '';
                    // Maintain vertical state
                    if (controller.isVertical) {
                        component.classList.add('vertical');
                    }
                }
            }
        ];

        let currentIndex = 0;

        while (true) {
            const demo = demos[currentIndex];
            const component = document.querySelector('.component');
            
            demo.setup(component);
            
            await controller.typeText(demo.text);
            await new Promise(resolve => setTimeout(resolve, demo.wait));
            
            await anime({
                targets: controller.inputField,
                opacity: [1, 0],
                duration: 200,
                easing: 'easeOutQuad'
            }).finished;
            
            controller.inputField.value = '';
            
            await anime({
                targets: controller.inputField,
                opacity: [0, 1],
                duration: 200,
                easing: 'easeInQuad'
            }).finished;

            currentIndex = (currentIndex + 1) % demos.length;
        }
    }
}

// 页面加载时初始化动画
window.addEventListener('DOMContentLoaded', () => {
    const controller = new AnimationController();
    AnimationController.runDemoSequence(controller);
});

// 用户评价动画
const testimonialsTitle = document.querySelector('.testimonials-title');
const testimonialCards = document.querySelectorAll('.testimonial-card');

// 为用户评价创建交叉观察器
const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 标题进入视图时动画
            anime({
                targets: testimonialsTitle,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 1000,
                easing: 'easeOutExpo'
            });

            // 卡片交错动画
            anime({
                targets: testimonialCards,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                delay: anime.stagger(150),
                easing: 'easeOutExpo'
            });

            testimonialObserver.disconnect();
        }
    });
}, {
    threshold: 0.2
});

testimonialObserver.observe(document.querySelector('.testimonials-section'));

// 为用户评价部分创建和动画形状
const testimonialsShapes = document.querySelector('.testimonials-shapes');
const shapeTypes = [
    // 小形状
    {
        svg: '<circle cx="50%" cy="50%" r="45%"/>',
        class: 'small'
    },
    {
        svg: '<rect width="90%" height="90%" x="5%" y="5%"/>',
        class: 'small'
    },
    {
        svg: '<polygon points="50,5 95,90 5,90"/>',
        class: 'small'
    },
    // 中等形状
    {
        svg: '<circle cx="50%" cy="50%" r="45%"/>',
        class: 'medium outline'
    },
    {
        svg: '<rect width="90%" height="90%" x="5%" y="5%"/>',
        class: 'medium'
    },
    // 大形状
    {
        svg: '<polygon points="50,5 95,90 5,90"/>',
        class: 'large outline'
    }
];

// 向用户评价部分添加更多形状
for (let i = 0; i < 40; i++) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    
    svg.classList.add('testimonial-shape');
    svg.classList.add(shapeType.class);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.left = Math.random() * 100 + '%';
    svg.style.top = Math.random() * 100 + '%';
    svg.innerHTML = shapeType.svg;
    testimonialsShapes.appendChild(svg);
}

// 为用户评价形状添加更多样化的动画
anime({
    targets: '.testimonial-shape',
    translateX: function() { 
        return anime.random(-50, 50) + 'px';
    },
    translateY: function() { 
        return anime.random(-50, 50) + 'px';
    },
    rotate: function() {
        return anime.random(-180, 180);
    },
    scale: function(el) {
        return el.classList.contains('small') ? 
            anime.random(0.5, 1) :
            el.classList.contains('medium') ?
                anime.random(0.8, 1.2) :
                anime.random(1, 1.5);
    },
    opacity: function(el) {
        return el.classList.contains('outline') ?
            anime.random(0.05, 0.1) :
            anime.random(0.03, 0.08);
    },
    duration: function() {
        return anime.random(3000, 6000);
    },
    delay: function() {
        return anime.random(0, 1000);
    },
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad'
});

// 为分隔符点添加浮动效果
anime({
    targets: '.section-separator::before',
    scale: [1, 1.2],
    opacity: [0.8, 1],
    duration: 1500,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad'
});