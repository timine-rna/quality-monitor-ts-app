import { analyseInventory } from '../utils.js';
function formatUpdatedAt(value) {
    if (!value)
        return '—';
    try {
        const dt = new Date(value);
        if (Number.isNaN(dt.valueOf()))
            return value;
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
export function Inventory({ rows, alerts, loading, savingId, onRefresh, onUpdate, }) {
    const analysis = React.useMemo(() => analyseInventory(rows), [rows]);
    const [drafts, setDrafts] = React.useState({});
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        const next = {};
        rows.forEach(row => {
            var _a, _b, _c;
            next[row.id] = {
                stock: (_a = row.stock) !== null && _a !== void 0 ? _a : 0,
                defective_stock: (_b = row.defective_stock) !== null && _b !== void 0 ? _b : 0,
                min_threshold: (_c = row.min_threshold) !== null && _c !== void 0 ? _c : 0,
                location: row.location || '',
                avg_daily_outflow: row.avg_daily_outflow !== undefined && row.avg_daily_outflow !== null
                    ? Number(row.avg_daily_outflow)
                    : null,
            };
        });
        setDrafts(next);
    }, [rows]);
    function updateDraft(id, key, value) {
        setDrafts(prev => {
            const current = prev[id] || {
                stock: 0,
                defective_stock: 0,
                min_threshold: 0,
                location: '',
                avg_daily_outflow: null,
            };
            let nextValue;
            if (key === 'location') {
                nextValue = value;
            }
            else if (key === 'avg_daily_outflow') {
                nextValue = value === '' ? null : Number(value);
            }
            else {
                nextValue = Number(value);
            }
            return {
                ...prev,
                [id]: {
                    ...current,
                    [key]: nextValue,
                },
            };
        });
    }
    async function handleSubmit(id) {
        const draft = drafts[id];
        if (!draft)
            return;
        setError(null);
        try {
            await onUpdate(id, {
                stock: Number.isFinite(draft.stock) ? draft.stock : 0,
                defective_stock: Number.isFinite(draft.defective_stock)
                    ? draft.defective_stock
                    : 0,
                min_threshold: Number.isFinite(draft.min_threshold) ? draft.min_threshold : 0,
                location: draft.location || '',
                avg_daily_outflow: draft.avg_daily_outflow !== null && Number.isFinite(draft.avg_daily_outflow)
                    ? draft.avg_daily_outflow
                    : null,
            });
        }
        catch (err) {
            setError((err === null || err === void 0 ? void 0 : err.message) || 'Не удалось сохранить изменения');
        }
    }
    return (React.createElement("section", { className: "section" },
        React.createElement("div", { className: "container" },
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "level is-align-items-center" },
                    React.createElement("div", { className: "level-left" },
                        React.createElement("div", null,
                            React.createElement("h2", { className: "title is-4 mb-1" }, "\u0421\u043A\u043B\u0430\u0434 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430"),
                            React.createElement("p", { className: "has-text-grey" },
                                "\u041F\u043E\u0437\u0438\u0446\u0438\u0438: ",
                                rows.length,
                                " \u00B7 \u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043D\u0438\u0437\u043A\u0438\u0439 \u043E\u0441\u0442\u0430\u0442\u043E\u043A: ",
                                analysis.lowStock.length))),
                    React.createElement("div", { className: "level-right" },
                        React.createElement("button", { className: `button is-link ${loading ? 'is-loading' : ''}`, type: "button", onClick: onRefresh }, "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435")))),
            error && (React.createElement("article", { className: "message is-danger" },
                React.createElement("div", { className: "message-body" }, error))),
            React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-two-thirds" },
                    React.createElement("div", { className: "table-container box" },
                        React.createElement("table", { className: "table is-fullwidth is-hoverable" },
                            React.createElement("thead", null,
                                React.createElement("tr", null,
                                    React.createElement("th", null, "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442"),
                                    React.createElement("th", { className: "has-text-right" }, "\u041E\u0441\u0442\u0430\u0442\u043E\u043A"),
                                    React.createElement("th", { className: "has-text-right" }, "\u0411\u0440\u0430\u043A"),
                                    React.createElement("th", { className: "has-text-right" }, "\u041C\u0438\u043D. \u043F\u043E\u0440\u043E\u0433"),
                                    React.createElement("th", null, "\u041C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435"),
                                    React.createElement("th", null, "\u0421\u0440. \u0440\u0430\u0441\u0445\u043E\u0434/\u0434\u0435\u043D\u044C"),
                                    React.createElement("th", null, "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E"),
                                    React.createElement("th", null))),
                            React.createElement("tbody", null,
                                rows.map(row => {
                                    var _a, _b, _c, _d;
                                    const draft = drafts[row.id] || {
                                        stock: (_a = row.stock) !== null && _a !== void 0 ? _a : 0,
                                        defective_stock: (_b = row.defective_stock) !== null && _b !== void 0 ? _b : 0,
                                        min_threshold: (_c = row.min_threshold) !== null && _c !== void 0 ? _c : 0,
                                        location: row.location || '',
                                        avg_daily_outflow: row.avg_daily_outflow !== undefined && row.avg_daily_outflow !== null
                                            ? Number(row.avg_daily_outflow)
                                            : null,
                                    };
                                    const isLow = row.stock <= row.min_threshold;
                                    return (React.createElement("tr", { key: row.id, className: isLow ? 'has-background-warning-light' : undefined },
                                        React.createElement("td", null,
                                            React.createElement("strong", null, row.tool_name)),
                                        React.createElement("td", { className: "has-text-right", style: { width: '130px' } },
                                            React.createElement("input", { className: "input is-small", type: "number", value: draft.stock, min: 0, onChange: e => updateDraft(row.id, 'stock', e.target.value) })),
                                        React.createElement("td", { className: "has-text-right", style: { width: '180px' } },
                                            React.createElement("input", { className: "input is-small", type: "number", value: draft.defective_stock, min: 0, onChange: e => updateDraft(row.id, 'defective_stock', e.target.value) })),
                                        React.createElement("td", { className: "has-text-right", style: { width: '160px' } },
                                            React.createElement("input", { className: "input is-small", type: "number", value: draft.min_threshold, min: 0, onChange: e => updateDraft(row.id, 'min_threshold', e.target.value) })),
                                        React.createElement("td", { style: { minWidth: '160px' } },
                                            React.createElement("input", { className: "input is-small", value: draft.location, onChange: e => updateDraft(row.id, 'location', e.target.value) })),
                                        React.createElement("td", { style: { width: '130px' } },
                                            React.createElement("input", { className: "input is-small", type: "number", step: "0.1", value: (_d = draft.avg_daily_outflow) !== null && _d !== void 0 ? _d : '', onChange: e => updateDraft(row.id, 'avg_daily_outflow', e.target.value) })),
                                        React.createElement("td", { className: "is-size-7" }, formatUpdatedAt(row.updated_at)),
                                        React.createElement("td", { className: "has-text-right" },
                                            React.createElement("button", { className: `button is-primary is-small ${savingId === row.id ? 'is-loading' : ''}`, type: "button", onClick: () => handleSubmit(row.id) }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"))));
                                }),
                                !rows.length && (React.createElement("tr", null,
                                    React.createElement("td", { colSpan: 8, className: "has-text-centered has-text-grey" }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0441\u043A\u043B\u0430\u0434\u0430"))))))),
                React.createElement("div", { className: "column" },
                    React.createElement("div", { className: "box" },
                        React.createElement("h3", { className: "title is-6" }, "\u041D\u0438\u0437\u043A\u0438\u0439 \u043E\u0441\u0442\u0430\u0442\u043E\u043A"),
                        analysis.lowStock.length === 0 && (React.createElement("p", { className: "has-text-grey" }, "\u041A\u0440\u0438\u0442\u0438\u0447\u043D\u044B\u0445 \u043F\u043E\u0437\u0438\u0446\u0438\u0439 \u043D\u0435\u0442")),
                        analysis.lowStock.length > 0 && (React.createElement("ul", null, analysis.lowStock.map(item => {
                            const days = item.avg_daily_outflow && item.avg_daily_outflow > 0
                                ? (item.stock / item.avg_daily_outflow).toFixed(1)
                                : null;
                            return (React.createElement("li", { key: item.tool_name, className: "mb-3" },
                                React.createElement("strong", null, item.tool_name),
                                React.createElement("br", null),
                                "\u041E\u0441\u0442\u0430\u0442\u043E\u043A: ",
                                item.stock,
                                " (\u043C\u0438\u043D ",
                                item.min_threshold,
                                ")",
                                days ? ` · ~${days} дн. до нуля` : '',
                                item.location ? ` · ${item.location}` : ''));
                        })))),
                    React.createElement("div", { className: "box" },
                        React.createElement("h3", { className: "title is-6" }, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0442\u0440\u0435\u0432\u043E\u0433\u0438"),
                        alerts.length === 0 && (React.createElement("p", { className: "has-text-grey" }, "\u0422\u0440\u0435\u0432\u043E\u0433 \u043F\u043E \u0441\u043A\u043B\u0430\u0434\u0443 \u043D\u0435\u0442")),
                        alerts.length > 0 && (React.createElement("ul", null, alerts.map((alert, idx) => (React.createElement("li", { key: idx, className: "mb-2" }, alert.message)))))))))));
}
