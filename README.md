# DevKit website

A free tools website (JSON, XML, YAML, CSV, Base64, URL, JWT, text diff). Plain HTML, CSS and JavaScript. No framework and no server needed.

## Put it on GitHub
1. Create a new empty repository on github.com (no README).
2. In this folder, run:
   git init
   git add .
   git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
   git push -u origin main

## Change the name, domain or email
Open `build.js`, edit the three lines at the top (NAME, SITE, EMAIL), then run:
   node build.js
This regenerates every page, sitemap.xml and robots.txt. Commit and push again.

## Preview on your computer
   npx serve .
Then open the address it prints. (Opening index.html by double-click will not load the CSS, because the links start with "/".)

## Folder guide
- index.html and the tool folders: generated pages
- assets/style.css: the design
- assets/tools.js: the tool logic
- build.js: the page generator (edit content here, not in the generated pages)
