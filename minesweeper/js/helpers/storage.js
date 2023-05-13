const set = (name, value) => localStorage.setItem(name, value);

const get = (name) => localStorage.getItem(name);

export { get, set };