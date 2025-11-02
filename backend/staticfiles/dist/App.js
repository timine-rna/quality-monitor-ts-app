import { evaluateProcessRows, loadStoredThresholds, persistThresholds, analyseInventory, } from './utils.js';
import { Dashboard } from './components/Dashboard.js';
import { Employees } from './components/Employees.js';
import { Inventory } from './components/Inventory.js';
import { Settings } from './components/Settings.js';
import { Navbar } from './components/Navbar.js';
const TABS = [
    { key: 'dashboard', label: 'Дашборд', icon: 'fa-chart-line' },
    { key: 'employees', label: 'Работники', icon: 'fa-user-group' },
    { key: 'inventory', label: 'Склад', icon: 'fa-warehouse' },
    { key: 'settings', label: 'Настройки', icon: 'fa-sliders' },
];
function getManagerContext() {
    const root = document.getElementById('root');
    return {
        userName: (root === null || root === void 0 ? void 0 : root.dataset.userName) || 'Руководитель',
        role: (root === null || root === void 0 ? void 0 : root.dataset.role) || 'Руководитель',
        exportUrl: (root === null || root === void 0 ? void 0 : root.dataset.exportUrl) || '#',
        logoutFormId: (root === null || root === void 0 ? void 0 : root.dataset.logoutFormId) || 'logout-form',
    };
}
function getCsrfToken() {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
}
async function fetchJson(url, options) {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            ...(options && options.headers ? options.headers : {}),
        },
        ...options,
    });
    const text = await response.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        }
        catch (err) {
            console.error('Не удалось распарсить JSON', err);
            throw new Error('Некорректный ответ от сервера');
        }
    }
    if (!response.ok) {
        const message = data && data.error ? data.error : `Ошибка ${response.status}`;
        throw new Error(message);
    }
    return (data !== null && data !== void 0 ? data : {});
}
export function App() {
    const [context] = React.useState(() => getManagerContext());
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [thresholds, setThresholds] = React.useState(() => loadStoredThresholds());
    const [processRows, setProcessRows] = React.useState([]);
    const [processWarnings, setProcessWarnings] = React.useState([]);
    const [processAnalytics, setProcessAnalytics] = React.useState({
        rows: [],
        alerts: [],
        avgP: 0,
    });
    const [employeeRows, setEmployeeRows] = React.useState([]);
    const [employeeWarnings, setEmployeeWarnings] = React.useState([]);
    const [inventoryRows, setInventoryRows] = React.useState([]);
    const [inventoryAlerts, setInventoryAlerts] = React.useState([]);
    const [inventorySavingId, setInventorySavingId] = React.useState(null);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [successMessage, setSuccessMessage] = React.useState(null);
    React.useEffect(() => {
        const analytics = evaluateProcessRows(processRows, thresholds);
        setProcessAnalytics(analytics);
    }, [processRows, thresholds]);
    React.useEffect(() => {
        const analysis = analyseInventory(inventoryRows);
        setInventoryAlerts(analysis.alerts);
    }, [inventoryRows]);
    const loadAllData = React.useCallback(async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            const [processData, employeesData, inventoryData] = await Promise.all([
                fetchJson('/api/manager/process/'),
                fetchJson('/api/manager/employees/'),
                fetchJson('/api/manager/inventory/'),
            ]);
            setProcessRows(processData.rows || []);
            setProcessWarnings(processData.warnings || []);
            setEmployeeRows(employeesData.rows || []);
            setEmployeeWarnings(employeesData.warnings || []);
            setInventoryRows(inventoryData.rows || []);
        }
        catch (err) {
            console.error(err);
            setError((err === null || err === void 0 ? void 0 : err.message) || 'Не удалось загрузить данные');
        }
        finally {
            setIsInitialLoading(false);
            setIsRefreshing(false);
        }
    }, []);
    React.useEffect(() => {
        loadAllData();
    }, [loadAllData]);
    const combinedAlerts = React.useMemo(() => {
        const processLatest = processAnalytics.alerts.slice(-5);
        const inventoryLatest = inventoryAlerts.slice(-5);
        return [...processLatest, ...inventoryLatest];
    }, [processAnalytics.alerts, inventoryAlerts]);
    const latestTimestamp = React.useMemo(() => {
        var _a;
        return (_a = processAnalytics.latest) === null || _a === void 0 ? void 0 : _a.ts;
    }, [processAnalytics.latest]);
    const totalAlerts = React.useMemo(() => {
        const processCount = Array.isArray(processAnalytics.alerts) ? processAnalytics.alerts.length : 0;
        const inventoryCount = Array.isArray(inventoryAlerts) ? inventoryAlerts.length : 0;
        return processCount + inventoryCount;
    }, [processAnalytics.alerts, inventoryAlerts]);
    const totalWarnings = React.useMemo(() => {
        const processCount = Array.isArray(processWarnings) ? processWarnings.length : 0;
        const employeeCount = Array.isArray(employeeWarnings) ? employeeWarnings.length : 0;
        return processCount + employeeCount;
    }, [processWarnings, employeeWarnings]);
    function handleThresholdsChange(next) {
        setThresholds(next);
        persistThresholds(next);
        setSuccessMessage('Настройки порогов сохранены');
        setTimeout(() => setSuccessMessage(null), 2000);
    }
    function handleTabChange(tab) {
        setActiveTab(tab);
    }
    function handleLogout() {
        const formId = context.logoutFormId;
        const form = document.getElementById(formId);
        if (form) {
            form.submit();
        }
    }
    async function handleInventoryUpdate(id, draft) {
        setInventorySavingId(id);
        setError(null);
        try {
            const payload = {
                stock: draft.stock,
                defective_stock: draft.defective_stock,
                min_threshold: draft.min_threshold,
                location: draft.location,
                avg_daily_outflow: draft.avg_daily_outflow,
            };
            const response = await fetchJson(`/api/manager/inventory/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken() || '',
                },
                body: JSON.stringify(payload),
            });
            const updated = response.row;
            setInventoryRows(prev => prev.map(item => (item.id === updated.id ? { ...item, ...updated } : item)));
            setSuccessMessage(`Инструмент «${updated.tool_name}» обновлён.`);
            setTimeout(() => setSuccessMessage(null), 2000);
        }
        catch (err) {
            console.error(err);
            const message = (err === null || err === void 0 ? void 0 : err.message) || 'Не удалось обновить склад';
            setError(message);
            throw err;
        }
        finally {
            setInventorySavingId(null);
        }
    }
    const isLoading = isInitialLoading;
    const isBusy = isRefreshing;
    return (React.createElement("div", { className: "app-shell" },
        React.createElement(Navbar, { tabs: TABS, activeTab: activeTab, onTabChange: handleTabChange, onRefresh: loadAllData, isRefreshing: isBusy, onLogout: handleLogout, exportUrl: context.exportUrl, userName: context.userName, userRole: context.role, latestTimestamp: latestTimestamp, alertCount: totalAlerts, warningCount: totalWarnings }),
        React.createElement("main", { className: "app-content" },
            error && (React.createElement("article", { className: "message is-danger" },
                React.createElement("div", { className: "message-header" },
                    React.createElement("p", null, "\u041E\u0448\u0438\u0431\u043A\u0430")),
                React.createElement("div", { className: "message-body" }, error))),
            successMessage && (React.createElement("article", { className: "message is-success" },
                React.createElement("div", { className: "message-body" }, successMessage))),
            isLoading ? (React.createElement("div", { className: "box has-text-centered" },
                React.createElement("span", { className: "icon is-large mb-3" },
                    React.createElement("i", { className: "fas fa-spinner fa-spin fa-2x" })),
                React.createElement("p", null, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0434\u0430\u043D\u043D\u044B\u0435..."))) : (React.createElement(React.Fragment, null,
                activeTab === 'dashboard' && (React.createElement(Dashboard, { analytics: processAnalytics, thresholds: thresholds, warnings: processWarnings, alerts: combinedAlerts, loading: isBusy, onRefresh: loadAllData, latestTimestamp: latestTimestamp })),
                activeTab === 'employees' && (React.createElement(Employees, { rows: employeeRows, warnings: employeeWarnings, loading: isBusy, onRefresh: loadAllData })),
                activeTab === 'inventory' && (React.createElement(Inventory, { rows: inventoryRows, alerts: inventoryAlerts, loading: isBusy, savingId: inventorySavingId, onRefresh: loadAllData, onUpdate: handleInventoryUpdate })),
                activeTab === 'settings' && (React.createElement(Settings, { thresholds: thresholds, onThresholdsChange: handleThresholdsChange })))))));
}
