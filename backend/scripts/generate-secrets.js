// Genera JWT_SECRET y JWT_REFRESH_SECRET, los guarda en .secrets.generated.txt y los configura en Fly.
// Uso: node scripts/generate-secrets.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFlyPath() {
  const isWin = process.platform === 'win32';
  if (isWin) {
    const home = process.env.USERPROFILE || process.env.HOME || '';
    const flyExe = path.join(home, '.fly', 'bin', 'flyctl.exe');
    if (fs.existsSync(flyExe)) return flyExe;
  } else {
    const home = process.env.HOME || '';
    const flyLocal = path.join(home, '.fly', 'bin', 'flyctl');
    if (fs.existsSync(flyLocal)) return flyLocal;
  }
  return 'fly';
}

const JWT_SECRET = crypto.randomBytes(64).toString('base64');
const JWT_REFRESH_SECRET = crypto.randomBytes(64).toString('base64');

const backendDir = path.join(__dirname, '..');
const outPath = path.join(backendDir, '.secrets.generated.txt');
const content = `# Generado el ${new Date().toISOString()}. No subir a git.
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
`;
fs.writeFileSync(outPath, content, 'utf8');
console.log('Secrets guardados en backend/.secrets.generated.txt');

const flyCmd = getFlyPath();
const args = `secrets set "JWT_SECRET=${JWT_SECRET}" "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}" -a mercadosimple-api`;
try {
  execSync(`${flyCmd} ${args}`, { stdio: 'inherit', cwd: backendDir, shell: true });
  console.log('Secrets configurados en Fly (mercadosimple-api).');
} catch (e) {
  console.warn('No se pudieron configurar los secrets en Fly (¿fly auth login?). Podés ejecutar:');
  console.log(`  fly secrets set JWT_SECRET="..." JWT_REFRESH_SECRET="..." -a mercadosimple-api`);
}
