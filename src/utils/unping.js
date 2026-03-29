module.exports = (argument) => {
    const firstChar = argument.slice(0, 1);
    const remainingString = argument.slice(1);

    return firstChar + "\u{34F}" + remainingString;
};
