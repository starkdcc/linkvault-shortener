# 🚀 LinkVault GitHub Upload Script
# Run this script AFTER creating the GitHub repository

Write-Host "🔗 LinkVault GitHub Upload Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Not in a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git repository detected" -ForegroundColor Green

# Check if remote origin exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "✅ Remote origin configured: $remoteExists" -ForegroundColor Green
} else {
    Write-Host "❌ No remote origin configured" -ForegroundColor Red
    exit 1
}

# Prompt user confirmation
Write-Host ""
Write-Host "🎯 Ready to push to GitHub!" -ForegroundColor Yellow
Write-Host "Repository: https://github.com/starkdcc/linkvault-shortener" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Make sure you've created the GitHub repository first!" -ForegroundColor Yellow
Write-Host "   👉 Go to: https://github.com/new" -ForegroundColor White
Write-Host "   👉 Name: linkvault-shortener" -ForegroundColor White
Write-Host "   👉 DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Have you created the GitHub repository? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "❌ Please create the GitHub repository first, then run this script again." -ForegroundColor Red
    Write-Host "   Create at: https://github.com/new" -ForegroundColor White
    exit 0
}

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan

# Push to GitHub
try {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 SUCCESS! Your LinkVault project is now on GitHub!" -ForegroundColor Green
        Write-Host "=================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. 🌐 Visit: https://github.com/starkdcc/linkvault-shortener" -ForegroundColor White
        Write-Host "2. 🚀 Click 'Deploy with Vercel' button in README" -ForegroundColor White
        Write-Host "3. 🔗 Connect domain: linkvault.dpdns.org" -ForegroundColor White
        Write-Host "4. Set environment variables (database, ad networks)" -ForegroundColor White
        Write-Host "5. 💰 Start earning with high CPM ads!" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Your URL shortener features:" -ForegroundColor Yellow
        Write-Host "   • High CPM ads: PropellerAds, AdSense, Coinzilla" -ForegroundColor White
        Write-Host "   • Crypto payments: Bitcoin, Ethereum, USDT" -ForegroundColor White
        Write-Host "   - Real-time analytics and earnings tracking" -ForegroundColor White
        Write-Host "   • Premium subscription tiers" -ForegroundColor White
        Write-Host "   • 10% referral commission system" -ForegroundColor White
        Write-Host "   • Edge runtime for lightning-fast redirects" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Repository URL: https://github.com/starkdcc/linkvault-shortener" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to GitHub. Error code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "   Common issues:" -ForegroundColor Yellow
        Write-Host "   - Repository does not exist on GitHub" -ForegroundColor White
        Write-Host "   • Authentication required (GitHub login)" -ForegroundColor White
        Write-Host "   • Network connection issues" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error occurred during push: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")