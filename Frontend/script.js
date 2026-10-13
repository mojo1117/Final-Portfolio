const SAFETY_TIMEOUT = 4000;   
const MIN_CURTAIN_TIME = 800;  

const pageLoaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));

const minimumTime = new Promise(resolve => setTimeout(resolve, MIN_CURTAIN_TIME));

function openCurtain() {
    document.body.classList.add('is-loaded');
}

Promise.all([pageLoaded, document.fonts.ready, minimumTime]).then(openCurtain);

setTimeout(openCurtain, SAFETY_TIMEOUT);



const cursor = document.querySelector('.cursor');
const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (cursor && hasMouse) {
    const SMOOTHING = reduceMotion ? 1 : 0.18;  

    let targetX = 0, targetY = 0;     
    let currentX = 0, currentY = 0;   
    let seenMouse = false;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;

    
        if (!seenMouse) {
            currentX = targetX;
            currentY = targetY;
            seenMouse = true;
        }
    });

    document.addEventListener('mouseover', (e) => {
        const overHeadline = e.target.closest('.headline-word, .project-card');
        const ready = document.body.classList.contains('is-loaded');
        cursor.classList.toggle('is-active', Boolean(overHeadline && ready));
    });

    document.documentElement.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-active');
    });

    function tick() {
        currentX += (targetX - currentX) * SMOOTHING;
        currentY += (targetY - currentY) * SMOOTHING;
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        requestAnimationFrame(tick);
    }
    tick();
}