const {indexLogic} = require('../src/index');
let count = 0;

indexLogic().then(() => {
    count++;

    setInterval(() => {
        console.log('running index route', count);
        indexLogic();
    }, 1000 * 30);
});
