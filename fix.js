const fs = require('fs');

function replaceInFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace heavily rounded corners with sharp edges
    content = content.replace(/rounded-\[2rem\]/g, 'rounded-none');
    content = content.replace(/rounded-\[3rem\]/g, 'rounded-none');
    content = content.replace(/rounded-3xl/g, 'rounded-none');
    content = content.replace(/rounded-2xl/g, 'rounded-none');
    content = content.replace(/rounded-xl/g, 'rounded-none');
    content = content.replace(/rounded-lg/g, 'rounded-none');
    content = content.replace(/rounded-md/g, 'rounded-none');
    
    // Replace gradients with solid dark
    content = content.replace(/bg-gradient-to-r from-theme-gold\/20 to-transparent border border-theme-gold\/30/g, 'bg-[#040A07] border border-theme-gold/40');
    
    // Replace green text for success/secure to gold or muted
    content = content.replace(/text-green-400 bg-green-500\/10/g, 'text-theme-gold bg-theme-gold/10');
    content = content.replace(/border-green-500\/20/g, 'border-theme-gold/20');
    content = content.replace(/text-green-500/g, 'text-theme-gold');
    content = content.replace(/bg-green-500\/20/g, 'bg-theme-gold/20');
    content = content.replace(/bg-green-500\/10/g, 'bg-theme-gold/10');

    // Make headings elegant
    content = content.replace(/font-extrabold/g, 'font-light');
    content = content.replace(/className="text-3xl /g, 'className="text-3xl font-heading ');
    content = content.replace(/className="text-4xl /g, 'className="text-4xl font-heading ');
    
    fs.writeFileSync(path, content, 'utf8');
    console.log(`Updated ${path}`);
}

[
    'src/app/cart/page.tsx', 
    'src/app/menu/page.tsx', 
    'src/app/orders/page.tsx', 
    'src/app/profile/page.tsx', 
    'src/app/favorites/page.tsx',
    'src/app/details/page.tsx',
    'src/app/login/page.tsx',
    'src/components/Navbar.tsx',
].forEach(replaceInFile);
