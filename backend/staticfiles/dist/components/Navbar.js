function formatTimestamp(value) {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('ru-RU', {
        hour12: false,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
export function Navbar({ tabs, activeTab, onTabChange, onRefresh, isRefreshing, onLogout, exportUrl, userName, userRole, latestTimestamp, alertCount, warningCount, }) {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const formattedTimestamp = React.useMemo(() => formatTimestamp(latestTimestamp), [latestTimestamp]);
    const hasAlerts = alertCount > 0;
    const hasWarnings = warningCount > 0;
    function handleTabClick(key) {
        onTabChange(key);
        setMenuOpen(false);
    }
    function handleRefresh() {
        setMenuOpen(false);
        onRefresh();
    }
    function handleLogoutClick() {
        setMenuOpen(false);
        onLogout();
    }
    return (React.createElement("nav", { className: "app-navbar", role: "navigation", "aria-label": "\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F" },
        React.createElement("div", { className: "app-navbar__inner" },
            React.createElement("div", { className: "app-navbar__brand" },
                React.createElement("span", { className: "app-navbar__title" }, "\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430"),
                React.createElement("div", { className: "app-navbar__meta" },
                    formattedTimestamp && (React.createElement("span", { className: "app-navbar__meta-item" },
                        React.createElement("i", { className: "fas fa-clock", "aria-hidden": "true" }),
                        " \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ",
                        formattedTimestamp)),
                    React.createElement("span", { className: `app-navbar__status-pill ${hasAlerts ? 'is-critical' : ''}`, "aria-live": "polite" },
                        React.createElement("i", { className: "fas fa-bell", "aria-hidden": "true" }),
                        " \u0421\u043E\u0431\u044B\u0442\u0438\u044F: ",
                        alertCount),
                    hasWarnings && (React.createElement("span", { className: "app-navbar__status-pill is-warning" },
                        React.createElement("i", { className: "fas fa-triangle-exclamation", "aria-hidden": "true" }),
                        " \u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F: ",
                        warningCount)))),
            React.createElement("button", { className: `app-navbar__toggle ${menuOpen ? 'is-active' : ''}`, type: "button", "aria-label": "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0435\u043D\u044E", "aria-expanded": menuOpen ? 'true' : 'false', onClick: () => setMenuOpen(open => !open) },
                React.createElement("span", null),
                React.createElement("span", null),
                React.createElement("span", null)),
            React.createElement("div", { className: `app-navbar__menu ${menuOpen ? 'is-open' : ''}` },
                React.createElement("div", { className: "app-navbar__tabs" }, tabs.map(tab => (React.createElement("button", { key: tab.key, type: "button", className: `app-navbar__tab ${tab.key === activeTab ? 'is-active' : ''}`, onClick: () => handleTabClick(tab.key), "aria-pressed": tab.key === activeTab ? 'true' : 'false' },
                    tab.icon && (React.createElement("span", { className: "app-navbar__tab-icon" },
                        React.createElement("i", { className: `fas ${tab.icon}`, "aria-hidden": "true" }))),
                    React.createElement("span", null, tab.label))))),
                React.createElement("div", { className: "app-navbar__actions" },
                    React.createElement("button", { className: `button is-link is-light is-small ${isRefreshing ? 'is-loading' : ''}`, type: "button", onClick: handleRefresh },
                        React.createElement("span", { className: "icon is-small" },
                            React.createElement("i", { className: "fas fa-rotate-right", "aria-hidden": "true" })),
                        React.createElement("span", null, "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C")),
                    React.createElement("a", { className: "button is-info is-light is-small", href: exportUrl },
                        React.createElement("span", { className: "icon is-small" },
                            React.createElement("i", { className: "fas fa-file-excel", "aria-hidden": "true" })),
                        React.createElement("span", null, "\u042D\u043A\u0441\u043F\u043E\u0440\u0442")),
                    React.createElement("div", { className: "app-navbar__user" },
                        React.createElement("div", { className: "app-navbar__user-meta" },
                            React.createElement("span", { className: "app-navbar__user-name" }, userName),
                            React.createElement("span", { className: "app-navbar__user-role" }, userRole)),
                        React.createElement("button", { className: "app-navbar__logout", type: "button", onClick: handleLogoutClick }, "\u0412\u044B\u0445\u043E\u0434")))))));
}
