document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth Copy Function
    const copyToClipboard = (btn, text) => {
        if (!text || text.trim() === "") return;
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
    };

    // Professional Standard اللّہ replacement
    const formatAllah = (str) => {
        return str.replace(/اللہ/g, 'اللّہ').replace(/الله/g, 'اللّہ');
    };

    // Tab switcher
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none');
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).style.display = 'block';
        });
    });

    // ===========================
    // EXTRACTOR ENGINE
    // ===========================
    const input = document.getElementById('inputText');
    const dobG = document.getElementById('dobGregorian');
    const dobH = document.getElementById('dobHijri');

    input.addEventListener('input', () => {
        const val = input.value.trim();
        if (val.length < 5) return;
        document.getElementById('outputCard').style.display = 'block';

        const iqama = val.match(/[0-9]{10}/);
        if (iqama) document.getElementById('aqamaNumber').value = iqama[0];

        const enMatch = val.match(/[a-zA-Z\s]{8,}/);
        if (enMatch && !/[0-9]/.test(enMatch[0])) document.getElementById('nameEnglish').value = enMatch[0].trim().toUpperCase();

        const arMatch = val.match(/[\u0600-\u06FF\s]{8,}/);
        if (arMatch) document.getElementById('nameArabic').value = formatAllah(arMatch[0].trim());

        const dateMatch = val.match(/([0-9]{2}[/-][0-9]{2}[/-][0-9]{4})|([0-9]{4}[/-][0-9]{2}[/-][0-9]{2})/);
        if (dateMatch) {
            const m = moment(dateMatch[0].replace(/-/g, '/'), ["DD/MM/YYYY", "YYYY/MM/DD"]);
            if (m.isValid()) {
                dobG.value = m.format('DD/MM/YYYY');
                dobH.value = m.format('iDD/iMM/iYYYY');
            }
        }
    });

    // DOB Slash Auto-Format
    dobG.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 2 && v.length <= 4) v = v.slice(0, 2) + '/' + v.slice(2);
        else if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4, 8);
        e.target.value = v;
        if (v.length === 10) {
            const m = moment(v, "DD/MM/YYYY");
            if (m.isValid()) dobH.value = m.format('iDD/iMM/iYYYY');
        }
    });

    // Nationality Logic
    document.querySelectorAll('.nat-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const current = btn.innerText;
            copyToClipboard(btn, current);
            btn.innerText = (current === btn.dataset.en) ? btn.dataset.ar : btn.dataset.en;
            btn.classList.add('flash-success');
            setTimeout(() => btn.classList.remove('flash-success'), 1000);
        });
    });

    // ===========================
    // GENERATOR ENGINE (V12 FINAL)
    // ===========================
    const geoDB = {
        Pakistan: { cities: ["Punjab", "Lahore", "Karachi", "Islamabad", "KPK", "Azad Kashmir"], id: "33100-7654321-1", addr: "House {R}, Street {S}, Sector {B}, {C}, Pakistan" },
        India: { cities: ["Delhi", "Mumbai", "Bangalore"], id: "5432 9876 1234", addr: "Flat {R}, {S} Road, Wing {B}, {C}, India" },
        UAE: { cities: ["Dubai", "Abu Dhabi", "Sharjah"], id: "784-1990-1234567-1", addr: "Villa {R}, {S} St, Area {B}, {C}, UAE" },
        Bahrain: { cities: ["Manama", "Riffa"], id: "987654321", addr: "Building {R}, Road {S}, Block {B}, {C}, Bahrain" }
    };

    const generate = () => {
        const country = document.getElementById('country-select').value;
        const city = document.getElementById('city-select').value;
        const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        let idVal = `${r(30000, 39999)}-${r(1000000, 9999999)}-${r(1, 9)}`;
        if (country === "India") idVal = `${r(1000, 9999)} ${r(1000, 9999)} ${r(1000, 9999)}`;
        if (country === "UAE") idVal = `784-${r(1985, 2005)}-${r(1000000, 9999999)}-${r(1, 9)}`;
        if (country === "Bahrain") idVal = `${r(100000000, 999999999)}`;

        document.getElementById('g-id').innerText = idVal;
        document.getElementById('g-lic').innerText = `${r(10, 99)}-${r(1000, 9999)}`;
        document.getElementById('g-issue').innerText = `14/01/2024`;
        document.getElementById('g-expiry').innerText = `13/01/2029`;
        
        const blocks = ["Phase 6", "Sector F-11/3", "Block-C", "Zone-A", "DHA Phase 2"];
        const streets = ["Main Boulevard", "Street 12-A", "Lane 4", "Service Rd South"];
        let addr = geoDB[country]?.addr || "Building {R}, Street {S}, {C}, {Country}";
        addr = addr.replace('{R}', r(1, 999)).replace('{S}', streets[r(0,3)]).replace('{B}', blocks[r(0,4)]).replace('{C}', city);
        document.getElementById('g-addr').innerText = addr;

        applyCopyEvents();
    };

    const applyCopyEvents = () => {
        document.querySelectorAll('.prof-copy-btn').forEach(btn => {
            const triggerCopy = () => {
                let text = btn.dataset.target ? document.getElementById(btn.dataset.target).innerText : btn.parentElement.querySelector('input, textarea').value;
                copyToClipboard(btn, text);
            };
            btn.onmouseenter = triggerCopy;
            btn.onclick = triggerCopy;
        });
    };

    const updateDualDate = (date) => {
        if(!date) return;
        const m = moment(date);
        document.getElementById('g-dual-date').innerHTML = `${m.format('iDD/iMM/iYYYY')}<br>${m.format('DD/MM/YYYY')}`;
    };

    // Calendar Helper
    document.getElementById('cal-trigger-box').addEventListener('click', () => {
        const picker = document.getElementById('g-cal-picker');
        try { picker.showPicker(); } catch (e) { picker.focus(); }
    });

    document.getElementById('country-select').addEventListener('change', (e) => {
        const c = e.target.value;
        const citySel = document.getElementById('city-select');
        citySel.innerHTML = "";
        (geoDB[c]?.cities || ["Central Area"]).forEach(item => citySel.innerHTML += `<option value="${item}">${item}</option>`);
        generate();
    });

    document.getElementById('city-select').addEventListener('change', generate);
    document.getElementById('main-generate-btn').addEventListener('click', generate);
    document.getElementById('g-cal-picker').addEventListener('change', (e) => updateDualDate(e.target.value));

    document.getElementById('clearAllBtn').addEventListener('click', () => {
        input.value = ''; document.getElementById('outputCard').style.display = 'none';
    });

    // Start
    document.getElementById('country-select').dispatchEvent(new Event('change'));
    updateDualDate(new Date());
});
