import pg from 'pg';
const { Client } = pg;

// URL corrigida para o cluster aws-1 conforme seus dados
const connectionString = "postgresql://postgres.mzwfaxaidfajmnvommen:%24Ecos%40lTea%24@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const client = new Client({ connectionString });

async function test() {
  try {
    console.log("🔋 Validando Supavisor no Cluster AWS-1...");
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log("✅ SUPAVISOR CONECTADO COM SUCESSO!");
    console.log("Resposta do Banco:", res.rows[0].now);
  } catch (err) {
    console.error("❌ ERRO CRÍTICO:");
    console.error(err.message);
  } finally {
    await client.end();
  }
}
test();