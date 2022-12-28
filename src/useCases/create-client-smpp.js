class CreateClientSmpp {
    constructor(smppService){
        this.smppService = smppService;
    };

    async execute(){
        const session = new Promise((res, rej) => {
            const createConn = this.smppService.connect({
                url: 'smpp://localhost:2775',
                debug: false
            }, function(){
                createConn.bind_transceiver({
                    system_id: 'vasco',
                    password: '1234'
                }, function(pdu) {
                    if(pdu.command_status === 0) {
                        console.log('Conexao com smpp faker estabelecida com sucesso!');
                    }
                });
            });

            res(createConn);
        });

        return session;
    }
}

module.exports = CreateClientSmpp;