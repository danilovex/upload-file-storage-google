# upload-file-storage-google
Upload de arquivos no storage do Google com NodeJS

##Configuration Google Cloud Platform###

Gere o arquivo file-key.json no console Google.
Clique em 'APIs and Services' >> 'Google Cloud Storage' >> botão 'Manager' >> no menu 'Credentials'

Importe o arquivo baixado na pasta 'services' desse projeto.
O arquivo 'services/index.js' contém a variável 'projectId' que deve ser trocado pelo projetoId da sua conta no console Google

##Setup##

npm install

##Start Aplication##

node app.js

access http://localhost:3000

