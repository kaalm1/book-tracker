// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import * as cheerio from 'cheerio';

admin.initializeApp();

// Email transporter setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.password
  }
});

interface SearchResult {
  title: string;
  price: string;
  source: string;
  condition?: string;
  link: string;
  seller?: string;
}

interface Book {
  id: string;
  title: string;
  author?: string;
  userId: string;
  lastSearched?: string;
}

interface User {
  email: string;
  displayName: string;
  notifications?: boolean;
}

// Scheduled function to run daily book searches
export const dailyBookSearch = functions.pubsub.schedule('0 9 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Starting daily book search...');
    
    const db = admin.firestore();
    
    try {
      // Get all users with notifications enabled
      const usersSnapshot = await db.collection('users')
        .where('notifications', '==', true)
        .get();
      console.log(`Found ${usersSnapshot.docs.length} users with notifications enabled`);
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as User;
        
        // Get user's books
        const booksSnapshot = await db.collection('books')
          .where('userId', '==', userDoc.id)
          .get();
        
        console.log(`User ${userData.email} has ${booksSnapshot.docs.length} books`);
        
        for (const bookDoc of booksSnapshot.docs) {
          const book = { id: bookDoc.id, ...bookDoc.data() } as Book;
          
          // Skip if searched recently (within last 6 hours to avoid spam)
          const lastSearched = book.lastSearched ? new Date(book.lastSearched) : null;
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
          
          if (lastSearched && lastSearched > sixHoursAgo) {
            console.log(`Skipping "${book.title}" - searched recently`);
            continue;
          }
          
          try {
            const results = await searchAllPlatforms(book.title, book.author);
            
            if (results.length > 0) {
              await sendEmailToUser(userData.email, userData.displayName, book.title, results);
              await saveNotifications(userDoc.id, book.title, results);
              console.log(`Found ${results.length} results for "${book.title}" for user ${userData.email}`);
            }
            
            // Update last searched timestamp
            await bookDoc.ref.update({
              lastSearched: new Date().toISOString()
            });
            
            // Add delay between searches to be respectful
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.error(`Error searching for book "${book.title}":`, error);
          }
        }
        
        // Add delay between users
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error in daily book search:', error);
    }
    
    console.log('Daily book search completed');
  });

// Manual search function that can be called from the frontend
export const searchBook = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { bookTitle, author } = data;
  
  if (!bookTitle) {
    throw new functions.https.HttpsError('invalid-argument', 'Book title is required');
  }
  
  try {
    const results = await searchAllPlatforms(bookTitle, author);
    return { results, searchedAt: new Date().toISOString() };
  } catch (error) {
    console.error('Error in manual search:', error);
    throw new functions.https.HttpsError('internal', 'Search failed');
  }
});

// Function to mark notifications as read
export const markNotificationRead = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { notificationId } = data;
  const db = admin.firestore();
  
  try {
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update notification');
  }
});

async function searchAllPlatforms(bookTitle: string, author?: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const searchQuery = author ? `${bookTitle} ${author}` : bookTitle;
  
  try {
    // Search platforms in parallel but with error handling
    const searchPromises = [
      searchCraigslist(searchQuery).catch(err => {
        console.error('Craigslist search failed:', err);
        return [];
      }),
      searchReddit(searchQuery).catch(err => {
        console.error('Reddit search failed:', err);
        return [];
      }),
      // Facebook Marketplace would require more complex setup
      // searchFacebookMarketplace(searchQuery).catch(err => {
      //   console.error('Facebook search failed:', err);
      //   return [];
      // })
    ];
    
    const allResults = await Promise.all(searchPromises);
    
    // Flatten results and remove duplicates
    const flatResults = allResults.flat();
    const uniqueResults = flatResults.filter((result, index, self) => 
      index === self.findIndex(r => r.link === result.link)
    );
    
    results.push(...uniqueResults);
    
  } catch (error) {
    console.error('Error searching platforms:', error);
  }
  
  return results;
}

async function searchFacebookMarketplace(searchQuery: string): Promise<SearchResult[]> {
  try {
    // Note: Facebook Marketplace requires complex authentication and browser automation
    // This would need Puppeteer or similar tool in a real implementation
    
    console.log(`Facebook Marketplace search not implemented for: ${searchQuery}`);
    
    // Placeholder - in production you would:
    // 1. Use Puppeteer with stealth plugins
    // 2. Handle Facebook's authentication
    // 3. Parse dynamic content
    // 4. Implement proper rate limiting
    
    return [];
  } catch (error) {
    console.error('Facebook Marketplace search error:', error);
    return [];
  }
}

