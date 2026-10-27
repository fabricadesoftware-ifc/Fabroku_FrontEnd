<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <div class="rules-page">
    <main class="rules-wrap rules-body">
      <h1 class="rules-title">Regras de uso</h1>

      <p class="rules-lead">
        Ao fazer deploy no Fabroku, você concorda com estas regras. Última atualização: {{ lastUpdated }}.
      </p>

      <section v-for="(section, index) in sections" :key="section.title" class="rules-section">
        <h2>{{ index + 1 }}. {{ section.title }}</h2>

        <p v-if="section.intro">{{ section.intro }}</p>

        <ul>
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
      </section>
    </main>

    <footer class="rules-footer">
      <div class="rules-wrap">Fabroku · Fábrica de Software · IFC</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  interface RulesSection {
    title: string
    intro?: string
    items: string[]
  }

  const lastUpdated = '27/10/2026'

  const sections: RulesSection[] = [
    {
      title: 'Quem pode usar',
      items: [
        'Estudantes com e-mail @estudantes.ifc.edu.br verificado na conta do GitHub.',
        'Professores e servidores com e-mail autorizado pela administração.',
        'A conta é pessoal: não compartilhe seu acesso nem tokens da CLI.',
      ],
    },
    {
      title: 'Finalidade',
      items: [
        'O Fabroku é para projetos acadêmicos, de aprendizado e da Fábrica de Software do IFC.',
        'Não é permitido usar a plataforma para fins comerciais ou para hospedar serviços de terceiros.',
      ],
    },
    {
      title: 'Limites de recursos',
      items: [
        'Estudantes: até 3 apps e 2 serviços (bancos de dados).',
        'Membros da Fábrica de Software: até 5 apps e 3 serviços.',
        'A administração pode ajustar esses limites caso a caso.',
        'Não tente contornar os limites (por exemplo, criando contas ou apps só para ganhar mais recursos).',
        'Remova apps e serviços que você não usa mais: os recursos do servidor são compartilhados.',
      ],
    },
    {
      title: 'É proibido',
      items: [
        'Mineração de criptomoedas ou qualquer uso que consuma recursos sem relação com o projeto.',
        'Envio de spam, phishing, malware ou qualquer conteúdo ilegal, incluindo pirataria.',
        'Varreduras, ataques ou testes de invasão contra a plataforma, outros apps ou sistemas externos sem autorização.',
        'Acessar ou tentar acessar apps, bancos de dados ou dados de outros usuários.',
        'Publicar senhas, chaves ou tokens no repositório: use as variáveis de ambiente do app.',
      ],
    },
    {
      title: 'Dados pessoais',
      items: [
        'Colete apenas os dados pessoais necessários para o projeto, conforme a LGPD.',
        'Não armazene dados sensíveis (saúde, documentos, dados bancários) de pessoas reais.',
        'Em testes e demonstrações, prefira dados fictícios.',
      ],
    },
    {
      title: 'Disponibilidade e backup',
      items: [
        'A plataforma não garante disponibilidade contínua: apps podem ser reiniciados ou ficar fora do ar em manutenções.',
        'Você é responsável pelo seu código e pelos seus dados. Faça backups do banco com a exportação (dumpdata) da plataforma.',
        'Apps e serviços removidos podem não ser recuperáveis.',
      ],
    },
    {
      title: 'Registro de atividades',
      items: [
        'Deploys, comandos executados nos apps e sessões interativas ficam registrados para auditoria e suporte.',
        'Esses registros são acessíveis à administração da plataforma.',
      ],
    },
    {
      title: 'Descumprimento',
      intro: 'Se estas regras forem descumpridas, a administração pode, conforme a gravidade:',
      items: [
        'Parar ou remover apps e serviços.',
        'Reduzir limites ou suspender o acesso à plataforma.',
        'Comunicar a coordenação do curso ou a direção do campus.',
      ],
    },
  ]
</script>

<style scoped>
  .rules-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    color: #1f2328;
  }

  .rules-wrap {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .rules-body {
    flex: 1;
    padding-top: 40px;
    padding-bottom: 48px;
    line-height: 1.65;
  }

  .rules-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .rules-lead {
    color: #57606a;
    margin-bottom: 32px;
  }

  .rules-section h2 {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 28px 0 8px;
  }

  .rules-section p {
    margin-bottom: 8px;
  }

  .rules-section ul {
    padding-left: 22px;
  }

  .rules-section li {
    margin-bottom: 4px;
  }

  .rules-footer {
    border-top: 1px solid #e5e7eb;
    padding: 20px 0;
    color: #57606a;
    font-size: 0.875rem;
  }
</style>
