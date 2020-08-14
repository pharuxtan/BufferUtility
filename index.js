console.time(0);
arr = [1, 2, 3];
for(let i in arr){
  arr[i] = arr[i]*2
}
console.timeLog(0);
console.time(1);
arr = [1, 2, 3];
arr.forEach((value, index) => {
  arr[index] = value*2;
});
console.timeLog(1);
console.time(2);
arr = [1, 2, 3];
arr = arr.map((value) => {
  return value*2;
});
console.timeLog(2);