async function searchCraigslist(searchQuery: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://craigslist.org/search/sss?query=${encodeURIComponent(searchQuery)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000,
      maxRedirects: 3
    });
    
    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];
    
    $('.result-row').each((index, element) => {
      if (index >= 8) return false; // Limit to 8 results
      
      const $element = $(element);
      const title = $element.find('.result-title').text().trim();
      const price = $element.find('.result-price').text().trim();
      const link = $element.find('.result-title').attr('href');
      const location = $element.find('.result-hood').text().trim();
      
      // Check if the listing actually relates to books
      const titleLower = title.toLowerCase();
      if (titleLower.includes('book') || 
          titleLower.includes('novel') || 
          titleLower.includes('textbook') ||
          searchQuery.split(' ').some(word => titleLower.includes(word.toLowerCase()))) {
        
        results.push({
          title: title,
          price: price || 'Price not listed',
          source: `Craigslist${location ? ` ${location}` : ''}`,
          link: link?.startsWith('http') ? link : `https://craigslist.org${link}`,
          condition: 'Used'
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error('Craigslist search error:', error);
    return [];
  }
}

async function searchReddit(searchQuery: string): Promise<SearchResult[]> {
  try {
    const searchTerms = [
      `${searchQuery} for sale`,
      `selling ${searchQuery}`,
      `${searchQuery} book sale`
    ];
    
    const results: SearchResult[] = [];
    
    for (const term of searchTerms) {
      const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(term)}&sort=new&limit=15&t=month`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'BookTracker/1.0 (by /u/booktracker)'
        },
        timeout: 10000
      });
      
      if (response.data?.data?.children) {
        response.data.data.children.forEach((post: any) => {
          const postData = post.data;
          const title = postData.title;
          const text = postData.selftext || '';
          const combined = (title + ' ' + text).toLowerCase();
          
          // Look for selling indicators
          if ((combined.includes('for sale') || 
               combined.includes('selling') ||
               combined.includes('sale') ||
               combined.includes('$')) &&
               !postData.over_18 && // Skip NSFW posts
               postData.subreddit_type === 'public') {
            
            // Try to extract price
            const priceMatch = (title + ' ' + text).match(/\$(\d+(?:\.\d{2})?)/);
            
            results.push({
              title: title,
              price: priceMatch ? `$${priceMatch[1]}` : 'See post for price',
              source: `Reddit r/${postData.subreddit}`,
              link: `https://reddit.com${postData.permalink}`,
              seller: `/u/${postData.author}`
            });
          }
        });
      }
      
      // Small delay between search terms
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.link === result.link)
    );
    
    return uniqueResults.slice(0, 5);
  } catch (error) {
    console.error('Reddit search error:', error);
    return [];
  }
}

async function sendEmailToUser(email: string, name: string, bookTitle: string, results: SearchResult[]): Promise<void> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0;
            background-color: #f9fafb;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .book-title { 
            font-size: 24px; 
            margin-bottom: 10px; 
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .result { 
            border: 1px solid #e5e7eb; 
            margin: 15px 0; 
            padding: 20px; 
            border-radius: 8px;
            background: #fafafa;
          }
          .result-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1f2937;
          }
          .price { 
            font-size: 20px; 
            font-weight: bold; 
            color: #059669; 
            margin: 8px 0;
          }
          .source { 
            color: #6b7280; 
            font-size: 14px; 
            margin: 5px 0;
          }
          .condition {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
          }
          .link { 
            display: inline-block; 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 12px;
            font-weight: 500;
            transition: opacity 0.2s;
          }
          .link:hover {
            opacity: 0.9;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding: 30px 20px; 
            border-top: 1px solid #e5e7eb; 
            color: #6b7280;
            background: #f9fafb;
          }
          .results-count {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            text-align: center;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Book Found!</h1>
            <div class="book-title">${bookTitle}</div>
          </div>
          
          <div class="content">
            <p>Hello ${name},</p>
            <p>Great news! We found <strong>${results.length}</strong> listing${results.length !== 1 ? 's' : ''} for "<strong>${bookTitle}</strong>":</p>
            
            <div class="results-count">
              Found ${results.length} result${results.length !== 1 ? 's' : ''} • ${new Date().toLocaleDateString()}
            </div>
            
            ${results.map(result => `
              <div class="result">
                <div class="result-title">${result.title}</div>
                <div class="price">${result.price}</div>
                <div class="source">${result.source}${result.seller ? ` • ${result.seller}` : ''}</div>
                ${result.condition ? `<div class="condition">Condition: ${result.condition}</div>` : ''}
                <a href="${result.link}" class="link" target="_blank" rel="noopener">View Listing →</a>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p><strong>Happy reading! 📖</strong></p>
            <p><small>This email was sent by Book Tracker. You can manage your book list and notification preferences in your dashboard.</small></p>
            <p><small>To stop receiving these notifications, update your preferences in the app.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await transporter.sendMail({
      from: `"Book Tracker 📚" <${functions.config().gmail.user}>`,
      to: email,
      subject: `📚 ${results.length} listing${results.length !== 1 ? 's' : ''} found: ${bookTitle}`,
      html: html
    });
    
    console.log(`Email sent to ${email} for book: ${bookTitle} (${results.length} results)`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function saveNotifications(userId: string, bookTitle: string, results: SearchResult[]): Promise<void> {
  const db = admin.firestore();
  
  try {
    const batch = db.batch();
    
    for (const result of results) {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId,
        bookTitle,
        title: result.title,
        price: result.price,
        source: result.source,
        link: result.link,
        condition: result.condition || null,
        seller: result.seller || null,
        date: new Date().toISOString().split('T')[0],
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`Saved ${results.length} notifications for user ${userId}`);
  } catch (error) {
    console.error('Error saving notifications:', error);
    throw error;
  }
}

// Clean up old notifications (run weekly)
export const cleanupOldNotifications = functions.pubsub.schedule('0 2 * * 0')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Starting cleanup of old notifications...');
    
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const oldNotifications = await db.collection('notifications')
        .where('createdAt', '<', thirtyDaysAgo)
        .limit(500)
        .get();
      
      if (oldNotifications.empty) {
        console.log('No old notifications to clean up');
        return;
      }
      
      const batch = db.batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Deleted ${oldNotifications.docs.length} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  });
  