# Documentation Crawler for Dapp Portal

This project implements a comprehensive web crawling solution to generate documentation from `docs.dappportal.io`. The crawler extracts Mini Dapp SDK integration guidelines, Dapp Portal features, and Kaia Wave Program information.

## 🌟 Features

- **Automated Web Crawling**: Uses Scrapy framework for efficient and respectful crawling
- **Content Extraction**: Extracts documentation, code examples, and links
- **Data Processing**: Organizes and structures crawled content
- **Documentation Generation**: Creates comprehensive Markdown documentation
- **Multi-language Support**: Handles English and Japanese content
- **Quality Assurance**: Filters and validates content quality

## 📋 Requirements

- Python 3.8+
- Virtual environment support
- Internet connection for crawling

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Clone or navigate to the crawler directory
cd docs-crawler

# Run the complete crawling process
python run_crawler.py
```

### 2. Manual Setup (Alternative)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/Linux/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run crawler
scrapy crawl docs_spider

# Process data
python data_processor.py
```

## 📁 Project Structure

```
docs-crawler/
├── docs_crawler/           # Scrapy project
│   ├── spiders/           # Spider implementations
│   ├── items.py           # Data models
│   ├── pipelines.py       # Data processing pipelines
│   ├── middlewares.py     # Custom middlewares
│   └── settings.py        # Crawler configuration
├── output/                # Generated files
│   ├── structured/        # Organized documentation
│   ├── *.json            # Raw data files
│   └── *.md              # Generated documentation
├── requirements.txt       # Python dependencies
├── run_crawler.py         # Main execution script
├── data_processor.py      # Data processing script
└── README.md             # This file
```

## ⚙️ Configuration

### Crawler Settings

The crawler is configured with the following settings in `docs_crawler/settings.py`:

- **Politeness**: 3-second delays between requests
- **Depth Limit**: Maximum 5 levels deep
- **Content Filtering**: Focuses on documentation sections
- **Size Limits**: 7MB maximum page size
- **Timeout**: 2-minute timeout per page

### Target Content

The crawler focuses on:
- `/mini-dapp/` - Mini Dapp development guides
- `/dapp-portal/` - Dapp Portal features
- `/kaia-wave/` - Kaia Wave Program information
- `/docs/` - General documentation

## 📊 Output Files

### Raw Data
- `documentation_items.json` - Extracted documentation pages
- `code_examples.json` - Code snippets and examples
- `links.json` - Internal and external links
- `crawl_summary.json` - Crawling statistics

### Structured Documentation
- `README.md` - Main documentation index
- `getting_started.md` - Getting started guide
- `mini_dapp_development.md` - Mini Dapp development
- `dapp_portal_features.md` - Dapp Portal features
- `kaia_wave_program.md` - Kaia Wave Program
- `api_reference.md` - API documentation
- `code_examples.md` - Code examples collection
- `design_guidelines.md` - Design requirements

## 🔧 Usage Options

### Command Line Options

```bash
# Complete process (default)
python run_crawler.py

# Setup environment only
python run_crawler.py --setup-only

# Run crawler only
python run_crawler.py --crawl-only

# Process data only
python run_crawler.py --process-only

# Skip environment setup
python run_crawler.py --skip-setup
```

### Custom Configuration

You can modify `docs_crawler/settings.py` to adjust:
- Crawling delays
- Concurrent requests
- Output formats
- Content filters

## 📈 Quality Assurance

The crawler includes several quality assurance features:

- **Content Validation**: Filters out low-quality or incomplete content
- **Duplicate Detection**: Prevents processing duplicate pages
- **Link Validation**: Checks for broken or invalid links
- **Size Limits**: Prevents processing oversized pages
- **Language Detection**: Identifies content language

## 🔄 Automation

### Scheduled Updates

To set up automated updates:

1. **Cron Job (Linux/Mac)**:
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/docs-crawler && python run_crawler.py --skip-setup
```

2. **Task Scheduler (Windows)**:
- Create a task to run `run_crawler.py` daily
- Set working directory to crawler location

3. **CI/CD Integration**:
```yaml
# GitHub Actions example
name: Update Documentation
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Crawler
        run: |
          cd docs-crawler
          python run_crawler.py
```

## 🛠️ Troubleshooting

### Common Issues

1. **Permission Errors**:
   - Ensure write permissions for output directory
   - Run with appropriate user privileges

2. **Network Issues**:
   - Check internet connection
   - Verify target website accessibility
   - Adjust timeout settings if needed

3. **Memory Issues**:
   - Reduce concurrent requests
   - Increase delays between requests
   - Process data in smaller batches

4. **Content Quality**:
   - Review crawled content manually
   - Adjust content filters in settings
   - Update extraction selectors

### Debug Mode

Enable debug logging:
```bash
scrapy crawl docs_spider -L DEBUG
```

## 📝 Integration with LINE Yield Project

The generated documentation can be integrated into your LINE Yield project:

1. **Copy Generated Files**:
```bash
cp output/structured/*.md ../docs/
```

2. **Update Project Documentation**:
   - Add links to generated documentation
   - Integrate code examples
   - Update API references

3. **AI Assistant Training**:
   - Use crawled content for AI model training
   - Create knowledge base from documentation
   - Enable documentation queries

## 🤝 Contributing

To contribute to this crawler:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the LINE Yield project and follows the same licensing terms.

## 🆘 Support

For issues or questions:
- Check the troubleshooting section
- Review the generated logs
- Create an issue in the project repository

---

**Note**: This crawler respects robots.txt and implements polite crawling practices. Always ensure compliance with website terms of service.
