const arr = [4, 5, 6, 7, 4, 5, 8];

const duplicates = arr.filter((item, index) => {
    return arr.indexOf(item) !== index;
});
console.log(duplicates);
