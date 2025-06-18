    // Banco de dados simplificado
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let items = JSON.parse(localStorage.getItem('items')) || [];
        let currentUser = null;

        // Elementos DOM
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const crudScreen = document.getElementById('crudScreen');
        const recoveryScreen = document.getElementById('recoveryScreen');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const itemForm = document.getElementById('itemForm');
        const recoveryForm = document.getElementById('recoveryForm');
        const loginMessage = document.getElementById('loginMessage');
        const registerMessage = document.getElementById('registerMessage');
        const crudMessage = document.getElementById('crudMessage');
        const recoveryMessage = document.getElementById('recoveryMessage');
        const itemsBody = document.getElementById('itemsBody');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');
        
        // Toggle de visibilidade de senha
        document.getElementById('toggleLoginPassword').addEventListener('click', function() {
            togglePasswordVisibility('loginSenha', this.querySelector('i'));
        });
        
        document.getElementById('toggleRegPassword').addEventListener('click', function() {
            togglePasswordVisibility('regSenha', this.querySelector('i'));
        });
        
        function togglePasswordVisibility(inputId, icon) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        }
        
        // Alternar entre telas
        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
        }
        
        function showRecovery() {
            showScreen('recoveryScreen');
        }
        
        // Mostrar mensagem
        function showMessage(element, message, type) {
            element.textContent = message;
            element.className = `message ${type}`;
            setTimeout(() => {
                element.textContent = '';
                element.className = 'message';
            }, 5000);
        }
        
        // Login
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const senha = document.getElementById('loginSenha').value;
            
            const user = users.find(u => u.email === email && u.senha === senha);
            
            if (user) {
                currentUser = user;
                updateUserInfo();
                showScreen('crudScreen');
                showMessage(loginMessage, 'Login realizado com sucesso!', 'success');
            } else {
                showMessage(loginMessage, 'E-mail ou senha incorretos!', 'error');
            }
        });
        
        // Cadastro
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nome = document.getElementById('regNome').value.trim();
            const email = document.getElementById('regEmail').value.trim().toLowerCase();
            const senha = document.getElementById('regSenha').value;
            const tipo = document.getElementById('regTipo').value;
            
            // Validações
            if (!nome || nome.length < 3) {
                showMessage(registerMessage, 'Nome deve ter pelo menos 3 caracteres!', 'error');
                return;
            }
            
            if (!email.includes('@') || !email.includes('.')) {
                showMessage(registerMessage, 'Por favor, insira um e-mail válido!', 'error');
                return;
            }
            
            if (senha.length < 6) {
                showMessage(registerMessage, 'A senha deve ter pelo menos 6 caracteres!', 'error');
                return;
            }
            
            if (!tipo) {
                showMessage(registerMessage, 'Selecione um tipo de usuário!', 'error');
                return;
            }
            
            if (users.some(u => u.email === email)) {
                showMessage(registerMessage, 'Este e-mail já está cadastrado!', 'error');
                return;
            }
            
            // Criar novo usuário
            const newUser = { 
                id: Date.now(),
                nome, 
                email, 
                senha, 
                tipo,
                dataCadastro: new Date().toLocaleDateString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showMessage(registerMessage, 'Cadastro realizado com sucesso! Redirecionando...', 'success');
            
            setTimeout(() => {
                currentUser = newUser;
                updateUserInfo();
                showScreen('crudScreen');
            }, 1500);
        });
        
        // Recuperação de senha
        recoveryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('recoveryEmail').value.trim().toLowerCase();
            
            if (users.some(u => u.email === email)) {
                showMessage(recoveryMessage, 'Um e-mail de recuperação foi enviado para sua caixa postal!', 'success');
                setTimeout(() => {
                    showScreen('loginScreen');
                }, 3000);
            } else {
                showMessage(recoveryMessage, 'Este e-mail não está cadastrado em nosso sistema!', 'error');
            }
        });
        
        // Atualizar informações do usuário
        function updateUserInfo() {
            if (currentUser) {
                userName.textContent = currentUser.nome;
                userEmail.textContent = currentUser.email;
                userAvatar.textContent = currentUser.nome.charAt(0).toUpperCase();
                renderItems();
            }
        }
        
        // Renderizar itens
        function renderItems() {
            itemsBody.innerHTML = '';
            
            const userItems = items.filter(item => item.userId === currentUser.id);
            
            if (userItems.length === 0) {
                itemsBody.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Nenhuma tarefa encontrada. Adicione sua primeira tarefa!</p>
                    </div>
                `;
                return;
            }
            
            userItems.forEach(item => {
                const categoryClass = item.categoria + '-tag';
                const itemElement = document.createElement('div');
                itemElement.className = 'item-row';
                itemElement.innerHTML = `
                    <div>
                        <strong>${item.nome}</strong>
                        <div class="category-tag ${categoryClass}">
                            ${getCategoryIcon(item.categoria)} ${formatCategory(item.categoria)}
                        </div>
                    </div>
                    <div>${item.descricao}</div>
                    <div class="item-actions">
                        <button class="action-btn edit-btn" onclick="editItem(${item.id})"><i class="fas fa-edit"></i> Editar</button>
                        <button class="action-btn delete-btn" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i> Excluir</button>
                    </div>
                `;
                itemsBody.appendChild(itemElement);
            });
        }
        
        // Obter ícone da categoria
        function getCategoryIcon(category) {
            const icons = {
                'trabalho': 'fas fa-briefcase',
                'pessoal': 'fas fa-user',
                'estudos': 'fas fa-graduation-cap',
                'outros': 'fas fa-star'
            };
            return `<i class="${icons[category] || 'fas fa-tag'}"></i>`;
        }
        
        // Formatar categoria para exibição
        function formatCategory(category) {
            const categories = {
                'trabalho': 'Trabalho',
                'pessoal': 'Pessoal',
                'estudos': 'Estudos',
                'outros': 'Outros'
            };
            return categories[category] || category;
        }
        
        // Adicionar/Editar item
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('itemId').value;
            const nome = document.getElementById('itemNome').value.trim();
            const descricao = document.getElementById('itemDescricao').value.trim();
            const categoria = document.getElementById('itemCategoria').value;
            
            if (!nome || nome.length < 2) {
                showMessage(crudMessage, 'Nome da tarefa deve ter pelo menos 2 caracteres!', 'error');
                return;
            }
            
            if (!descricao) {
                showMessage(crudMessage, 'A descrição é obrigatória!', 'error');
                return;
            }
            
            if (!categoria) {
                showMessage(crudMessage, 'Selecione uma categoria!', 'error');
                return;
            }
            
            if (id) {
                // Editar item existente
                const index = items.findIndex(item => item.id == id);
                if (index !== -1) {
                    items[index] = { 
                        ...items[index], 
                        nome, 
                        descricao, 
                        categoria
                    };
                    showMessage(crudMessage, 'Tarefa atualizada com sucesso!', 'success');
                }
            } else {
                // Adicionar novo item
                const newItem = {
                    id: Date.now(),
                    nome,
                    descricao,
                    categoria,
                    userId: currentUser.id,
                    dataCriacao: new Date().toLocaleDateString()
                };
                items.push(newItem);
                showMessage(crudMessage, 'Tarefa adicionada com sucesso!', 'success');
            }
            
            localStorage.setItem('items', JSON.stringify(items));
            document.getElementById('itemForm').reset();
            document.getElementById('itemId').value = '';
            document.getElementById('saveButton').textContent = 'Adicionar Tarefa';
            renderItems();
        });
        
        // Editar item
        function editItem(itemId) {
            const item = items.find(item => item.id == itemId);
            if (item) {
                document.getElementById('itemId').value = item.id;
                document.getElementById('itemNome').value = item.nome;
                document.getElementById('itemDescricao').value = item.descricao;
                document.getElementById('itemCategoria').value = item.categoria;
                document.getElementById('saveButton').textContent = 'Atualizar Tarefa';
                showMessage(crudMessage, 'Editando tarefa...', 'success');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        
        // Excluir item
        function deleteItem(itemId) {
            if (confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
                items = items.filter(item => item.id != itemId);
                localStorage.setItem('items', JSON.stringify(items));
                renderItems();
                showMessage(crudMessage, 'Tarefa excluída com sucesso!', 'success');
            }
        }
        
        // Logout
        function logout() {
            currentUser = null;
            showScreen('loginScreen');
            showMessage(loginMessage, 'Você saiu do sistema com sucesso!', 'success');
            document.getElementById('loginForm').reset();
        }
        
        // Inicialização
        window.onload = function() {
            // Adicionar usuário admin de exemplo se não existir
            if (!users.some(u => u.email === 'admin@exemplo.com')) {
                users.push({
                    id: 1,
                    nome: "Administrador",
                    email: "admin@exemplo.com",
                    senha: "admin123",
                    tipo: "admin",
                    dataCadastro: new Date().toLocaleDateString()
                });
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Adicionar itens de exemplo se não existirem
            if (items.length === 0) {
                items.push(
                    {
                        id: 1,
                        nome: "Reunião com equipe",
                        descricao: "Reunião semanal para planejamento de projetos",
                        categoria: "trabalho",
                        userId: 1,
                        dataCriacao: new Date().toLocaleDateString()
                    },
                    {
                        id: 2,
                        nome: "Estudar JavaScript",
                        descricao: "Completar módulo de funções avançadas",
                        categoria: "estudos",
                        userId: 1,
                        dataCriacao: new Date().toLocaleDateString()
                    },
                    {
                        id: 3,
                        nome: "Comprar presentes",
                        descricao: "Presentes para aniversário da família",
                        categoria: "pessoal",
                        userId: 1,
                        dataCriacao: new Date().toLocaleDateString()
                    }
                );
                localStorage.setItem('items', JSON.stringify(items));
            }
        };