export const getRandomInt = (max) => {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - 0 + 1)) + 0;
}