# Task 036 - Corrigir Deteccao de Console Windows no npm Global

## Status

Concluida.

## Contexto

Em teste real no Windows 10, executando `toug` pelo `cmd.exe` classico a partir do pacote global npm, o prompt de migracao para Windows Terminal nao apareceu.

O titulo da janela indicava que o npm shim iniciou diretamente:

```text
cmd.exe - "node" "...\node_modules\toug-cli\dist\index.js"
```

A deteccao anterior dependia de `CMDCMDLINE`, que nao se mostrou confiavel nesse fluxo.

## Escopo

- Corrigir a deteccao para cobrir o pacote npm global.
- Manter exclusao de `npm run`.
- Manter exclusao de sessoes ja dentro do Windows Terminal.
- Manter protecao contra relaunch infinito.
- Atualizar pacote para `1.1.16`.
- Atualizar documentos oficiais.

## Implementacao

A deteccao passou a usar:

- `process.platform === 'win32'`;
- ausencia de `WT_SESSION`;
- ausencia de `TOUG_WT_RELAUNCHED`;
- ausencia de `npm_lifecycle_event`;
- `stdin` interativo;
- `stdout` interativo.

Isso cobre `cmd.exe` classico com `toug` instalado globalmente e evita disparar durante `npm run start`.

## Arquivos alterados

- `src/index.ts`
- `package.json`
- `package-lock.json`
- `docs/project_status.md`
- `docs/handoff.md`
- `docs/tasks.md`
- `docs/review_report.md`
- `docs/decision_log.md`

## Evidencias

- Alteracao aplicada em `src/index.ts`.
- `npx tsc --noEmit` passou.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- `dist/index.js` contem `shouldPreferWindowsTerminalHost` sem dependencia de `CMDCMDLINE`.
