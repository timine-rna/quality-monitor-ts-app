/* Shared utility functions for the quality monitoring demo. */
export const DEFAULT_THRESHOLDS = {
    T_crit: 28,
    V_crit: 0.25,
    W_crit: 60,
    p_crit: 0.7,
    window: 50,
};
const EPS = 1e-9;
const headerMap = {
    temperature: 't',
    'температура': 't',
    vibration: 'v',
    'вибрация': 'v',
    wear: 'w',
    'износ': 'w',
    defect: 'defect',
    'брак': 'defect',
    machine: 'machine',
    'станок': 'machine',
    time: 'ts',
    timestamp: 'ts',
    datetime: 'ts',
    date: 'ts',
};
function toNumber(value) {
    if (value === null || value === undefined || value === '')
        return undefined;
    const num = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
    return Number.isFinite(num) ? num : undefined;
}
function normaliseKey(key) {
    return (key || '').toString().trim().toLowerCase();
}
export function parseProcessCsvRows(rawRows) {
    const rows = [];
    const warnings = [];
    rawRows.forEach((raw, idx) => {
        if (!raw)
            return;
        const normalised = {};
        Object.keys(raw).forEach(k => {
            const key = normaliseKey(k);
            const mapped = headerMap[key];
            if (!mapped || mapped === 'ignored')
                return;
            if (mapped === 'ts') {
                const tsValue = String(raw[k]).trim();
                if (tsValue) {
                    normalised.ts = tsValue;
                }
            }
            else if (mapped === 'defect') {
                const val = toNumber(raw[k]);
                if (val !== undefined) {
                    normalised.defect = val >= 0.5 ? 1 : 0;
                }
            }
            else if (mapped === 't' || mapped === 'v' || mapped === 'w') {
                const val = toNumber(raw[k]);
                if (val !== undefined) {
                    normalised[mapped] = val;
                }
            }
            else if (mapped === 'machine') {
                const str = String(raw[k]).trim();
                if (str) {
                    normalised.machine = str;
                }
            }
        });
        if (typeof normalised.t === 'number' &&
            typeof normalised.v === 'number' &&
            typeof normalised.w === 'number') {
            rows.push({
                t: normalised.t,
                v: normalised.v,
                w: normalised.w,
                defect: normalised.defect,
                machine: normalised.machine,
                ts: normalised.ts,
            });
        }
        else {
            warnings.push(`Строка ${idx + 1} пропущена: нет чисел t/v/w`);
        }
    });
    return { rows, warnings };
}
function createScaler(values) {
    const filtered = values.filter(v => Number.isFinite(v));
    if (!filtered.length) {
        return () => 0;
    }
    const min = Math.min(...filtered);
    const max = Math.max(...filtered);
    const span = max - min;
    if (span < EPS) {
        return () => 0;
    }
    return (x) => (x - min) / (span + EPS);
}
export function evaluateProcessRows(rows, thresholds) {
    if (!rows.length) {
        return { rows: [], alerts: [], avgP: 0 };
    }
    const tScale = createScaler(rows.map(r => r.t));
    const vScale = createScaler(rows.map(r => r.v));
    const wScale = createScaler(rows.map(r => r.w));
    const processed = rows.map((row, index) => {
        const scaledT = tScale(row.t);
        const scaledV = vScale(row.v);
        const scaledW = wScale(row.w);
        const q = 0.87 * scaledT + 0.45 * scaledV + 0.32 * scaledW;
        const logisticInput = 2 * q - 1;
        const p = 1 / (1 + Math.exp(-logisticInput));
        return { ...row, index, p };
    });
    const alerts = [];
    processed.forEach(row => {
        const reasons = [];
        if (row.p > thresholds.p_crit) {
            reasons.push(`p=${row.p.toFixed(2)}>${thresholds.p_crit.toFixed(2)}`);
        }
        if (row.t > thresholds.T_crit) {
            reasons.push(`T=${row.t.toFixed(2)}>${thresholds.T_crit.toFixed(2)}`);
        }
        if (row.v > thresholds.V_crit) {
            reasons.push(`V=${row.v.toFixed(3)}>${thresholds.V_crit.toFixed(3)}`);
        }
        if (row.w > thresholds.W_crit) {
            reasons.push(`W=${row.w.toFixed(1)}>${thresholds.W_crit.toFixed(1)}`);
        }
        if (reasons.length) {
            const ts = row.ts ? ` (${row.ts})` : '';
            alerts.push({
                type: 'process',
                index: row.index,
                reasons,
                message: `⚠️ Ряд ${row.index + 1}${ts}: ${reasons.join(', ')}`,
            });
        }
    });
    const avgP = processed.reduce((sum, row) => sum + row.p, 0) / (processed.length || 1);
    const latest = processed[processed.length - 1];
    return { rows: processed, alerts, avgP, latest };
}
export function buildProcessCsvExport(rows, thresholds) {
    const header = [
        'time',
        'index',
        'T',
        'V',
        'W',
        'p',
        'is_alert',
        'alert_reason',
        'defect',
        'machine',
        'T_crit',
        'V_crit',
        'W_crit',
        'p_crit',
    ];
    const lines = [header.join(',')];
    rows.forEach(row => {
        const reasons = [];
        if (row.p > thresholds.p_crit) {
            reasons.push('risk');
        }
        if (row.t > thresholds.T_crit) {
            reasons.push('temperature');
        }
        if (row.v > thresholds.V_crit) {
            reasons.push('vibration');
        }
        if (row.w > thresholds.W_crit) {
            reasons.push('wear');
        }
        const isAlert = reasons.length > 0;
        const data = [
            row.ts ? `"${row.ts.replace(/"/g, '""')}"` : String(row.index + 1),
            String(row.index + 1),
            row.t.toFixed(3),
            row.v.toFixed(5),
            row.w.toFixed(3),
            row.p.toFixed(5),
            isAlert ? '1' : '0',
            `"${reasons.join('|')}"`,
            row.defect !== undefined ? String(row.defect) : '',
            row.machine ? `"${row.machine.replace(/"/g, '""')}"` : '',
            thresholds.T_crit.toString(),
            thresholds.V_crit.toString(),
            thresholds.W_crit.toString(),
            thresholds.p_crit.toString(),
        ];
        lines.push(data.join(','));
    });
    return lines.join('\n');
}
export function triggerCsvDownload(filename, csv) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
export function parseEmployeesCsvRows(rawRows) {
    const rows = [];
    const warnings = [];
    rawRows.forEach((raw, idx) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        if (!raw)
            return;
        const id = String((_c = (_b = (_a = raw.id) !== null && _a !== void 0 ? _a : raw.ID) !== null && _b !== void 0 ? _b : raw['employee_id']) !== null && _c !== void 0 ? _c : '').trim();
        const name = String((_e = (_d = raw.name) !== null && _d !== void 0 ? _d : raw['full_name']) !== null && _e !== void 0 ? _e : '').trim();
        const shift = String((_g = (_f = raw.shift) !== null && _f !== void 0 ? _f : raw['смена']) !== null && _g !== void 0 ? _g : '').trim();
        const parts = toNumber((_j = (_h = raw.parts_made) !== null && _h !== void 0 ? _h : raw['parts']) !== null && _j !== void 0 ? _j : raw['выпуск']);
        const defects = toNumber((_l = (_k = raw.defects) !== null && _k !== void 0 ? _k : raw['defect']) !== null && _l !== void 0 ? _l : raw['дефектов']);
        const avgTemp = toNumber((_o = (_m = raw.avg_temp) !== null && _m !== void 0 ? _m : raw['avg_temperature']) !== null && _o !== void 0 ? _o : raw['ср_температура']);
        const avgVib = toNumber((_q = (_p = raw.avg_vib) !== null && _p !== void 0 ? _p : raw['avg_vibration']) !== null && _q !== void 0 ? _q : raw['ср_вибрация']);
        const avgWear = toNumber((_s = (_r = raw.avg_wear) !== null && _r !== void 0 ? _r : raw['avg_wear']) !== null && _s !== void 0 ? _s : raw['ср_износ']);
        const date = String((_v = (_u = (_t = raw.date) !== null && _t !== void 0 ? _t : raw['дата']) !== null && _u !== void 0 ? _u : raw['timestamp']) !== null && _v !== void 0 ? _v : '').trim();
        if (!id || !name || !date || parts === undefined || defects === undefined) {
            warnings.push(`Строка ${idx + 1} пропущена: нет id/name/даты/показателей`);
            return;
        }
        rows.push({
            id,
            name,
            shift: shift || 'N/A',
            parts_made: Math.round(parts),
            defects: Math.max(0, Math.round(defects)),
            avg_temp: avgTemp !== null && avgTemp !== void 0 ? avgTemp : 0,
            avg_vib: avgVib !== null && avgVib !== void 0 ? avgVib : 0,
            avg_wear: avgWear !== null && avgWear !== void 0 ? avgWear : 0,
            date,
        });
    });
    return { rows, warnings };
}
export function buildEmployeeAnalytics(rows) {
    const uniqueIds = new Set();
    const byEmployee = {};
    const byDate = {};
    let totalParts = 0;
    let totalDefects = 0;
    rows.forEach(row => {
        uniqueIds.add(row.id);
        totalParts += row.parts_made;
        totalDefects += row.defects;
        if (!byEmployee[row.id]) {
            byEmployee[row.id] = [];
        }
        byEmployee[row.id].push(row);
        if (!byDate[row.date]) {
            byDate[row.date] = [];
        }
        byDate[row.date].push(row);
    });
    const latestDate = Object.keys(byDate).sort().pop();
    const currentShiftCount = latestDate ? new Set(byDate[latestDate].map(r => r.id)).size : 0;
    const defectRate = totalParts > 0 ? (totalDefects / totalParts) * 100 : 0;
    return {
        totalEmployees: uniqueIds.size,
        totalParts,
        defectRate,
        currentShiftCount,
        byEmployee,
        byDate,
    };
}
export function topEmployeesByParts(analytics, count = 5) {
    const totals = [];
    Object.values(analytics.byEmployee).forEach(rows => {
        const total = rows.reduce((sum, row) => sum + row.parts_made, 0);
        totals.push({ id: rows[0].id, name: rows[0].name, total });
    });
    return totals
        .sort((a, b) => b.total - a.total)
        .slice(0, count);
}
export function topEmployeesByDefectRate(analytics, count = 5) {
    const totals = [];
    Object.values(analytics.byEmployee).forEach(rows => {
        const parts = rows.reduce((sum, row) => sum + row.parts_made, 0);
        const defects = rows.reduce((sum, row) => sum + row.defects, 0);
        const rate = parts > 0 ? (defects / parts) * 100 : 0;
        totals.push({ id: rows[0].id, name: rows[0].name, rate, defects });
    });
    return totals
        .sort((a, b) => b.rate - a.rate)
        .slice(0, count);
}
export function buildDailySeries(analytics, shiftFilter, employeeId) {
    const dates = Object.keys(analytics.byDate).sort();
    return dates.map(date => {
        const rows = analytics.byDate[date].filter(row => {
            if (shiftFilter && shiftFilter !== 'all' && row.shift !== shiftFilter)
                return false;
            if (employeeId && employeeId !== 'all' && row.id !== employeeId)
                return false;
            return true;
        });
        const parts = rows.reduce((sum, row) => sum + row.parts_made, 0);
        const defects = rows.reduce((sum, row) => sum + row.defects, 0);
        return { date, parts, defects };
    });
}
export function parseInventoryCsvRows(rawRows) {
    const rows = [];
    const warnings = [];
    rawRows.forEach((raw, idx) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!raw)
            return;
        const toolName = String((_c = (_b = (_a = raw.tool_name) !== null && _a !== void 0 ? _a : raw['инструмент']) !== null && _b !== void 0 ? _b : raw['название']) !== null && _c !== void 0 ? _c : '').trim();
        const stock = toNumber((_e = (_d = raw.stock) !== null && _d !== void 0 ? _d : raw['остаток']) !== null && _e !== void 0 ? _e : raw['qty']);
        const minThreshold = toNumber((_g = (_f = raw.min_threshold) !== null && _f !== void 0 ? _f : raw['минимум']) !== null && _g !== void 0 ? _g : raw['min']);
        if (!toolName || stock === undefined || minThreshold === undefined) {
            warnings.push(`Строка ${idx + 1} пропущена: нет названия или остатков`);
            return;
        }
        const location = raw.location ? String(raw.location).trim() : undefined;
        const updatedAt = raw.updated_at ? String(raw.updated_at).trim() : undefined;
        const avgDailyOutflow = toNumber((_h = raw.avg_daily_outflow) !== null && _h !== void 0 ? _h : raw['расход_в_день']);
        rows.push({
            tool_name: toolName,
            stock,
            min_threshold: minThreshold,
            location,
            updated_at: updatedAt,
            avg_daily_outflow: avgDailyOutflow,
        });
    });
    return { rows, warnings };
}
export function analyseInventory(rows) {
    const lowStock = rows.filter(row => row.stock <= row.min_threshold);
    const alerts = lowStock.map(row => {
        const daysLeft = row.avg_daily_outflow && row.avg_daily_outflow > 0
            ? (row.stock / row.avg_daily_outflow).toFixed(1)
            : undefined;
        const details = daysLeft ? ` ~${daysLeft} дн. до нуля` : '';
        return {
            type: 'inventory',
            tool: row.tool_name,
            message: `🧰 ${row.tool_name}: остаток ${row.stock} (мин ${row.min_threshold})${details}`,
        };
    });
    return { lowStock, alerts };
}
export function loadStoredThresholds() {
    try {
        const raw = localStorage.getItem('qm.thresholds');
        if (!raw)
            return { ...DEFAULT_THRESHOLDS };
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_THRESHOLDS, ...parsed };
    }
    catch (err) {
        console.warn('Не удалось прочитать пороги из localStorage', err);
        return { ...DEFAULT_THRESHOLDS };
    }
}
export function persistThresholds(thresholds) {
    localStorage.setItem('qm.thresholds', JSON.stringify(thresholds));
}
