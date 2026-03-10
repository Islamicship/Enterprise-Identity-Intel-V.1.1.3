document.addEventListener('DOMContentLoaded', () => {
    
    // Arabic Digits to Latin (١٢٣ -> 123)
    const toLatin = (s) => s.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

    // Professional Copy Logic
    const copyToClipboard = (btn, text) => {
        if (!text || text.trim() === "") return;
        const el = document.createElement('textarea');
        el.value = text.trim();
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1200);
    };

    // Allah Ligature Logic: اللّہ (Shadda + Zabar)
    const formatArabicName = (str) => {
        return str.replace(/اللہ/g, 'اللّہ').replace(/الله/g, 'اللّہ');
    };

    // Tab Switching Logic
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).style.display = 'block';
        });
    });

    // ===========================
    // 🔍 EXTRACTOR ENGINE
    // ===========================
    const input = document.getElementById('inputText');
    
    input.addEventListener('input', () => {
        const rawVal = input.value.trim();
        if (rawVal.length < 5) return;
        document.getElementById('outputCard').style.display = 'block';

        const lines = rawVal.split('\n');
        
        lines.forEach(line => {
            const cleanLine = toLatin(line.trim());
            
            // 1. Extract Aqama (10 Digits)
            const iqama = cleanLine.match(/[0-9]{10}/);
            if (iqama) document.getElementById('aqamaNumber').value = iqama[0];

            // 2. Extract English Name (Strict check: English chars only)
            const enName = line.match(/^[a-zA-Z\s]{5,25}$/); 
            if (enName && !/[0-9]/.test(line)) {
                document.getElementById('nameEnglish').value = enName[0].trim().toUpperCase();
            }

            // 3. Extract Arabic Name
            const arName = line.match(/[\u0600-\u06FF\s]{6,}/);
            if (arName && !cleanLine.match(/[0-9]{8,}/)) {
                document.getElementById('nameArabic').value = formatArabicName(arName[0].trim());
            }

            // 4. Extract Date
            const dateMatch = cleanLine.match(/([0-9]{2}[/-][0-9]{2}[/-][0-9]{4})|([0-9]{4}[/-][0-9]{2}[/-][0-9]{2})/);
            if (dateMatch) {
                const m = moment(dateMatch[0].replace(/-/g, '/'), ["DD/MM/YYYY", "YYYY/MM/DD"]);
                if (m.isValid()) {
                    document.getElementById('dobGregorian').value = m.format('DD/MM/YYYY');
                    document.getElementById('dobHijri').value = m.format('iDD/iMM/iYYYY');
                }
            }
        });
    });

    // Nationality Toggle
    document.querySelectorAll('.nat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cur = btn.innerText;
            copyToClipboard(btn, cur);
            btn.innerText = (cur === btn.dataset.en) ? btn.dataset.ar : btn.dataset.en;
            btn.classList.add('flash-success');
            setTimeout(() => btn.classList.remove('flash-success'), 1000);
        });
    });

    // ===========================
    // 🎲 GENERATOR ENGINE
    // ===========================
    const geoDB = {
        Pakistan: { cities: ["Punjab", "Lahore", "Karachi", "Islamabad"], id: "35202-XXXXXXX-X", addr: "House {R}, Street {S}, {B}, {C}, Pakistan" },
        India: { cities: ["Delhi", "Mumbai", "Bangalore"], id: "XXXX-XXXX-XXXX", addr: "Plot {R}, Road {S}, Wing {B}, {C}, India" }
    };

    const generate = () => {
        const country = document.getElementById('country-select').value;
        const city = document.getElementById('city-select').value;
        const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        document.getElementById('g-id').innerText = `${r(30000, 39999)}-${r(1000000, 9999999)}-${r(1, 9)}`;
        document.getElementById('g-lic').innerText = `${r(10, 99)}-${r(1000, 9999)}`;
        document.getElementById('g-addr').innerText = `Property ${r(1, 999)}, St 12-A, Phase 6, ${city}, ${country}`;
        
        setupCopyEvents();
    };

    const setupCopyEvents = () => {
        document.querySelectorAll('.prof-copy-btn').forEach(btn => {
            const h = () => {
                const target = btn.getAttribute('data-target');
                const val = document.getElementById(target)?.value || document.getElementById(target)?.innerText;
                copyToClipboard(btn, val);
            };
            btn.onmouseenter = h;
            btn.onclick = h;
        });
    };

    // Calendar Fix
    document.getElementById('cal-box').addEventListener('click', () => {
        const p = document.getElementById('g-cal-picker');
        try { p.showPicker(); } catch(e) { p.click(); }
    });

    document.getElementById('g-cal-picker').addEventListener('change', (e) => {
        const m = moment(e.target.value);
        document.getElementById('g-dual-date').innerHTML = `${m.format('iDD/iMM/iYYYY')}<br>${m.format('DD/MM/YYYY')}`;
    });

    document.getElementById('country-select').addEventListener('change', (e) => {
        const c = e.target.value;
        const citySel = document.getElementById('city-select');
        citySel.innerHTML = "";
        (geoDB[c]?.cities || ["Central Area"]).forEach(item => citySel.innerHTML += `<option value="${item}">${item}</option>`);
        generate();
    });

    document.getElementById('main-generate-btn').addEventListener('click', generate);
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        input.value = ''; document.getElementById('outputCard').style.display = 'none';
    });

    // Start
    const countries = Object.keys(geoDB);
    countries.forEach(c => document.getElementById('country-select').innerHTML += `<option value="${c}">${c}</option>`);
    document.getElementById('country-select').dispatchEvent(new Event('change'));
});