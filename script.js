// Quantity

if(!!document.querySelectorAll('.qty')) {
    document.querySelectorAll('.qty').forEach(qty => {
        const minus = qty.querySelector('.qty__btn--minus');
        const plus = qty.querySelector('.qty__btn--plus');
        const value = qty.querySelector('.qty__value');

        let count = 0;

        function render() {
            value.textContent = count;
            minus.disabled = count === 0;
        }

        plus.addEventListener('click', () => {
            count++;
            render();
        });

        minus.addEventListener('click', () => {
            if (count > 0) count--;
            render();
        });

        qty.addEventListener('mouseenter', () => qty.classList.add('active'));
        qty.addEventListener('mouseleave', () => qty.classList.remove('active'));

        render();
    });
}



// Search field
if(!!document.querySelector('.search-field')) {
    const search = document.querySelector('.search-field');
    const input = search.querySelector('.search-input');
    const clear = search.querySelector('.search-clear');
    const items = [...search.querySelectorAll('.search-dropdown li')];

    function filterItems(value) {
        const query = value.toLowerCase().trim();
        let visibleCount = 0;

        items.forEach(item => {
            const text = item.textContent.toLowerCase();

            if (text.includes(query)) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // error якщо нічого не знайдено
        if (query && visibleCount === 0) {
            search.classList.add('error');
            search.classList.remove('open');
        } else {
            search.classList.remove('error');
            search.classList.add('open');
        }
    }

    input.addEventListener('focus', () => {
        search.classList.add('active', 'open');
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            search.classList.remove('active', 'open');
        }, 150);
    });

    input.addEventListener('input', () => {
        const value = input.value;

        search.classList.toggle('filled', value.trim() !== '');
        filterItems(value);
    });

    clear.addEventListener('click', () => {
        input.value = '';
        items.forEach(item => item.style.display = '');
        search.classList.remove('filled', 'open', 'error');
        input.focus();
    });

    items.forEach(item => {
        item.addEventListener('click', () => {
            input.value = item.textContent;
            search.classList.add('filled');
            search.classList.remove('open', 'error');
        });
    });

// Enter → вибрати перший видимий
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const firstVisible = items.find(item => item.style.display !== 'none');

            if (firstVisible) {
                input.value = firstVisible.textContent;
                search.classList.add('filled');
                search.classList.remove('open', 'error');
            } else {
                search.classList.add('error');
                search.classList.remove('open');
            }
        }
    });


    /* demo error */
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !input.value.trim()) {
            search.classList.add('error');
            search.classList.remove('open');
        }
    });

}


if (document.querySelector('.search-field__simple')) {
    const search = document.querySelector('.search-field__simple');
    const input = search.querySelector('.search-input');
    const clear = search.querySelector('.search-clear');

    input.addEventListener('focus', () => {
        search.classList.add('active');
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            search.classList.remove('active');
        }, 150);
    });

    input.addEventListener('input', () => {
        const value = input.value;
        search.classList.toggle('filled', value.trim() !== '');
    });

    clear.addEventListener('click', () => {
        input.value = '';
        search.classList.remove('filled');
        input.focus();
    });
}



// ===== Validation =====
// --------- helpers ----------
function setError(fieldEl, msg) {
    fieldEl.classList.add('is-error');
    const msgEl = fieldEl.querySelector('.field__msg');
    if (msgEl) msgEl.textContent = msg || 'Error';
}

function clearError(fieldEl) {
    fieldEl.classList.remove('is-error');
    const msgEl = fieldEl.querySelector('.field__msg');
    if (msgEl) msgEl.textContent = '';
}

