import { DEFAULT_THRESHOLDS, } from '../utils.js';
export function Settings({ thresholds, onThresholdsChange }) {
    var _a;
    const [draft, setDraft] = React.useState({ ...thresholds });
    const [message, setMessage] = React.useState(null);
    React.useEffect(() => {
        setDraft({ ...thresholds });
    }, [thresholds]);
    function applyChange(key, value) {
        setDraft(prev => ({ ...prev, [key]: value }));
    }
    function handleSubmit(e) {
        e.preventDefault();
        onThresholdsChange(draft);
        setMessage('Настройки сохранены');
        setTimeout(() => setMessage(null), 2000);
    }
    function handleReset() {
        onThresholdsChange({ ...DEFAULT_THRESHOLDS });
        setMessage('Сброшено к значениям по умолчанию');
        setTimeout(() => setMessage(null), 2000);
    }
    return (React.createElement("section", { className: "section" },
        React.createElement("div", { className: "container", style: { maxWidth: '520px' } },
            React.createElement("div", { className: "box" },
                React.createElement("h2", { className: "title is-4" }, "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E\u0440\u043E\u0433\u043E\u0432"),
                React.createElement("form", { onSubmit: handleSubmit },
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F, \u00B0C"),
                        React.createElement("div", { className: "control" },
                            React.createElement("input", { className: "input", type: "number", step: "0.1", value: draft.T_crit, onChange: e => applyChange('T_crit', Number(e.target.value)) }))),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "\u0412\u0438\u0431\u0440\u0430\u0446\u0438\u044F \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F, \u043C/\u0441\u00B2"),
                        React.createElement("div", { className: "control" },
                            React.createElement("input", { className: "input", type: "number", step: "0.01", value: draft.V_crit, onChange: e => applyChange('V_crit', Number(e.target.value)) }))),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "\u0418\u0437\u043D\u043E\u0441 \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439, %"),
                        React.createElement("div", { className: "control" },
                            React.createElement("input", { className: "input", type: "number", step: "1", value: draft.W_crit, onChange: e => applyChange('W_crit', Number(e.target.value)) }))),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "\u0420\u0438\u0441\u043A \u0431\u0440\u0430\u043A\u0430 \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 (p)"),
                        React.createElement("div", { className: "control" },
                            React.createElement("input", { className: "input", type: "number", step: "0.01", value: draft.p_crit, onChange: e => applyChange('p_crit', Number(e.target.value)), min: "0", max: "1" }))),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "\u041E\u043A\u043D\u043E \u0443\u0441\u0440\u0435\u0434\u043D\u0435\u043D\u0438\u044F \u0440\u0438\u0441\u043A\u0430 (\u0442\u043E\u0447\u0435\u043A)"),
                        React.createElement("div", { className: "control" },
                            React.createElement("input", { className: "input", type: "number", step: "1", value: (_a = draft.window) !== null && _a !== void 0 ? _a : 50, onChange: e => applyChange('window', Number(e.target.value)), min: "1" })),
                        React.createElement("p", { className: "help" }, "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u0440\u0430\u0441\u0447\u0451\u0442\u0435 \u0441\u043A\u043E\u043B\u044C\u0437\u044F\u0449\u0435\u0433\u043E \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E (\u0432 \u0434\u0435\u043C\u043E \u2014 \u0434\u043B\u044F \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043E\u043A).")),
                    React.createElement("div", { className: "field is-grouped" },
                        React.createElement("div", { className: "control" },
                            React.createElement("button", { className: "button is-primary", type: "submit" }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")),
                        React.createElement("div", { className: "control" },
                            React.createElement("button", { className: "button is-light", type: "button", onClick: handleReset }, "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C"))),
                    message && React.createElement("p", { className: "has-text-success" }, message))))));
}
