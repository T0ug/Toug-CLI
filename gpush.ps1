$msg = Read-Host "Mensagem do commit"

if ([string]::IsNullOrWhiteSpace($msg)) {
    Write-Host "`n❌ Mensagem vazia. O commit foi cancelado." -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Adicionando arquivos..." -ForegroundColor Cyan
git add .

Write-Host "`n⏳ Criando commit..." -ForegroundColor Cyan
git commit -m $msg

Write-Host "`n🚀 Enviando para o GitHub..." -ForegroundColor Cyan
git push

Write-Host "`n✅ Feito!" -ForegroundColor Green