function getVal(input) {
    return (input.value || '').trim();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --------- validation rules ----------
function validateInput(input, form) {
    const field = input.closest('.field');
    if (!field) return true;

    clearError(field);

    const val = getVal(input);
    const required = field.dataset.required === '1';
    const min = field.dataset.min ? Number(field.dataset.min) : null;

    // required
    if (required && !val) {
        // кастомні required-повідомлення залежно від поля
        const nm = (input.name || '').toLowerCase();
        if (input.type === 'email' || nm === 'email') return setError(field, 'Enter your email'), false;
        if (input.type === 'password' || nm.includes('password')) return setError(field, 'Enter your password'), false;
        if (nm.includes('first')) return setError(field, 'Enter your first name'), false;
        if (nm.includes('last')) return setError(field, 'Enter your last name'), false;
        return setError(field, 'This field is required'), false;
    }

    // email format
    if ((input.type === 'email' || (input.name || '').toLowerCase() === 'email') && val) {
        if (!isValidEmail(val)) {
            setError(field, 'Enter a valid email address');
            return false;
        }
    }

    // min length for password (або будь-яке поле з data-min)
    if (min && val && val.length < min) {
        const nm = (input.name || '').toLowerCase();
        if (input.type === 'password' || nm.includes('password')) {
            setError(field, `Password must be at least ${min} characters`);
        } else {
            setError(field, `Must be at least ${min} characters`);
        }
        return false;
    }

    // confirm password (тільки для реєстрації)
    if ((input.name || '').toLowerCase() === 'password-confirmation' && val) {
        const passInput = form.querySelector('input[name="password"]');
        const passVal = passInput ? getVal(passInput) : '';
        if (passVal && val !== passVal) {
            setError(field, 'Passwords do not match');
            return false;
        }
    }

    return true;
}

// --------- init for any form ----------
function initFormValidation(formEl) {
    if (!formEl) return;

    const inputs = Array.from(formEl.querySelectorAll('input'));

    inputs.forEach(inp => {
        inp.addEventListener('blur', () => validateInput(inp, formEl));

        inp.addEventListener('input', () => {
            const field = inp.closest('.field');
            if (field?.classList.contains('is-error')) validateInput(inp, formEl);

            // якщо міняємо password — одразу пере-валіднути confirmation (щоб помилка зникала/з'являлась)
            if ((inp.name || '').toLowerCase() === 'password') {
                const confirm = formEl.querySelector('input[name="password-confirmation"]');
                if (confirm) validateInput(confirm, formEl);
            }
        });
    });

    formEl.addEventListener('submit', (e) => {
        let ok = true;
        inputs.forEach(inp => {
            if (!validateInput(inp, formEl)) ok = false;
        });
        if (!ok) e.preventDefault();
    });
}

// --------- usage: 2 different forms ----------
document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: не використовуй однаковий id="demoForm" у двох формах
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const resetEmailForm = document.getElementById('resetEmailForm');
    const resetPWForm = document.getElementById('resetPWForm');

    initFormValidation(registerForm);
    initFormValidation(loginForm);
    initFormValidation(resetEmailForm);
    initFormValidation(resetPWForm);
});




if(!!document.querySelectorAll('[data-toggle-password]')) {
    // ===== Password toggle =====
    document.querySelectorAll('[data-toggle-password]').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.closest('.field--password');
            const input = field.querySelector('input');

            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';

            field.classList.toggle('is-hidden', !(!isHidden)); // простіше нижче:
            field.classList.toggle('is-visible', isHidden);

            // нормалізація, щоб завжди був один із класів
            if (isHidden) {
                field.classList.remove('is-hidden');
                field.classList.add('is-visible');
            } else {
                field.classList.remove('is-visible');
                field.classList.add('is-hidden');
            }
        });
    });
}



