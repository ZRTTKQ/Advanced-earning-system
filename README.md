# Advanced Website Embedding System

A powerful, real-time website embedding system that allows you to embed ANY website with full functionality and comprehensive admin controls.

## Features

### 🌐 Universal Website Embedding
- **{{embeds}}** any website with 100% functionality preservation
- Real-time embedding with full interactive capabilities
- Support for all modern web technologies
- Secure iframe implementation with customizable permissions

### 🛡️ Advanced Security
- Configurable sandbox security settings
- Domain allowlist/blocklist functionality
- HTTPS enforcement options
- Granular permission controls (camera, microphone, autoplay, etc.)

### ⚙️ Comprehensive Admin Panel
- **General Settings**: Configure embedding limits, timeouts, logging
- **Security Settings**: Manage domain restrictions and HTTPS policies
- **Embed Settings**: Control iframe permissions and functionality
- **History Management**: Track and export embedding activity

### 🎯 User-Friendly Interface
- Modern, responsive design
- Quick access buttons for popular websites
- Fullscreen mode support
- Loading indicators and error handling
- Real-time notifications

### 📱 Responsive Design
- Optimized for desktop, tablet, and mobile devices
- Touch-friendly controls
- Adaptive layout

## Quick Start

1. Open `index.html` in your web browser
2. Enter any website URL in the input field
3. Click "Embed Website" or press Enter
4. Use the Admin Panel to configure settings as needed

## Admin Panel Features

### General Settings
- **Maximum Simultaneous Embeds**: Control resource usage
- **Default Timeout**: Set loading timeout for embedded sites
- **Activity Logging**: Enable/disable embed activity tracking

### Security Settings
- **HTTPS Only**: Force secure connections
- **Blocked Domains**: Prevent embedding of specific domains
- **Allowed Domains**: Restrict embedding to approved domains only

### Embed Settings
- **Sandbox Security**: Enable iframe sandboxing
- **Fullscreen Mode**: Allow embedded sites to go fullscreen
- **Autoplay**: Control media autoplay permissions
- **Camera/Microphone**: Manage device access permissions

### History Management
- View complete embedding history
- Export history data as JSON
- Clear history with confirmation

## Technical Implementation

### Core Technologies
- **HTML5**: Modern semantic structure
- **CSS3**: Advanced styling with flexbox/grid
- **Vanilla JavaScript**: No dependencies, pure ES6+
- **LocalStorage**: Persistent settings and history

### Security Features
- Content Security Policy (CSP) ready
- Iframe sandboxing with selective permissions
- XSS protection through proper sanitization
- Referrer policy controls

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Usage Examples

### Basic Embedding
```javascript
// Embed a website programmatically
window.embedSystem.embedUrl('https://github.com');
```

### Get Current Embed
```javascript
// Get currently embedded URL
const currentUrl = window.embedSystem.getCurrentEmbed();
```

### Access Settings
```javascript
// Get current system settings
const settings = window.embedSystem.getSettings();
```

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## Customization

### Adding New Quick Access Buttons
Edit the `quick-buttons` section in `index.html`:
```html
<button class="quick-btn" data-url="https://example.com">
    <i class="fas fa-icon"></i> Example
</button>
```

### Modifying Default Settings
Update the `settings` object in `script.js`:
```javascript
this.settings = {
    maxEmbeds: 1,
    defaultTimeout: 30,
    // ... other settings
};
```

### Custom Styling
Modify `styles.css` or add custom CSS rules. The system uses CSS custom properties for easy theming.

## Security Considerations

1. **iframe Security**: Uses sandbox attributes to restrict embedded content
2. **Domain Validation**: Validates URLs and checks against allowed/blocked lists
3. **HTTPS Enforcement**: Optional HTTPS-only mode for secure connections
4. **Permission Controls**: Granular control over browser API access

## Troubleshooting

### Website Won't Load
- Check if the website allows iframe embedding
- Verify domain isn't in blocked list
- Ensure HTTPS settings are compatible
- Check browser console for errors

### Admin Panel Not Saving
- Ensure localStorage is enabled in browser
- Check for JavaScript errors in console
- Verify all form fields are properly filled

### Performance Issues
- Reduce maximum simultaneous embeds
- Clear embedding history regularly
- Check network connection quality

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or contributions, please refer to the project repository or contact the development team.

---

**Note**: This system respects website embedding policies. Some sites may prevent embedding through X-Frame-Options headers or Content Security Policy settings.