module.exports = (Name, Login) => {
    if (Name.toLowerCase() == Login.toLowerCase()) return Name;
    return Login;
};