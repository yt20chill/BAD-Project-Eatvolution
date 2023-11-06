import { GooCursor } from './cursor.js';

const cursorEl = document.querySelector('.cursor');

// Initialize cursor
const goo = new GooCursor(cursorEl);

// Easter egg: click anywhere

window.addEventListener('click', () => {
    gsap.
        timeline()
        .addLabel('start', 0)
        .to(goo.DOM.cells, {
            duration: 1,
            ease: 'power4',
            opacity: 1,
            stagger: {
                from: [...goo.DOM.cells].indexOf(goo.getCellAtCursor()),
                each: 0.02,
                grid: [goo.rows, goo.columns]
            }
        }, 'start')
        .to(goo.DOM.cells, {
            duration: 1,
            ease: 'power1',
            opacity: 0,
            stagger: {
                from: [...goo.DOM.cells].indexOf(goo.getCellAtCursor()),
                each: 0.03,
                grid: [goo.rows, goo.columns]
            }
        }, 'start+=0.3')
});

const leftSlime = document.querySelector('.slime-wrapper-left .slime');
const rightSlime = document.querySelector('.slime-wrapper-right .slime');
const containerHeight = document.querySelector('.slime-container').offsetHeight;

gsap.fromTo(leftSlime,
    { y: -leftSlime.offsetHeight },
    { y: containerHeight - 100, duration: 5, ease: 'power4.out' }
    // { x: -800, y: containerHeight - 300 },
    // { x: 300, duration: 5, ease: 'power4.out' }
);

gsap.delayedCall(1, () => {
    gsap.fromTo(rightSlime,
        { y: 0 },
        { y: containerHeight / 2, duration: 5, ease: 'power4.out' }
        // { x: 500, y: containerHeight - 600 },
        // { x: -300, duration: 5, ease: 'power4.out' }
    );
});
