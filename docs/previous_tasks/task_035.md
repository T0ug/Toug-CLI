# Task 035 - Preferir Windows Terminal ao Iniciar via cmd.exe

## Status

Concluida.

## Contexto

O owner definiu que o Toug deve preferir Windows Terminal quando o comando `toug` for executado a partir do `cmd.exe` classico no Windows.

## Escopo

- Detectar inicializacao pelo `cmd.exe` classico.
- Nao interferir quando o CLI ja estiver dentro do Windows Terminal.
- Nao interferir em `npm run start`.
- Se `wt.exe` existir:
  - perguntar se o usuario aceita prosseguir para Windows Terminal;
  - oferecer `Sim`, `Nao` e `Nao perguntar novamente`;
  - confirmar explicitamente a escolha permanente;
  - relancar o mesmo comando no Windows Terminal;
  - encerrar o processo atual.
- Se `wt.exe` nao existir:
  - perguntar se o usuario deseja instalar Windows Terminal;
  - em caso afirmativo, executar `winget install --id Microsoft.WindowsTerminal -e`;
  - apos instalacao bem-sucedida, salvar preferencia interna de auto relaunch;
  - relancar no Windows Terminal quando `wt.exe` estiver disponivel.
- Nao adicionar opcao no `/config`.

## Implementacao

- Campo interno adicionado ao config global:

```json
{
  "windowsTerminal": {
    "autoLaunch": true
  }
}
```

- O campo e normalizado por `configManager`, mas nao e exibido nem editavel no `/config`.
- A protecao `TOUG_WT_RELAUNCHED=1` evita relaunch infinito.
- A deteccao inicial usava `CMDCMDLINE`, mas isso foi corrigido na Task 036 porque o npm global pode iniciar `node ...\dist\index.js` sem essa variavel confiavel.

## Arquivos alterados

- `src/index.ts`
- `src/data/configManager.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `docs/project_status.md`
- `docs/handoff.md`
- `docs/tasks.md`
- `docs/review_report.md`
- `docs/decision_log.md`

## Evidencias

- `npx tsc --noEmit` passou apos a alteracao inicial.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- `dist/index.js` contem `ensureWindowsTerminalHost`, `TOUG_WT_RELAUNCHED`, `winget` e `windowsTerminal.autoLaunch`.
- `dist/data/configManager.js` contem normalizacao de `windowsTerminal.autoLaunch`.
