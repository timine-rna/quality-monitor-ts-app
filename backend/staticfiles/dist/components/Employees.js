import { buildEmployeeAnalytics, buildDailySeries, } from '../utils.js';
function useEmployeeChart(data) {
    const canvasRef = React.useRef(null);
    const chartRef = React.useRef(null);
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        if (!data.length) {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const config = {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [
                    {
                        label: 'Выработка (шт.)',
                        data: data.map(d => d.parts),
                        yAxisID: 'y1',
                        borderColor: '#3273dc',
                        borderWidth: 2,
                        pointRadius: 2,
                        tension: 0.2,
                    },
                    {
                        label: 'Дефекты (шт.)',
                        data: data.map(d => d.defects),
                        yAxisID: 'y2',
                        borderColor: '#ff3860',
                        borderWidth: 2,
                        pointRadius: 2,
                        tension: 0.2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y1: {
                        type: 'linear',
                        position: 'left',
                        ticks: { beginAtZero: true },
                        title: { display: true, text: 'Выработка' },
                    },
                    y2: {
                        type: 'linear',
                        position: 'right',
                        ticks: { beginAtZero: true },
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Дефекты' },
                    },
                },
                plugins: {
                    legend: { display: true },
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
    }, [data]);
    return canvasRef;
}
export function Employees({ rows, warnings, loading, onRefresh }) {
    const analytics = React.useMemo(() => buildEmployeeAnalytics(rows), [rows]);
    const [shiftFilter, setShiftFilter] = React.useState('all');
    const [employeeFilter, setEmployeeFilter] = React.useState('all');
    const shifts = React.useMemo(() => {
        const set = new Set();
        rows.forEach(row => {
            if (row.shift)
                set.add(row.shift);
        });
        return Array.from(set).sort();
    }, [rows]);
    const employees = React.useMemo(() => {
        const map = new Map();
        rows.forEach(row => {
            if (!map.has(row.id)) {
                map.set(row.id, row.name);
            }
        });
        return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [rows]);
    const filteredRows = React.useMemo(() => {
        return rows.filter(row => {
            if (shiftFilter !== 'all' && row.shift !== shiftFilter)
                return false;
            if (employeeFilter !== 'all' && row.id !== employeeFilter)
                return false;
            return true;
        });
    }, [rows, shiftFilter, employeeFilter]);
    const filteredAnalytics = React.useMemo(() => buildEmployeeAnalytics(filteredRows), [filteredRows]);
    const aggregatedEmployees = React.useMemo(() => {
        const groups = Object.values(filteredAnalytics.byEmployee);
        const entries = groups.map(group => {
            const totalParts = group.reduce((sum, row) => sum + row.parts_made, 0);
            const totalDefects = group.reduce((sum, row) => sum + row.defects, 0);
            const defectRate = totalParts > 0 ? (totalDefects / totalParts) * 100 : 0;
            const { id, name } = group[0];
            return { id, name, totalParts, totalDefects, defectRate };
        });
        return entries.sort((a, b) => b.totalParts - a.totalParts);
    }, [filteredAnalytics]);
    const chartData = React.useMemo(() => buildDailySeries(filteredAnalytics, shiftFilter, employeeFilter), [filteredAnalytics, shiftFilter, employeeFilter]);
    const canvasRef = useEmployeeChart(chartData);
    const totalEmployees = analytics.totalEmployees;
    const totalParts = analytics.totalParts;
    const defectRate = analytics.defectRate;
    return (React.createElement("section", { className: "section" },
        React.createElement("div", { className: "container" },
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "level is-align-items-center" },
                    React.createElement("div", { className: "level-left" },
                        React.createElement("div", null,
                            React.createElement("h2", { className: "title is-4 mb-1" }, "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u043E\u0432"),
                            React.createElement("p", { className: "has-text-grey" },
                                "\u0412\u0441\u0435\u0433\u043E \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u043E\u0432: ",
                                totalEmployees,
                                " \u00B7 \u041E\u0431\u0449\u0438\u0439 \u0432\u044B\u043F\u0443\u0441\u043A: ",
                                totalParts,
                                " \u0448\u0442. \u00B7 \u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0431\u0440\u0430\u043A: ",
                                defectRate.toFixed(1),
                                "%"))),
                    React.createElement("div", { className: "level-right" },
                        React.createElement("button", { className: `button is-link ${loading ? 'is-loading' : ''}`, type: "button", onClick: onRefresh }, "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435")))),
            warnings.length > 0 && (React.createElement("article", { className: "message is-warning" },
                React.createElement("div", { className: "message-header" },
                    React.createElement("p", null, "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438")),
                React.createElement("div", { className: "message-body" },
                    React.createElement("ul", null, warnings.map((warn, idx) => (React.createElement("li", { key: idx }, warn))))))),
            React.createElement("div", { className: "box" },
                React.createElement("div", { className: "columns is-variable is-4" },
                    React.createElement("div", { className: "column is-one-third" },
                        React.createElement("label", { className: "label is-small" }, "\u0421\u043C\u0435\u043D\u0430"),
                        React.createElement("div", { className: "select is-fullwidth" },
                            React.createElement("select", { value: shiftFilter, onChange: e => setShiftFilter(e.target.value) },
                                React.createElement("option", { value: "all" }, "\u0412\u0441\u0435 \u0441\u043C\u0435\u043D\u044B"),
                                shifts.map(shift => (React.createElement("option", { key: shift, value: shift }, shift)))))),
                    React.createElement("div", { className: "column is-two-thirds" },
                        React.createElement("label", { className: "label is-small" }, "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"),
                        React.createElement("div", { className: "select is-fullwidth" },
                            React.createElement("select", { value: employeeFilter, onChange: e => setEmployeeFilter(e.target.value) },
                                React.createElement("option", { value: "all" }, "\u0412\u0441\u0435 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438"),
                                employees.map(emp => (React.createElement("option", { key: emp.id, value: emp.id },
                                    emp.name,
                                    " (",
                                    emp.id,
                                    ")")))))))),
            React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-two-thirds" },
                    React.createElement("div", { className: "box" },
                        React.createElement("h3", { className: "title is-5" }, "\u0421\u0443\u0442\u043E\u0447\u043D\u044B\u0439 \u0432\u044B\u043F\u0443\u0441\u043A \u0438 \u0431\u0440\u0430\u043A"),
                        React.createElement("div", { style: { height: '320px' } }, chartData.length ? (React.createElement("canvas", { ref: canvasRef })) : (React.createElement("div", { className: "has-text-centered has-text-grey py-6" }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432"))))),
                React.createElement("div", { className: "column" },
                    React.createElement("div", { className: "box" },
                        React.createElement("h3", { className: "title is-6" }, "\u0422\u043E\u043F \u043F\u043E \u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0435"),
                        aggregatedEmployees.length === 0 && (React.createElement("p", { className: "has-text-grey" }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445")),
                        aggregatedEmployees.length > 0 && (React.createElement("ul", null, aggregatedEmployees.slice(0, 5).map(emp => (React.createElement("li", { key: emp.id, className: "mb-3" },
                            React.createElement("strong", null, emp.name),
                            " \u00B7 ",
                            emp.totalParts,
                            " \u0448\u0442.",
                            React.createElement("br", null),
                            React.createElement("span", { className: "is-size-7 has-text-grey" },
                                "\u0411\u0440\u0430\u043A: ",
                                emp.totalDefects,
                                " (",
                                emp.defectRate.toFixed(1),
                                "%)"))))))))),
            React.createElement("div", { className: "box" },
                React.createElement("h3", { className: "title is-5" }, "\u0417\u0430\u043F\u0438\u0441\u0438"),
                React.createElement("div", { className: "table-container" },
                    React.createElement("table", { className: "table is-striped is-hoverable is-fullwidth" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "\u0414\u0430\u0442\u0430"),
                                React.createElement("th", null, "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"),
                                React.createElement("th", null, "\u0421\u043C\u0435\u043D\u0430"),
                                React.createElement("th", { className: "has-text-right" }, "\u0412\u044B\u043F\u0443\u0441\u043A"),
                                React.createElement("th", { className: "has-text-right" }, "\u0411\u0440\u0430\u043A"),
                                React.createElement("th", null, "\u0421\u0442\u0430\u043D\u043E\u043A"),
                                React.createElement("th", null, "\u0414\u0435\u0442\u0430\u043B\u044C"))),
                        React.createElement("tbody", null,
                            filteredRows.map((row, idx) => (React.createElement("tr", { key: `${row.id}-${idx}` },
                                React.createElement("td", null, row.date),
                                React.createElement("td", null,
                                    React.createElement("strong", null, row.name),
                                    React.createElement("br", null),
                                    React.createElement("span", { className: "is-size-7 has-text-grey" }, row.id)),
                                React.createElement("td", null, row.shift || '—'),
                                React.createElement("td", { className: "has-text-right" }, row.parts_made),
                                React.createElement("td", { className: "has-text-right" }, row.defects),
                                React.createElement("td", null, row.machine || '—'),
                                React.createElement("td", null, row.detail || '—')))),
                            !filteredRows.length && (React.createElement("tr", null,
                                React.createElement("td", { colSpan: 7, className: "has-text-centered has-text-grey" }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F"))))))))));
}
