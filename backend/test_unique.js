const arr = [4, 5, 6, 7, 4, 5, 8];

// Fix: Use '===' to keep only the first occurrence (remove duplicates)
// If you use '!==', you keep the duplicates.
const unique = arr.filter((item, index) => {
    return arr.indexOf(item) === index;
});

console.log("Original Array:", arr);
console.log("Unique Values (Duplicates Removed):", unique);
