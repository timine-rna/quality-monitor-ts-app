function makeChartConfig(rows) {
    const labels = rows.map(row => { var _a; return (_a = row.ts) !== null && _a !== void 0 ? _a : String(row.index + 1); });
    return {
        labels,
        datasets: [
            {
                label: 'Температура (°C)',
                data: rows.map(r => r.t),
                yAxisID: 'y1',
                borderWidth: 2,
                pointRadius: 0,
                borderColor: '#e76f51',
                tension: 0.2,
            },
            {
                label: 'Вибрация (×100 мм/с)',
                data: rows.map(r => r.v * 100),
                yAxisID: 'y1',
                borderWidth: 2,
                pointRadius: 0,
                borderColor: '#2a9d8f',
                tension: 0.2,
            },
            {
                label: 'Износ (%)',
                data: rows.map(r => r.w),
                yAxisID: 'y1',
                borderWidth: 2,
                pointRadius: 0,
                borderColor: '#264653',
                tension: 0.2,
            },
            {
                label: 'Риск брака (p)',
                data: rows.map(r => r.p),
                yAxisID: 'y2',
                borderWidth: 2,
                pointRadius: 0,
                borderColor: '#f4a261',
                tension: 0.2,
            },
        ],
    };
}
function useChart(rows) {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);
    React.useEffect(() => {
        if (!canvasRef.current)
            return;
        if (!rows.length) {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
            return;
        }
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx)
            return;
        const config = {
            type: 'line',
            data: makeChartConfig(rows),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y1: {
                        type: 'linear',
                        position: 'left',
                        ticks: { beginAtZero: true },
                        title: { display: true, text: 'Показатели процесса' },
                    },
                    y2: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 1,
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Риск брака (p)' },
                    },
                },
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true },
                },
            },
        };
        if (chartRef.current) {
            chartRef.current.data = config.data;
            chartRef.current.update();
        }
        else {
            chartRef.current = new Chart(ctx, config);
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [rows]);
    return canvasRef;
}
function formatTimestamp(value) {
    if (!value)
        return '—';
    try {
        const dt = new Date(value);
        if (Number.isNaN(dt.valueOf())) {
            return value;
        }
        return dt.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    catch (err) {
        return value;
    }
}
function findRecentContext(rows) {
    const last = rows[rows.length - 1];
    if (!last)
        return {};
    return {
        machine: last.machine,
        detail: last.detail,
        shift: last.shift,
    };
}
export function Dashboard({ analytics, thresholds, warnings, alerts, loading, onRefresh, latestTimestamp, }) {
    var _a, _b, _c, _d, _e, _f;
    const { rows, avgP } = analytics;
    const canvasRef = useChart(rows);
    const context = findRecentContext(rows);
    const avgRiskPercent = Math.round(avgP * 100);
    const alertsCount = analytics.alerts.length;
    return (React.createElement("section", { className: "section" },
        React.createElement("div", { className: "container" },
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "level is-align-items-center" },
                    React.createElement("div", { className: "level-left" },
                        React.createElement("div", null,
                            React.createElement("h2", { className: "title is-4 mb-1" }, "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430"),
                            React.createElement("p", { className: "has-text-grey" },
                                "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435: ",
                                formatTimestamp(latestTimestamp),
                                context.machine ? ` · Станок: ${context.machine}` : '',
                                context.detail ? ` · Деталь: ${context.detail}` : ''))),
                    React.createElement("div", { className: "level-right" },
                        React.createElement("button", { className: `button is-link ${loading ? 'is-loading' : ''}`, type: "button", onClick: onRefresh }, "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435"))),
                React.createElement("div", { className: "columns is-variable is-4 mt-2" },
                    React.createElement("div", { className: "column" },
                        React.createElement("p", { className: "heading" }, "\u0417\u0430\u043F\u0438\u0441\u0435\u0439"),
                        React.createElement("p", { className: "title is-4" }, rows.length)),
                    React.createElement("div", { className: "column" },
                        React.createElement("p", { className: "heading" }, "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0438\u0441\u043A"),
                        React.createElement("p", { className: "title is-4" }, Number.isFinite(avgRiskPercent) ? `${avgRiskPercent}%` : '—')),
                    React.createElement("div", { className: "column" },
                        React.createElement("p", { className: "heading" }, "\u041F\u043E\u0440\u043E\u0433 \u0440\u0438\u0441\u043A\u0430"),
                        React.createElement("p", { className: "title is-4" },
                            Math.round(thresholds.p_crit * 100),
                            "%")),
                    React.createElement("div", { className: "column" },
                        React.createElement("p", { className: "heading" }, "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0439"),
                        React.createElement("p", { className: "title is-4" }, alertsCount)))),
            React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-two-thirds" },
                    React.createElement("div", { className: "box" },
                        React.createElement("div", { className: "level" },
                            React.createElement("div", { className: "level-left" },
                                React.createElement("h3", { className: "title is-5" }, "\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430")),
                            React.createElement("div", { className: "level-right" },
                                React.createElement("span", { className: "tag is-light" },
                                    "\u041F\u043E\u0440\u043E\u0433 T: ",
                                    thresholds.T_crit,
                                    " \u00B0C"),
                                React.createElement("span", { className: "tag is-light ml-2" },
                                    "\u041F\u043E\u0440\u043E\u0433 V: ",
                                    thresholds.V_crit.toFixed(2),
                                    " \u043C\u043C/\u0441"),
                                React.createElement("span", { className: "tag is-light ml-2" },
                                    "\u041F\u043E\u0440\u043E\u0433 W: ",
                                    thresholds.W_crit,
                                    "%"))),
                        React.createElement("div", { style: { height: '340px' } }, rows.length ? (React.createElement("canvas", { ref: canvasRef })) : (React.createElement("div", { className: "has-text-centered has-text-grey py-6" }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0433\u0440\u0430\u0444\u0438\u043A\u0430")))),
                    warnings.length > 0 && (React.createElement("article", { className: "message is-warning" },
                        React.createElement("div", { className: "message-header" },
                            React.createElement("p", null, "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438")),
                        React.createElement("div", { className: "message-body" },
                            React.createElement("ul", null, warnings.map((warn, index) => (React.createElement("li", { key: index }, warn)))))))),
                React.createElement("div", { className: "column" },
                    React.createElement("div", { className: "box" },
                        React.createElement("h3", { className: "title is-6" }, "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F"),
                        alerts.length === 0 && (React.createElement("p", { className: "has-text-grey" }, "\u041D\u043E\u0432\u044B\u0445 \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0439 \u043D\u0435 \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E")),
                        alerts.length > 0 && (React.createElement("ul", null, alerts.map((alert, idx) => (React.createElement("li", { key: idx, className: "mb-3" },
                            React.createElement("span", { className: "tag is-warning is-light mr-2" }, "\u26A0\uFE0F"),
                            alert.message.replace(/^[⚠️\s]+/, ''))))))),
                    React.createElement("div", { className: "box" },
                        React.createElement("h3", { className: "title is-6" }, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u0437\u0430\u043F\u0438\u0441\u044C"),
                        rows.length ? (React.createElement("ul", { className: "is-size-7" },
                            React.createElement("li", null,
                                React.createElement("strong", null, "\u0421\u0442\u0430\u043D\u043E\u043A:"),
                                " ",
                                context.machine || '—'),
                            React.createElement("li", null,
                                React.createElement("strong", null, "\u0414\u0435\u0442\u0430\u043B\u044C:"),
                                " ",
                                context.detail || '—'),
                            React.createElement("li", null,
                                React.createElement("strong", null, "\u0421\u043C\u0435\u043D\u0430:"),
                                " ",
                                context.shift || '—'),
                            React.createElement("li", null,
                                React.createElement("strong", null, "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430:"),
                                ' ', (_b = (_a = rows[rows.length - 1].t) === null || _a === void 0 ? void 0 : _a.toFixed(2)) !== null && _b !== void 0 ? _b : '—',
                                " \u00B0C"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "\u0412\u0438\u0431\u0440\u0430\u0446\u0438\u044F:"),
                                ' ', (_d = (_c = rows[rows.length - 1].v) === null || _c === void 0 ? void 0 : _c.toFixed(3)) !== null && _d !== void 0 ? _d : '—',
                                " \u043C\u043C/\u0441"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "\u0418\u0437\u043D\u043E\u0441:"),
                                " ", (_f = (_e = rows[rows.length - 1].w) === null || _e === void 0 ? void 0 : _e.toFixed(1)) !== null && _f !== void 0 ? _f : '—',
                                " %"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "\u0420\u0438\u0441\u043A:"),
                                ' ',
                                rows[rows.length - 1].p ? rows[rows.length - 1].p.toFixed(2) : '—'))) : (React.createElement("p", { className: "has-text-grey" }, "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u043A\u0430 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442"))))))));
}
