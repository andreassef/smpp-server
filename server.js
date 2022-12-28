const smpp = require('smpp');

class SmppFakeServer {
    create(sessionType) {
        const server = smpp.createServer({
            debug: false
        }, (session) => {
            session.on('error', function (err) {
                // Something ocurred, not listening for this event will terminate the program
                console.log('Ocorrou algum erro: ', err);
            });
            const connectionSmppFake = this.connectWithServerSmppAndSendMsg();
            /*connectionSmppFake.on('deliver_sm', pdu => {
                console.log('[ connectWithServerSmppAndSendMsg ] - Recebendo deliver_sm: ', pdu);
            })*/

            session.on('bind_transmitter', function(pdu) {
                if(pdu.command_status === 0) console.log('bind_transmitter conectado com sucesso!');

                session.on('submit_sm', pdu => {
                    console.log('Chegou o PDU: ', pdu.destination_addr);

                    connectionSmppFake.submit_sm({
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

                    //this.connectWithServerSmppAndSendMsg(pdu.destination_addr, pdu.short_message.message);
                })

                session.send(pdu.response());
                session.resume();
            })

            session.on('bind_receiver', function(pdu) {
                if(pdu.command_status === 0) console.log('bind_receiver conectado com sucesso!');

                connectionSmppFake.on('deliver_sm', function(pdu) {
                    console.log('[ connectWithServerSmppAndSendMsg ] - Recebendo deliver_sm: ', pdu);
                    session.send(pdu);
                });

                session.send(pdu.response());
                session.resume();
            })

            session.on('bind_transceiver', function(pdu) {
                // we pause the session to prevent further incoming pdu events,
                // untill we authorize the session with some async operation.
                if(sessionType === 'transmitter') {
                    session.on('submit_sm', pdu => {
                        connectionSmppFake.submit_sm({
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

                    connectionSmppFake.on('deliver_sm', function(pdu) {
                        console.log('[ connectWithServerSmppAndSendMsg ] - Recebendo deliver_sm: ', pdu);
                    })
                }
                session.send(pdu.response());
                session.resume();
            });
        });
        console.log('Server started!');
        return server;
    }

    connectWithServerSmppAndSendMsg(){
        const session = smpp.connect({
            url: 'smpp://localhost:2775',
            debug: false
        }, function(){
            session.bind_transceiver({
                system_id: 'vasco',
		        password: '1234'
            }, function(pdu) {
                if(pdu.command_status === 0) {
                    console.log('Conexao com smpp faker estabelecida com sucesso!');
                }
            });
        })

        return session;
    }
}

module.exports = SmppFakeServer