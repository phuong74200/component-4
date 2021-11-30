const Session = function (sessionName) {
    if (!localStorage.getItem(sessionName)) {
        localStorage.setItem(sessionName, JSON.stringify({}));
    }

    const getSession = () => {
        return JSON.parse(localStorage.getItem(sessionName));
    }

    const saveSession = (key, data) => {
        localStorage.setItem(sessionName, JSON.stringify({
            ...getSession(),
            [key]: data
        }));
    }

    return (name, data, replace = false) => {
        let current = getSession()[name];

        if ((data && replace) || !current) saveSession(name, data);

        return {
            put: (data) => {
                current = data;
                saveSession(name, {
                    ...getSession()[name],
                    ...data
                });
            },
            set: (data) => {
                current = data;
                saveSession(name, data);
            },
            get: () => {
                return current;
            },
            size: () => {
                return JSON.stringify(getSession()[name]).length * 2 / 1024;
            },
        }
    };
}

const useSession = new Session('useSession');


let keyBoard = useSession('key-board', { x: 1, y: 1 });
let mouse = useSession('mouse', { x: 2, y: 2 });
let moniter = useSession('moniter', { x: 3, y: 12 });