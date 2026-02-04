# Resume LaTeX Setup

This folder contains your resume in LaTeX format. Every time you push changes to `resume.tex`, GitHub Actions automatically compiles it to PDF and updates `public/CHIRAG_DHUNNA.pdf`.

## How It Works

1. **Edit your resume**: Modify `resume.tex` with your information
2. **Push to GitHub**: Commit and push your changes to the `main` or `master` branch
3. **Auto-compilation**: GitHub Actions automatically:
   - Compiles `resume.tex` to PDF
   - Saves it as `public/CHIRAG_DHUNNA.pdf`
   - Commits the PDF back to your repository
4. **Website**: Your portfolio website automatically displays the latest PDF

## Local Testing (Optional)

To test compilation locally:

```bash
# Install LaTeX (Ubuntu/Debian)
sudo apt-get install texlive-latex-base texlive-latex-extra texlive-fonts-recommended

# Or on macOS with Homebrew
brew install --cask mactex

# Or on Windows
# Download from https://miktex.org/download

# Compile
cd resume
pdflatex -interaction=nonstopmode resume.tex
pdflatex -interaction=nonstopmode resume.tex  # Run twice for references
```

## Editing Tips

- **Basic formatting**: Use standard LaTeX commands
- **Hyperlinks**: Use `\href{url}{text}` for clickable links
- **Colors**: Already configured with `darkblue` color
- **Sections**: Sections auto-indent and format properly
- **Icons**: Font Awesome icons are available via `\faicon{}`

## File Structure

```
resume/
├── resume.tex          # Your resume source
└── README.md          # This file
```

The compiled PDF will automatically appear in `public/CHIRAG_DHUNNA.pdf`.

## Troubleshooting

- **PDF not generating?** Check the GitHub Actions tab for build logs
- **Compilation errors?** Ensure `resume.tex` has valid LaTeX syntax
- **PDF not updating?** Check that you pushed to the correct branch (main/master)