(function () {
    const menu = document.querySelector('[data-user-menu]');
    if (!menu) return;

    const btn = menu.querySelector('.user-menu__btn');

    function close() {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = menu.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
})();


// ----- Pagination core -----

if(!!document.querySelector('.pagination')) {
    function getPaginationItems(totalPages, currentPage, siblingCount = 1, boundaryCount = 1) {
        const totalNumbers = siblingCount * 2 + 1;
        const totalBlocks  = totalNumbers + boundaryCount * 2;

        if (totalPages <= totalBlocks) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSibling  = Math.max(currentPage - siblingCount, boundaryCount + 1);
        const rightSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

        const showLeftDots  = leftSibling > boundaryCount + 1;
        const showRightDots = rightSibling < totalPages - boundaryCount;

        const items = [];

        // left boundary
        for (let i = 1; i <= boundaryCount; i++) items.push(i);

        // left dots
        if (showLeftDots) items.push("dots");
        else {
            for (let i = boundaryCount + 1; i < leftSibling; i++) items.push(i);
        }

        // middle range
        for (let i = leftSibling; i <= rightSibling; i++) items.push(i);

        // right dots
        if (showRightDots) items.push("dots");
        else {
            for (let i = rightSibling + 1; i <= totalPages - boundaryCount; i++) items.push(i);
        }

        // right boundary
        for (let i = totalPages - boundaryCount + 1; i <= totalPages; i++) items.push(i);

        return items;
    }

    function createIcon(direction = "right") {
        // chevron like in screenshot
        const path = direction === "left"
            ? "M15 18l-6-6 6-6"
            : "M9 6l6 6-6 6";

        return `
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="${path}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            `;
    }

    function initPagination(rootEl, { totalPages = 4, currentPage = 1, siblingCount = 1, boundaryCount = 1, onPageChange }) {
        const state = { totalPages, currentPage, siblingCount, boundaryCount, onPageChange };

        function render() {
            rootEl.innerHTML = "";

            const canPrev = state.currentPage > 1;
            const canNext = state.currentPage < state.totalPages;

            // Back (показуємо тільки якщо НЕ перша сторінка)
            if (canPrev) {
                rootEl.appendChild(renderNavButton("Back", "prev", false, createIcon("left")));
            }

            // Pages
            const items = getPaginationItems(
                state.totalPages,
                state.currentPage,
                state.siblingCount,
                state.boundaryCount
            );

            items.forEach(item => {
                if (item === "dots") {
                    const li = document.createElement("li");
                    li.className = "pagination__item";
                    li.innerHTML = `<span class="pg-ellipsis">…</span>`;
                    rootEl.appendChild(li);
                    return;
                }

                const li = document.createElement("li");
                li.className = "pagination__item";

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "pg-btn pg-btn--page" + (item === state.currentPage ? " is-active" : "");
                btn.textContent = item;
                btn.addEventListener("click", () => setPage(item));

                li.appendChild(btn);
                rootEl.appendChild(li);
            });

            // Next (показуємо тільки якщо НЕ остання сторінка)
            if (canNext) {
                rootEl.appendChild(renderNavButton("Next", "next", false, createIcon("right")));
            }
        }


        function renderNavButton(label, kind, disabled, iconSvg) {
            const li = document.createElement("li");
            li.className = "pagination__item";

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "pg-btn pg-btn--nav" + (disabled ? " is-disabled" : "");
            btn.disabled = disabled;

            if (kind === "prev") {
                btn.innerHTML = `${iconSvg}<span>${label}</span>`;
                btn.addEventListener("click", () => setPage(state.currentPage - 1));
            } else {
                btn.innerHTML = `<span>${label}</span>${iconSvg}`;
                btn.addEventListener("click", () => setPage(state.currentPage + 1));
            }

            li.appendChild(btn);
            return li;
        }

        function setPage(page) {
            const next = Math.max(1, Math.min(state.totalPages, page));
            if (next === state.currentPage) return;
            state.currentPage = next;
            render();
            if (typeof state.onPageChange === "function") state.onPageChange(next);
        }

        render();

        // API
        return {
            setPage,
            setTotalPages(n) { state.totalPages = Math.max(1, n); if (state.currentPage > state.totalPages) state.currentPage = state.totalPages; render(); },
            getPage() { return state.currentPage; }
        };
    }

// ----- Example usage -----
    if (!!document.querySelector('.pagination')) {
        // ...твій код пагінації вище без змін...

        // ---- Loader / Grid toggler ----
        const ordersGrid = document.querySelector('.orders__grid');

        // ✅ Заміни селектор на свій контейнер лотті:
        // наприклад: .orders__loader або #ordersLottie
        const lottieWrap = document.querySelector('#my-lottie-animation');

        let loadingTimer = null;
        let isLoading = false;

        function setLoading(loading) {
            isLoading = loading;

            if (ordersGrid) ordersGrid.style.display = loading ? 'none' : '';
            if (lottieWrap) lottieWrap.style.display = loading ? '' : 'none';

            // опційно: блокувати пагінацію під час лоадінга
            document.querySelectorAll('#pagination button').forEach(btn => {
                btn.disabled = loading;
                btn.classList.toggle('is-disabled', loading);
            });
        }

        // стартово: лотті сховане, таблиця показана
        if (lottieWrap) lottieWrap.style.display = 'none';

        // ----- Example usage -----
        const pager = initPagination(document.getElementById("pagination"), {
            totalPages: 8,
            currentPage: 1,
            siblingCount: 1,
            boundaryCount: 1,
            onPageChange: (page) => {
                console.log("Page:", page);

                // якщо лотті/таблиці нема — просто виходимо
                if (!ordersGrid || !lottieWrap) return;

                // якщо вже йде "завантаження" — перезапускаємо
                if (loadingTimer) clearTimeout(loadingTimer);

                setLoading(true);

                // ✅ тут можеш викликати реальний ajax/fetch замість setTimeout
                loadingTimer = setTimeout(() => {
                    setLoading(false);
                    loadingTimer = null;
                }, 2000); // "пару секунд"
            }
        });
    }


// Для тесту можеш змінити стартову сторінку:
// pager.setPage(5);
// pager.setTotalPages(24);
}

if(!!document.querySelector('.qty-stepper')) {
    document.querySelectorAll('.qty-stepper').forEach(wrap => {
        const min = Number(wrap.dataset.min ?? 10);
        const max = Number(wrap.dataset.max ?? 30);
        const step = Number(wrap.dataset.step ?? 10);

        const btnUp = wrap.querySelector('.qty-stepper__btn--up');
        const btnDown = wrap.querySelector('.qty-stepper__btn--down');
        const valueEl = wrap.querySelector('.qty-stepper__value');

        let value = parseInt(valueEl.textContent, 10);
        if (!Number.isFinite(value)) value = min;

        const clamp = v => Math.min(max, Math.max(min, v));

        const render = () => {
            valueEl.textContent = String(value);

            const atMin = value <= min;
            const atMax = value >= max;

            btnDown.disabled = atMin;
            btnUp.disabled = atMax;

            wrap.classList.toggle('is-min', atMin);
            wrap.classList.toggle('is-max', atMax);
        };

        btnUp.addEventListener('click', () => { value = clamp(value + step); render(); });
        btnDown.addEventListener('click', () => { value = clamp(value - step); render(); });

        render();
    });
}

// Lottie
if(!!document.getElementById('my-lottie-animation')) {
    var animation = bodymovin.loadAnimation({
        container: document.getElementById('my-lottie-animation'), // Контейнер
        renderer: 'svg', // Можна 'svg', 'canvas', 'html'
        loop: true, // Циклічне відтворення
        autoplay: true, // Автоматичне відтворення
        path: 'lottie/preloader.json' // Шлях до вашого JSON-файлу
    });
}





