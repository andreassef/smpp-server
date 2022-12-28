const smpp = require('smpp');
const CreateClientSmpp = require('./useCases/create-client-smpp');
const CreateServerSmpp = require('./useCases/create-server-smpp');

class App {
    async execute(portNumber) {
        const createClientSmpp = new CreateClientSmpp(smpp);
        const clientSMpp = await createClientSmpp.execute();
        //console.log(clientSMpp);
        const createServerSmpp = new CreateServerSmpp(smpp, clientSMpp);
        const server = await createServerSmpp.execute();
        server.listen(portNumber);
        console.log('Server listen on port: ', portNumber);
    }
}

const app = new App();
app.execute(3000);