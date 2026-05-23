# YouTube Transcript Generator Frontend

Modern React frontend for extracting and analyzing YouTube video transcripts with AI-powered features.

## Features

- Clean, responsive SaaS-style UI
- Real-time transcript display with search
- AI-powered summaries, key points, flashcards
- Multiple export formats (TXT, PDF, DOCX)
- Multi-language support
- Dark/Light mode (coming soon)
- Mobile-friendly design

## Prerequisites

- Node.js 16+ (`node --version`)
- npm 8+ (`npm --version`)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API URL** (optional):
   Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Running the Application

**Development**:
```bash
npm start
```

Opens on `http://localhost:3000`

**Production Build**:
```bash
npm run build
```

Creates optimized build in `build/` folder

## Project Structure

```
frontend/
├── src/
│   ├── api/                 # API client functions
│   │   └── api.js
│   ├── components/          # Reusable React components
│   │   ├── Common.jsx       # Shared UI components
│   │   └── TranscriptComponents.jsx
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── TranscriptGeneratorPage.jsx
│   │   └── FeaturesPage.jsx
│   ├── App.js              # Main app component
│   ├── App.css             # Global styles
│   ├── index.js            # React entry point
│   └── index.css           # Base styles
├── public/                 # Static files
│   └── index.html
├── package.json
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Available Pages

### Home Page
Landing page with features overview and call-to-action

### Transcript Generator
Main tool interface where users can:
1. Paste YouTube URL
2. Select language
3. Generate transcript
4. View transcript with search
5. Generate AI summaries
6. Extract key points
7. Create flashcards
8. Export in multiple formats

### Features Page
Detailed feature descriptions and specifications

## Key Components

### TranscriptGeneratorPage
Main component handling:
- URL validation
- Transcript fetching
- AI analysis
- Export functionality

### TranscriptComponents
- `TranscriptViewer`: Display and search transcript
- `TranscriptExportOptions`: Export format selection
- `TranscriptTabs`: Tabbed interface for different views

### Common Components
- `LoadingSpinner`: Loading indicator
- `ErrorMessage`: Error display
- `SuccessMessage`: Success notification
- `Card`: Reusable card component
- `PrimaryButton`: Main action button
- `SecondaryButton`: Secondary action button

## Styling

Built with **Tailwind CSS** for:
- Responsive design
- Custom color scheme
- Smooth animations
- Dark mode support (in config)

### Color Scheme
- Primary: `#667eea`
- Secondary: `#764ba2`
- Dark: `#1f2937`

## API Integration

All API calls go through `src/api/api.js`:

```javascript
// Fetch transcript
const response = await transcriptAPI.fetchTranscript(url, language);

// Generate summary
const summary = await aiAPI.summarize(transcript, language);

// Export as PDF
const pdf = await exportAPI.downloadPDF(transcript, fileName);
```

## Environment Variables

Create `.env` in frontend root:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Build Configuration
NODE_ENV=development
GENERATE_SOURCEMAP=false

# Enable source maps for debugging
# GENERATE_SOURCEMAP=true
```

## Deployment

### With Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `REACT_APP_API_URL` environment variable
4. Deploy

```bash
npm install -g vercel
vercel
```

### With Netlify
1. Create `netlify.toml`:
```toml
[build]
command = "npm run build"
publish = "build"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

2. Deploy:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Traditional Hosting
1. Build production bundle:
   ```bash
   npm run build
   ```

2. Upload `build/` folder contents to your web server

3. Configure web server to serve `index.html` for all routes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance Tips

1. **Code Splitting**: Routes are automatically code-split by React
2. **Image Optimization**: Serve images in WebP format when possible
3. **Caching**: API responses are cached in the browser
4. **Minification**: Production build minifies all code and CSS

## Troubleshooting

### "Cannot connect to API"
- Check if backend server is running on correct port
- Verify `REACT_APP_API_URL` environment variable
- Check browser console for CORS errors

### "Blank page on load"
- Check browser console for JavaScript errors
- Clear browser cache and reload
- Check if `index.html` is being served correctly

### "Fallback Font displayed"
- Clear browser cache
- Verify internet connection
- Check DevTools Network tab

## Dependencies

- **react**: UI library
- **react-dom**: React DOM rendering
- **axios**: HTTP client
- **react-router-dom**: Client-side routing
- **lucide-react**: Icon library
- **socket.io-client**: WebSocket client
- **tailwindcss**: Utility-first CSS framework

## Development Workflow

1. Make changes to React components
2. Changes auto-reload in browser (Hot Reload)
3. Check browser console for errors
4. Use React DevTools for debugging
5. Test with different screen sizes (DevTools → Device Emulation)

## CSS Architecture

- **Tailwind CSS**: Utility-first CSS
- **PostCSS**: CSS processing
- **Autoprefixer**: Vendor prefixes

Custom CSS in `src/App.css` for:
- Animations
- Custom styles
- Global rules

## Form Handling

Forms use native HTML input with React state management:

```javascript
const [youtubeUrl, setYoutubeUrl] = useState('');
<input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
```

## Error Boundaries

Not implemented yet. Add React Error Boundary component for production:

```javascript
class ErrorBoundary extends React.Component {
  // Implementation
}
```

## Testing

Add Jest and React Testing Library:

```bash
npm test
```

## Support

For issues and questions:
1. Check console for error messages
2. Verify API is running
3. Check network tab in DevTools
4. Review component props and state

## License

MIT
