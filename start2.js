const SmppFakeServer = require('./server');

const serverTwo = new SmppFakeServer();
serverTwo.create().listen(3001);