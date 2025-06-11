import axios from "axios";
import CliTable3 from "cli-table3";

export default {
    name: 'get-alunos',
    description: 'obter alunos',
    arguments: {
        seconds: "number",
    },

    handle: async function () {
        /**
         * No ./docker-compose.yml, nas linhas 55/56, dei o nome "web_host" para o host do container nginx.
         * Se você rodar o cli fora da rede do docker, você pode usar "localhost:8080" para acessar o nginx.
         * Caso contrário, voce deve chamar o nginx pelo nome do host do container na porta 80
         */
        const host = (process.env.IS_CONTAINER) ? "web_host:80" : "localhost:8080";

        /**
         * URLSearchParams é usado para gerenciar o request body dados no formato x-www-form-urlencoded.
         */
        const data = new URLSearchParams();
        data.append('email', 'user1@example.com');
        data.append('senha', '123456');

        try {
            // Primeira etapa é fazer o login com o endpoint /login para obter o token JWT
            const loginResponse = await axios.post(`http://${host}/login`, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const tokenData = loginResponse.data;
            console.log('Token obtido:', tokenData.token);

            // Criar a tabela com cli-table3
            const table = new CliTable3({
                head: ['Nome', 'Matérias'],
                colWidths: [30, 50]  // Aumentei as larguras para melhor visualização
            });

            // Variáveis para paginação
            let offset = 0;
            const limit = 10;
            let hasMoreData = true;

            // Loop para buscar todos os alunos usando paginação
            while (hasMoreData) {
                try {
                    const response = await axios.get(`http://${host}/api/alunos`, {
                        headers: {
                            'Authorization': `Bearer ${tokenData.token}`
                        },
                        params: {
                            limit,
                            offset
                        }
                    });

                    const { rows, next } = response.data;

                    // Adicionar cada aluno na tabela
                    rows.forEach(aluno => {
                        const materias = aluno.materias
                            .map(materia => materia.nome)
                            .join(',\n');  // Quebra de linha entre as matérias
                        
                        table.push([aluno.nome, materias]);
                    });

                    // Verificar se há mais dados para buscar
                    if (next === null) {
                        hasMoreData = false;
                    } else {
                        offset = next;
                    }

                } catch (error) {
                    console.error('Erro ao buscar alunos:', error.response?.data || error.message);
                    hasMoreData = false;
                }
            }

            // Exibir a tabela final
            console.log('\nLista de Alunos e suas Matérias:');
            console.log(table.toString());

        } catch (error) {
            console.error('Erro na autenticação:', error.response?.data || error.message);
            return;
        }
    }
}