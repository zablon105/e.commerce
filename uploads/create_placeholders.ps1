# Create SVG placeholder images
$placeholders = @(
    @{name='womens_shoes_2.svg'; color='FF69B4'; label='Women Shoes'},
    @{name='womens_shoes_3.svg'; color='FFB6C1'; label='Heels'},
    @{name='womens_bedding_1.svg'; color='E6E6FA'; label='Bedding'},
    @{name='womens_bedding_2.svg'; color='FFF0F5'; label='Bed Set'},
    @{name='womens_handbag_1.svg'; color='D2B48C'; label='Handbag'},
    @{name='womens_handbag_2.svg'; color='8B4513'; label='Leather Bag'},
    @{name='mens_shoes_1.svg'; color='696969'; label='Mens Shoes'},
    @{name='mens_shoes_2.svg'; color='2F4F4F'; label='Running Shoes'}
)

foreach($ph in $placeholders) {
    $svg = @"
<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#$($ph.color)"/>
  <circle cx="200" cy="180" r="60" fill="rgba(255,255,255,0.3)"/>
  <text x="200" y="250" text-anchor="middle" font-size="36" font-weight="bold" fill="white" font-family="Arial">$($ph.label)</text>
</svg>
"@
    
    $svg | Out-File -FilePath $ph.name -Encoding UTF8 -Force
    Write-Host "Created $($ph.name)"
}

Write-Host ""
Write-Host "All files in uploads folder:"
Get-ChildItem -File | Format-Table Name, Length, CreationTime
