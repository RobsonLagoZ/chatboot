require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração do Body-parser para processar requisições POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal (ponto de entrada para o Webhook)
app.post('/webhook', async (req, res) => {
    const message = req.body;

    console.log('Mensagem recebida:', message);
    
    if (message?.text) {
        try {
            if (message.text.toLowerCase() === 'menu') {
                // Enviar os botões interativos
                await sendInteractiveButtons(message.from);
            } else {
                await sendMessage(message.from, `Você disse: ${message.text}. Envie "menu" para ver as opções.`);
            }

            res.status(200).send('Mensagem recebida e processada');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            res.status(500).send('Erro ao processar a mensagem');
        }
    } else {
        res.status(200).send('Nenhuma mensagem para processar');
    }
});

// Função para enviar uma mensagem de texto simples
const sendMessage = async (phoneNumber, text) => {
    try {
        const url = `${process.env.CHAT_API_URL}/sendMessage`;
        const response = await axios.post(url, {
            chatId: `${phoneNumber}@c.us`,
            body: text
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.CHAT_API_TOKEN}`
            }
        });

        console.log('Mensagem enviada:', response.data);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
    }
}

// Função para enviar botões interativos
const sendInteractiveButtons = async (phoneNumber) => {
    try {
        const url = `${process.env.CHAT_API_URL}/sendButtons`;
        const response = await axios.post(url, {
            chatId: `${phoneNumber}@c.us`,
            body: 'Escolha uma das opções abaixo:',
            buttons: [
                { id: 'pagamento', text: '💰 Pagamento' },
                { id: 'matricula', text: '📘 Matrícula' },
                { id: 'uniforme', text: '👕 Uniforme' },
                { id: 'suporte', text: '🛠️ Suporte' },
                { id: 'mensagem_padrao', text: '✉️ Mensagem Padrão' },
                { id: 'cancelamento', text: '❌ Cancelamento' }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.CHAT_API_TOKEN}`
            }
        });

        console.log('Botões interativos enviados:', response.data);
    } catch (error) {
        console.error('Erro ao enviar botões interativos:', error.response?.data || error.message);
    }
}

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
