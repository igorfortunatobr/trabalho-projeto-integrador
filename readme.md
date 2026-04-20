# Autecno - Plataforma de Autoescola

O projeto consiste em desenvolver uma plataforma web simples para auxiliar alunos em processo de habilitação. O sistema permitirá que alunos assistam aulas teóricas de legislação, encontrem instrutores autônomos cadastrados na plataforma, realizem o agendamento de aulas práticas e façam treinamento da prova teórica no site.

## Diferenciais

O projeto foi dividido em dois sub-projetos: Frontend (Next.js) e Backend (Node.js/Fastify) e conta com containerização pronta.

## Tecnologias

### Frontend:
- **Next.js**: Interface web moderna construída com React e TypeScript.

### Backend:
- **Node.js**: Execução.
- **Fastify**: Framework eficiente e de alta performance.

### Banco de dados / Serviços
- **MySQL**: Armazenamento de dados do sistema.
- **Redis + BullMQ**: Mensageria (preparado).
- **Docker**: Containerização com Docker Compose.

---

## Como executar (Localmente)

Certifique-se de que possui o **Docker** e o **Docker Compose** instalados na sua máquina.

1. Faça uma cópia do arquivo de configuração de variáveis de ambiente:
   (No Linux/Mac) `cp .env.example .env` ou crie o `.env` copiando o conteúdo no Windows.
   
2. Execute o orquestrador para construir as imagens e iniciar os serviços:
   ```bash
   docker-compose up --build -d
   ```

3. Acesse:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3333/health

---

**GRUPO**:
- Igor Abreu Fortunato
- Pedro Henrique Santana Quintiliano
- Marcos Vinicius Paiva Carvalhar
