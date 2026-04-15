/**
 * Cyberix AI - Cybersecurity Background Animations
 * Features: 3D Rotating Globe, Attack Lines, Matrix Rain, Particles
 */

// ============================================
// DISCLAIMER POPUP LOGIC
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const disclaimerAccepted = localStorage.getItem('cyberix_disclaimer_accepted');
    
    if (!disclaimerAccepted) {
        showDisclaimerModal();
        // Initialize animations even with disclaimer showing
        initializeAnimations();
    } else {
        initializeAnimations();
    }
});

function showDisclaimerModal() {
    const modal = document.getElementById('disclaimerModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function acceptDisclaimer() {
    localStorage.setItem('cyberix_disclaimer_accepted', 'true');
    const modal = document.getElementById('disclaimerModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function declineDisclaimer() {
    alert('You must accept the terms to use Cyberix AI.');
    window.location.href = 'about:blank';
}

// ============================================
// INITIALIZE ALL ANIMATIONS
// ============================================
function initializeAnimations() {
    console.log('Initializing animations...');
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        initMatrixRain();
        initParticles();
    }, 100);
}

// ============================================
// 3D GLOBE WITH ATTACK LINES
// ============================================
function initGlobeAnimation() {
    const canvas = document.getElementById('globeCanvas');
    if (!canvas) {
        console.error('Globe canvas not found!');
        return;
    }
    
    console.log('Initializing globe animation...');
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    
    // Globe properties
    const globe = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 180,
        rotation: 0,
        points: []
    };
    
    // Generate globe points (latitude/longitude grid)
    const latLines = 15;
    const lonLines = 30;
    
    for (let lat = 0; lat < latLines; lat++) {
        for (let lon = 0; lon < lonLines; lon++) {
            const theta = (lat / latLines) * Math.PI;
            const phi = (lon / lonLines) * Math.PI * 2;
            
            globe.points.push({
                theta: theta,
                phi: phi,
                x: 0,
                y: 0,
                z: 0
            });
        }
    }
    
    console.log('Globe points created:', globe.points.length);
    
    // Attack lines
    const attacks = [];
    const maxAttacks = 6;
    
    function createAttack() {
        const startPoint = globe.points[Math.floor(Math.random() * globe.points.length)];
        const endPoint = globe.points[Math.floor(Math.random() * globe.points.length)];
        
        attacks.push({
            start: startPoint,
            end: endPoint,
            progress: 0,
            speed: 0.008 + Math.random() * 0.012,
            opacity: 1
        });
    }
    
    // Create initial attacks
    for (let i = 0; i < maxAttacks; i++) {
        setTimeout(() => createAttack(), i * 800);
    }
    
    function projectPoint(point, rotation) {
        // 3D rotation
        const x = globe.radius * Math.sin(point.theta) * Math.cos(point.phi + rotation);
        const y = globe.radius * Math.cos(point.theta);
        const z = globe.radius * Math.sin(point.theta) * Math.sin(point.phi + rotation);
        
        // Simple perspective projection
        const scale = 400 / (400 + z);
        
        return {
            x: globe.x + x * scale,
            y: globe.y + y * scale,
            z: z,
            scale: scale
        };
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update rotation
        globe.rotation += 0.002;
        
        // Draw globe grid
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.lineWidth = 2;
        
        // Draw latitude lines
        for (let lat = 0; lat < latLines; lat++) {
            ctx.beginPath();
            let started = false;
            for (let lon = 0; lon <= lonLines; lon++) {
                const idx = lat * lonLines + (lon % lonLines);
                const point = globe.points[idx];
                const projected = projectPoint(point, globe.rotation);
                
                if (projected.z > -50) {
                    if (!started) {
                        ctx.moveTo(projected.x, projected.y);
                        started = true;
                    } else {
                        ctx.lineTo(projected.x, projected.y);
                    }
                }
            }
            ctx.stroke();
        }
        
        // Draw longitude lines
        for (let lon = 0; lon < lonLines; lon++) {
            ctx.beginPath();
            let started = false;
            for (let lat = 0; lat <= latLines; lat++) {
                const idx = (lat % latLines) * lonLines + lon;
                const point = globe.points[idx];
                const projected = projectPoint(point, globe.rotation);
                
                if (projected.z > -50) {
                    if (!started) {
                        ctx.moveTo(projected.x, projected.y);
                        started = true;
                    } else {
                        ctx.lineTo(projected.x, projected.y);
                    }
                }
            }
            ctx.stroke();
        }
        
        // Draw attack lines
        attacks.forEach((attack, index) => {
            attack.progress += attack.speed;
            
            if (attack.progress >= 1) {
                attack.progress = 0;
                attack.opacity = 1;
                // Create new attack
                const startPoint = globe.points[Math.floor(Math.random() * globe.points.length)];
                const endPoint = globe.points[Math.floor(Math.random() * globe.points.length)];
                attack.start = startPoint;
                attack.end = endPoint;
            }
            
            const startProj = projectPoint(attack.start, globe.rotation);
            const endProj = projectPoint(attack.end, globe.rotation);
            
            // Only draw if visible
            if (startProj.z > -50 || endProj.z > -50) {
                // Interpolate position
                const currentX = startProj.x + (endProj.x - startProj.x) * attack.progress;
                const currentY = startProj.y + (endProj.y - startProj.y) * attack.progress;
                
                // Draw attack line trail
                ctx.strokeStyle = `rgba(255, 0, 64, ${attack.opacity * 0.9})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(startProj.x, startProj.y);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                
                // Draw attack point (moving dot)
                ctx.fillStyle = `rgba(255, 0, 64, ${attack.opacity})`;
                ctx.beginPath();
                ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Glow effect
                ctx.shadowBlur = 25;
                ctx.shadowColor = 'rgba(255, 0, 64, 1)';
                ctx.beginPath();
                ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    console.log('Globe animation started!');
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        globe.x = canvas.width / 2;
        globe.y = canvas.height / 2;
    });
}

// ============================================
// MATRIX RAIN EFFECT
// ============================================
function initMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0f0';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            
            ctx.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.5 + 0.3})`;
            ctx.fillText(char, x, y);
            
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 50);
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// FLOATING PARTICLES WITH CONNECTIONS
// ============================================
function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 80;
    const connectionDistance = 150;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.3;
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
