# Unifaat :: Devweb :: Aula 13 - TF

## Instalação e Execução

### Siga os passos abaixo para rodar o projeto via Docker:

1. Clonar o repositório:

   ```sh
   git clone https://github.com/luan-tavares/unifaat-devweb-aula14-tf
   ```

2. Entrar na pasta do projeto:

   ```sh
   cd unifaat-devweb-aula14-tf
   ```

3. Criar o arquivo `.env` na raiz do projeto copiando o .env.example:

   > No windows:

   ```ini
   copy .env.example .env
   ```

   > No linux

   ```ini
   cp .env.example .env
   ```
4. Abrir o arquivo .env recém criado e preencher os campos abaixo:

```sh
POSTGRES_USER=meu_usuario
POSTGRES_PASSWORD=minha_senha
JWT_SECRET=super_secreta
```

5. Subir a aplicação com Docker Compose:


   ```sh
   docker-compose up --build
   ```

   > - Usuários com **Docker moderno** devem usar:

   ```sh
   docker compose up --build
   ```

6. Executar as migrations utilizando UM desses comandos:

     > - Container:
    ```sh
   docker-compose run --rm cli-container migrate
   ```
     > - Container: Usuários com **Docker moderno** devem usar:

   ```sh
   docker compose run --rm cli-container migrate
   ```

    > - Node no host:

   ```sh
   node command migrate
   ```


7. Executar as seeds utilizando UM desses comandos:

      > - Container:
    ```sh
   docker-compose run --rm cli-container seed
   ```

     > - Container: Usuários com **Docker moderno** devem usar:

   ```sh
   docker compose run --rm cli-container seed
   ```

     > - Host:

   ```sh
   node command seed
   ```

O servidor estará disponível em: [http://localhost:8080](http://localhost:8080)

Documentação api: [http://localhost:8080/docs](http://localhost:8080/docs)

Observação: ./Insomnia.yml DEVE utilizado no insomnia

| Biblioteca           | Finalidade                                                                 |
| -------------------- | -------------------------------------------------------------------------- |
| `express`            | Framework web para Node.js usado para criar APIs e servidores HTTP.        |
| `chalk`              | Biblioteca para estilizar saídas no terminal com cores e ênfases.          |
| `dotenv`             | Carrega variáveis de ambiente de um arquivo `.env` para `process.env`.     |
| `pg`                 | Cliente PostgreSQL para Node.js, usado para conexão e execução de queries. |
| `sequelize`          | ORM (Object-Relational Mapping) para trabalhar com bancos relacionais.     |
| `jsonwebtoken`       | Geração e verificação de tokens JWT para autenticação.                     |
| `bcrypt`             | Criptografia e comparação de senhas com hash seguro.                       |
| `swagger-jsdoc`      | Gera especificações Swagger a partir de JSDoc nos comentários do código.   |
| `swagger-ui-express` | Middleware que serve a UI do Swagger para documentar e testar APIs.        |
| `express-fileupload` | Middleware para lidar com upload de arquivos via `multipart/form-data`.    |
| `minimist`           | Faz o parsing de argumentos de linha de comando.                           |
| `cli-table3`         | Cria tabelas formatadas para exibição no terminal.                         |
| `axios`              | Client de requisições http.                                                |
