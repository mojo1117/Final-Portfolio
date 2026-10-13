const FORM_ENDPOINT = 'https://formspree.io/f/maeqpjpv';
const TO_EMAIL = 'macuslumbis5@gmail.com';
const MIN_MESSAGE = 20;

const form = document.getElementById('form');
const submitButton = document.getElementById('submit');
const submitLabel = submitButton.querySelector('.submit__label');
const status = document.getElementById('status');
const honeypot = document.getElementById('company');
const counter = document.getElementById('message-count');
const copyButton = document.getElementById('copy');
const clock = document.getElementById('clock');
const availability = document.getElementById('availability');
const dot = document.getElementById('dot');
const navbar = document.querySelector('.navbar');

const fields = {
    name: {
        input: document.getElementById('name'),
        error: document.getElementById('name-error'),
        check(value) {
            return value.length < 2 ? 'Please enter your name.' : '';
        }
    },
    email: {
        input: document.getElementById('email'),
        error: document.getElementById('email-error'),
        check(value) {
            if (!value) return 'Please enter your email.';
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? '' : 'That email does not look right.';
        }
    },
    message: {
        input: document.getElementById('message'),
        error: document.getElementById('message-error'),
        check(value) {
            if (value.length >= MIN_MESSAGE) return '';
            const left = MIN_MESSAGE - value.length;
            return `Tell me a little more (${left} more ${left === 1 ? 'character' : 'characters'}).`;
        }
    }
};

let sending = false;

function setStatus(text, type) {
    status.textContent = text;
    status.className = type ? `status is-${type}` : 'status';
}

function validate(key) {
    const field = fields[key];
    const message = field.check(field.input.value.trim());
    field.error.textContent = message;
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
}

Object.keys(fields).forEach((key) => {
    const { input } = fields[key];

    input.addEventListener('blur', () => {
        if (input.value.trim() || input.getAttribute('aria-invalid') === 'true') validate(key);
    });

    input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') validate(key);
    });
});

fields.message.input.addEventListener('input', () => {
    const max = fields.message.input.maxLength;
    counter.textContent = `${fields.message.input.value.length} / ${max}`;
});

function collect() {
    return {
        name: fields.name.input.value.trim(),
        email: fields.email.input.value.trim(),
        topic: form.querySelector('input[name="topic"]:checked').value,
        message: fields.message.input.value.trim()
    };
}

async function sendToServer(data) {
    const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Request failed');
}

function openMailApp(data) {
    const subject = `[${data.topic}] Message from ${data.name}`;
    const body = `${data.message}\n\n${data.name}\n${data.email}`;
    window.location.href = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function resetForm() {
    form.reset();
    counter.textContent = `0 / ${fields.message.input.maxLength}`;
    Object.keys(fields).forEach((key) => {
        fields[key].error.textContent = '';
        fields[key].input.setAttribute('aria-invalid', 'false');
    });
}

function setSending(state) {
    sending = state;
    submitButton.disabled = state;
    submitLabel.textContent = state ? 'Sending...' : 'Send message';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    const keys = Object.keys(fields);
    const results = keys.map(validate);
    const firstInvalid = keys.find((key, index) => !results[index]);

    if (firstInvalid) {
        fields[firstInvalid].input.focus();
        setStatus('Please fix the highlighted fields.', 'error');
        return;
    }

    if (honeypot.value) {
        resetForm();
        setStatus('Thank you! Your message has been sent.', 'success');
        return;
    }

    const data = collect();
    setStatus('', '');
    setSending(true);

    try {
        if (FORM_ENDPOINT) {
            await sendToServer(data);
            resetForm();
            setStatus('Thank you! Your message has been sent. I will reply within 24 hours.', 'success');
        } else {
            openMailApp(data);
            setStatus('Your email app should open with the message ready to send. If nothing happens, email me directly at ' + TO_EMAIL + '.', 'success');
        }
    } catch (error) {
        setStatus('Something went wrong. Please try again, or email me directly at ' + TO_EMAIL + '.', 'error');
    } finally {
        setSending(false);
    }
});

copyButton.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(TO_EMAIL);
        copyButton.textContent = 'Copied!';
    } catch (error) {
        copyButton.textContent = 'Copy failed';
    }

    setTimeout(() => {
        copyButton.textContent = 'Copy email';
    }, 2000);
});

function updateClock() {
    const now = new Date();

    const time = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        hour: 'numeric',
        minute: '2-digit'
    }).format(now);

    const hour = Number(new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        hour: 'numeric',
        hour12: false
    }).format(now)) % 24;

    const online = hour >= 9 && hour < 22;

    clock.textContent = time;
    availability.textContent = online ? '· likely online' : '· probably offline, I will reply in the morning';
    dot.classList.toggle('is-online', online);
}

updateClock();
setInterval(updateClock, 30000);

window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();