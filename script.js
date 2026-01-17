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


// ===== Validation =====
const form = document.getElementById('demoForm');

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

function validateField(input) {
    const field = input.closest('.field');
    if (!field) return true;

    const required = field.dataset.required === '1';
    const min = field.dataset.min ? Number(field.dataset.min) : null;

    const val = (input.value || '').trim();
    clearError(field);

    if (required && !val) {
        setError(field, 'You made mistake');
        return false;
    }

    if (min && val.length < min) {
        setError(field, 'You made mistake');
        return false;
    }

    if (input.type === 'email' && val) {
        // простий email чек
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (!ok) {
            setError(field, 'You made mistake');
            return false;
        }
    }

    return true;
}

if (form) {
    const inputs = form.querySelectorAll('input');

    inputs.forEach(inp => {
        inp.addEventListener('blur', () => validateField(inp));
        inp.addEventListener('input', () => {
            // якщо користувач почав виправляти — прибираємо помилку
            const field = inp.closest('.field');
            if (field && field.classList.contains('is-error')) validateField(inp);
        });
    });

    form.addEventListener('submit', (e) => {
        let ok = true;
        inputs.forEach(inp => {
            if (!validateField(inp)) ok = false;
        });
        if (!ok) e.preventDefault();
    });
}

//
// if(!!document.getElementById('searchField')) {
//     // ===== Search behavior =====
//     const searchField = document.getElementById('searchField');
//     const searchInput = document.getElementById('searchInput');
//     const clearBtn = document.getElementById('clearBtn');
//     const dropdown = document.getElementById('searchDropdown');
//
//     function openDropdown() {
//         searchField.classList.add('is-open');
//     }
//
//     function closeDropdown() {
//         searchField.classList.remove('is-open');
//     }
//
//     function syncSearchUI() {
//         const has = (searchInput.value || '').length > 0;
//         searchField.classList.toggle('has-value', has);
//         if (document.activeElement === searchInput && has) openDropdown();
//         if (!has) closeDropdown();
//     }
//
//     if (searchInput) {
//         searchInput.addEventListener('focus', () => syncSearchUI());
//         searchInput.addEventListener('input', () => syncSearchUI());
//
//         document.addEventListener('click', (e) => {
//             if (!searchField.contains(e.target)) closeDropdown();
//         });
//
//         dropdown.querySelectorAll('.dropdown__item').forEach(item => {
//             item.addEventListener('click', () => {
//                 searchInput.value = item.textContent.trim();
//                 syncSearchUI();
//                 closeDropdown();
//                 searchInput.focus();
//             });
//         });
//
//         clearBtn.addEventListener('click', () => {
//             searchInput.value = '';
//             syncSearchUI();
//             searchInput.focus();
//         });
//
//         syncSearchUI();
//     }
// }


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


