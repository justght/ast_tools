
outer: for (let i = 0; i < 3; i++) {
    console.log('i:',i);
    for (let j = 0; j < 3; j++) {
        console.log('j:',j);
        if (j === 1) continue outer; // 跳到 outer for 的下一轮
        if (j === 2) break outer;    // 直接退出整个 outer for
        console.log(i, j);
    }
}


// let x = 1;

// switch (x) {
//   case 1:
//     console.log("one");
//     // break; // 跳出switch
//   case 2:
//     console.log("two");
//     break; // 跳出switch
//   default:
//     console.log("other");
// }
// console.log("done");

