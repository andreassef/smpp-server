class CreateServerSmpp {
    constructor(smppService, clientSmpp){
        this.smppService = smppService;
        this.clientSmpp = clientSmpp;
        this.session = null;
    }

    execute() {
        this.session = this.smppService.createServer({
            debug: false
        }, (session) => {
            session.on('error', (err) => {
                console.log('Ocorrou algum erro: ', err);
            });
    
            session.on('bind_transceiver', (pdu) => {
                session.on('submit_sm', pdu => {
                    this.clientSmpp.submit_sm({
                        destination_addr: pdu.destination_addr,
                        short_message: pdu.short_message.message,
                        registered_delivery: 17,
                        data_coding: 0x08,
                    }, function(pdu) {
                        if (pdu.command_status === 0) {
                            // Message successfully sent
                            console.log('Message sent sucessfully - id: ', pdu.message_id);
                        }
                    });
                })
    
                this.clientSmpp.on('deliver_sm', function(pdu) {
                    console.log('[ connectWithServerSmppAndSendMsg ] - Recebendo deliver_sm: ', pdu);
                    session.send(pdu);
                })
                session.send(pdu.response());
            });
    
            session.on('bind_transmitter', function(pdu) {
                if(pdu.command_status === 0) console.log('bind_transmitter conectado com sucesso!');
    
                session.on('submit_sm', pdu => {
                    console.log('Chegou o PDU: ', pdu.destination_addr);
    
                    this.clientSmpp.submit_sm({
                        destination_addr: pdu.destination_addr,
                        short_message: pdu.short_message.message,
                        registered_delivery: 17,
                        data_coding: 0x08,
                    }, function(pdu) {
                        if (pdu.command_status === 0) {
                            // Message successfully sent
                            console.log('Message sent sucessfully - id: ', pdu.message_id);
                        }
                    });
                });
    
                session.send(pdu.response());
            })
    
            session.on('bind_receiver', function(pdu) {
                if(pdu.command_status === 0) console.log('bind_receiver conectado com sucesso!');
    
                this.clientSmpp.on('deliver_sm', pdu => {
                    console.log('[ connectWithServerSmppAndSendMsg ] - Recebendo deliver_sm: ', pdu);
                    this.session.send(pdu);
                });
    
                session.send(pdu.response());
            });
        });

        

        return this.session;
    }
}

module.exports = CreateServerSmpp;