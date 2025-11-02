const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = '1234';
export function Login({ onSuccess }) {
    const [form, setForm] = React.useState({ username: '', password: '' });
    const [error, setError] = React.useState(null);
    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (form.username === DEMO_USERNAME && form.password === DEMO_PASSWORD) {
            sessionStorage.setItem('authRole', 'admin');
            setError(null);
            onSuccess('admin');
        }
        else {
            setError('Неверное имя пользователя или пароль');
        }
    }
    return (React.createElement("section", { className: "section" },
        React.createElement("div", { className: "container", style: { maxWidth: '420px' } },
            React.createElement("div", { className: "box" },
                React.createElement("h1", { className: "title is-4 has-text-centered" }, "\u0412\u0445\u043E\u0434 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0443 \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430"),
                React.createElement("form", { onSubmit: handleSubmit },
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F"),
                        React.createElement("div", { className: "control has-icons-left" },
                            React.createElement("input", { className: "input", name: "username", value: form.username, onChange: handleChange, placeholder: "admin", autoComplete: "username" }),
                            React.createElement("span", { className: "icon is-small is-left" },
                                React.createElement("i", { className: "fas fa-user" })))),
                    React.createElement("div", { className: "field" },
                        React.createElement("label", { className: "label" }, "\u041F\u0430\u0440\u043E\u043B\u044C"),
                        React.createElement("div", { className: "control has-icons-left" },
                            React.createElement("input", { className: "input", type: "password", name: "password", value: form.password, onChange: handleChange, placeholder: "1234", autoComplete: "current-password" }),
                            React.createElement("span", { className: "icon is-small is-left" },
                                React.createElement("i", { className: "fas fa-lock" })))),
                    error && React.createElement("p", { className: "has-text-danger" }, error),
                    React.createElement("div", { className: "field" },
                        React.createElement("button", { className: "button is-primary is-fullwidth", type: "submit" }, "\u0412\u043E\u0439\u0442\u0438"))),
                React.createElement("p", { className: "has-text-grey is-size-7 has-text-centered" },
                    "\u0414\u0435\u043C\u043E-\u0434\u043E\u0441\u0442\u0443\u043F: ",
                    React.createElement("strong", null, "admin / 1234"))))));
}
