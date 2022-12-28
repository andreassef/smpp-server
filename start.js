const SmppFakeServer = require('./server');
const serverOne = new SmppFakeServer();
serverOne.create('transmitter').listen(3000);

