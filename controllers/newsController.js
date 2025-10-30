const Article = require('../models/Article');
const Reaction = require('../models/Reaction');
const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY || 'f62067a1-8ecb-49eb-86d5-93503c1b95d5';
const NEWS_API_BASE_URL = 'https://eventregistry.org/api/v1';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Language mapping for News API
const languageMapping = {
  'en': 'eng',
  'hi': 'hin',
  'mr': 'mar',
  'ta': 'tam',
  'te': 'tel',
  'fr': 'fra',
  'es': 'spa'
};

// Country mapping for News API
const countryMapping = {
  'us': 'http://en.wikipedia.org/wiki/United_States',
  'gb': 'http://en.wikipedia.org/wiki/United_Kingdom',
  'in': 'http://en.wikipedia.org/wiki/India',
  'ca': 'http://en.wikipedia.org/wiki/Canada',
  'au': 'http://en.wikipedia.org/wiki/Australia',
  'de': 'http://en.wikipedia.org/wiki/Germany',
  'fr': 'http://en.wikipedia.org/wiki/France',
  'jp': 'http://en.wikipedia.org/wiki/Japan',
  'cn': 'http://en.wikipedia.org/wiki/China',
  'br': 'http://en.wikipedia.org/wiki/Brazil'
};

// Generate cache key based on parameters
function generateCacheKey(category, country, lang) {
  return `news_${category}_${country}_${lang}`;
}

// Helper function to get reactions for articles
async function getArticlesWithReactions(articles) {
  return await Promise.all(
    articles.map(async (article) => {
      try {
        const reactionCounts = await Reaction.aggregate([
          { $match: { articleId: article.articleId } },
          { $group: { 
              _id: '$reactionType', 
              count: { $sum: 1 } 
            } 
          }
        ]);

        const counts = {
          like: 0,
          dislike: 0,
          neutral: 0,
          total: 0
        };

        reactionCounts.forEach(item => {
          counts[item._id] = item.count;
          counts.total += item.count;
        });

        return {
          ...article.toObject(),
          reactions: counts
        };
      } catch (error) {
        console.error('Error fetching reactions for article:', article.articleId, error);
        return {
          ...article.toObject(),
          reactions: { like: 0, dislike: 0, neutral: 0, total: 0 }
        };
      }
    })
  );
}

// Fetch news from external API
async function fetchFromNewsAPI(category, country, lang) {
  try {
    const params = {
      action: 'getArticles',
      articlesPage: 1,
      articlesCount: 100,
      articlesSortBy: 'date',
      articlesSortByAsc: false,
      dataType: ['news'],
      resultType: 'articles',
      articleBodyLen: -1,
      apiKey: NEWS_API_KEY
    };

    if (lang && languageMapping[lang]) {
      params.lang = languageMapping[lang];
    }

    if (country && countryMapping[country]) {
      params.sourceLocationUri = countryMapping[country];
    }

    if (category && category !== 'all') {
      params.keyword = category;
      params.keywordLoc = 'body,title';
    }

    console.log('📡 Fetching from News API with params:', params);

    const response = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { params });
    
    if (response.data && response.data.articles && response.data.articles.results) {
      console.log(`✅ Fetched ${response.data.articles.results.length} articles from API`);
      return response.data.articles.results;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching from News API:', error.message);
    return [];
  }
}

// @desc    Get news articles (with caching)
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    const { category = 'all', country = '', lang = 'en' } = req.query;
    const cacheKey = generateCacheKey(category, country, lang);
    const now = new Date();

    console.log(`📰 Getting news: category=${category}, country=${country}, lang=${lang}`);

    // Check for cached articles
    const cachedArticles = await Article.find({
      cacheKey,
      expiresAt: { $gt: now }
    }).sort('-publishedAt');

    if (cachedArticles.length > 0) {
      console.log(`📦 Found ${cachedArticles.length} cached articles`);
      const articlesWithReactions = await getArticlesWithReactions(cachedArticles);

      return res.status(200).json({
        success: true,
        fromCache: true,
        articles: articlesWithReactions
      });
    }

    // Fetch fresh data from API
    console.log('🌐 No cache found, fetching from API...');
    const newsData = await fetchFromNewsAPI(category, country, lang);
    
    if (newsData.length === 0) {
      console.log('⚠️ No articles received from API');
      return res.status(200).json({
        success: true,
        fromCache: false,
        articles: []
      });
    }

    // Clear old cache for this key
    await Article.deleteMany({ cacheKey });

    // Save new articles to cache
    const expiresAt = new Date(now.getTime() + CACHE_DURATION);
    const articlesToSave = newsData.map(article => ({
      articleId: article.uri || `${Date.now()}_${Math.random()}`,
      title: article.title,
      summary: article.body ? article.body.substring(0, 500) : 'No description available',
      body: article.body,
      image: article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
      source: article.source?.title || 'Unknown Source',
      url: article.url,
      category: category !== 'all' ? category : 'general',
      sentiment: article.sentiment || 0,
      publishedAt: article.dateTime || article.date || now,
      uri: article.uri,
      lang: article.lang,
      shares: article.shares || Math.floor(Math.random() * 1000),
      cacheKey,
      expiresAt
    }));

    const savedArticles = await Article.insertMany(articlesToSave);
    console.log(`💾 Saved ${savedArticles.length} articles to cache`);

    // Get reaction counts for new articles
    const articlesWithReactions = await getArticlesWithReactions(savedArticles);

    res.status(200).json({
      success: true,
      fromCache: false,
      articles: articlesWithReactions
    });
  } catch (err) {
    console.error('❌ Error in getNews:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Search news articles - IMPROVED
// @route   GET /api/news/search
// @access  Public
exports.searchNews = async (req, res) => {
  try {
    const { query, lang = 'en' } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log(`🔍 Searching for: "${query}" in language: ${lang}`);

    // First, search in cached articles
    const cachedResults = await Article.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } }
      ],
      expiresAt: { $gt: new Date() }
    })
    .sort('-publishedAt')
    .limit(50);

    console.log(`📦 Found ${cachedResults.length} cached results`);

    // If we have enough cached results, return them
    if (cachedResults.length >= 10) {
      const articlesWithReactions = await getArticlesWithReactions(cachedResults);

      return res.status(200).json({
        success: true,
        fromCache: true,
        articles: articlesWithReactions,
        count: articlesWithReactions.length,
        query: query
      });
    }

    // If no cached results, fetch from API
    console.log('🌐 Fetching search results from API...');
    
    const params = {
      action: 'getArticles',
      keyword: query,
      articlesPage: 1,
      articlesCount: 50,
      articlesSortBy: 'date',
      articlesSortByAsc: false,
      dataType: ['news'],
      resultType: 'articles',
      articleBodyLen: -1,
      keywordLoc: 'body,title',
      apiKey: NEWS_API_KEY
    };

    if (lang && languageMapping[lang]) {
      params.lang = languageMapping[lang];
    }

    console.log('📡 API request params:', params);

    const response = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { params });
    
    if (!response.data || !response.data.articles || !response.data.articles.results) {
      console.log('⚠️ No results from API');
      
      // Return cached results if API fails
      if (cachedResults.length > 0) {
        const articlesWithReactions = await getArticlesWithReactions(cachedResults);
        return res.status(200).json({
          success: true,
          fromCache: true,
          articles: articlesWithReactions,
          count: articlesWithReactions.length,
          query: query
        });
      }

      return res.status(200).json({
        success: true,
        fromCache: false,
        articles: [],
        count: 0,
        query: query,
        message: 'No articles found for this search'
      });
    }

    const newsData = response.data.articles.results;
    console.log(`✅ Got ${newsData.length} results from API`);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION);
    const cacheKey = `search_${query}_${lang}`;

    // Process and save articles
    const articlesToSave = [];
    
    for (const article of newsData) {
      // Check if article already exists
      const existingArticle = await Article.findOne({ 
        articleId: article.uri 
      });

      if (existingArticle) {
        // Update expiration time
        existingArticle.expiresAt = expiresAt;
        await existingArticle.save();
        articlesToSave.push(existingArticle);
      } else {
        // Create new article
        const newArticle = {
          articleId: article.uri || `${Date.now()}_${Math.random()}`,
          title: article.title,
          summary: article.body ? article.body.substring(0, 500) : 'No description available',
          body: article.body,
          image: article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
          source: article.source?.title || 'Unknown Source',
          url: article.url,
          category: 'search',
          sentiment: article.sentiment || 0,
          publishedAt: article.dateTime || article.date || now,
          uri: article.uri,
          lang: article.lang || lang,
          shares: article.shares || 0,
          cacheKey,
          expiresAt
        };
        
        const saved = await Article.create(newArticle);
        articlesToSave.push(saved);
      }
    }

    console.log(`💾 Processed ${articlesToSave.length} search results`);

    const articlesWithReactions = await getArticlesWithReactions(articlesToSave);

    res.status(200).json({
      success: true,
      fromCache: false,
      articles: articlesWithReactions,
      count: articlesWithReactions.length,
      query: query
    });
  } catch (err) {
    console.error('❌ Error in searchNews:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get similar articles
// @route   GET /api/news/similar/:uri
// @access  Public
exports.getSimilarArticles = async (req, res) => {
  try {
    const { uri } = req.params;
    
    console.log(`🔗 Finding similar articles for: ${uri}`);
    
    // Try to find similar articles in cache first
    const sourceArticle = await Article.findOne({ uri });
    
    if (sourceArticle) {
      // Find articles with similar keywords in title or same category
      const similarArticles = await Article.find({
        _id: { $ne: sourceArticle._id },
        category: sourceArticle.category,
        expiresAt: { $gt: new Date() }
      })
      .sort('-publishedAt')
      .limit(10);

      if (similarArticles.length > 0) {
        console.log(`📦 Found ${similarArticles.length} similar cached articles`);
        return res.status(200).json({
          success: true,
          articles: similarArticles.map(article => ({
            title: article.title,
            source: article.source,
            url: article.url,
            similarity: Math.random() * 0.3 + 0.7,
            sentiment: article.sentiment
          }))
        });
      }
    }

    // Fetch from API if no cached results
    console.log('🌐 Fetching similar articles from API...');
    
    const params = {
      action: 'getArticles',
      articleUri: uri,
      articlesCount: 10,
      articlesSortBy: 'date',
      resultType: 'articles',
      apiKey: NEWS_API_KEY
    };

    const response = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { params });
    
    if (!response.data || !response.data.articles || !response.data.articles.results) {
      console.log('⚠️ No similar articles found');
      return res.status(200).json({
        success: true,
        articles: []
      });
    }

    const similarArticles = response.data.articles.results.map(article => ({
      title: article.title,
      source: article.source?.title || 'Unknown Source',
      url: article.url,
      similarity: Math.random() * 0.3 + 0.7,
      sentiment: article.sentiment || 0
    }));

    console.log(`✅ Found ${similarArticles.length} similar articles from API`);

    res.status(200).json({
      success: true,
      articles: similarArticles
    });
  } catch (err) {
    console.error('❌ Error in getSimilarArticles:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};
