// Utils
function stripNonNumeric(string) {
  return string.replace(/[^\d.\-½]/g, '');
}

const scrollWithAction = action => () => {
	window.scrollTo(0, document.body.scrollHeight);
  action();
}


function getHeaders(item) {
  const headingsArray = Object.keys(item);
  const headersString = headingsArray.join(',') + '\r\n';
  return headersString;
}

function arrayOfObjectsToCSV(data) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += getHeaders(data[0]);
  data.forEach(item => {
    const values = Object.keys(item).map(key => item[key]);
    const row = values.join(',') + '\r\n';
    csvContent += row;
  });
  return csvContent;
}

function downloadCSV(data) {
  const csvContent = arrayOfObjectsToCSV(data);
  const encodedUri = encodeURI(csvContent);
  console.log('\n\n=========== Click the link below to download the CSV file ===========\n\n');
  console.log(encodedUri);
  console.log('\n\n=====================================================================\n\n');
}

//LinkedIn Selectors
const articlesSelector = 'article.feed-shared-update:not(.reshare-update)';
const viewsSelector = '.analytics-entry-point strong';
const linkSelector = 'a.analytics-entry-point';

function getViews() {
  const allArticles = document.querySelectorAll(articlesSelector);
  const articleData = Array.from(allArticles).map(node => {
    // Get view count
    const viewsNode = node.querySelector(viewsSelector);
    if (!viewsNode) {
      // Older posts don't show view counts. Stop scraping here.
      window.stopScraping();
      return {};
    }
    const views = parseInt(stripNonNumeric(viewsNode.textContent), 10);
    // Get post id
    const analyticsLinkNode = node.querySelector(linkSelector);
    const analyticsLink = analyticsLinkNode.getAttribute('href');
    const postId = analyticsLink.split('urn:li:activity:')[1].slice(0, -1);
    const postLink = `https://www.linkedin.com/feed/update/urn:li:activity:${postId}/`;
    return {
      postId,
      views,
      postLink
    };
  });
  const filterdArticleData = articleData.filter(d => d.views);
  return articleData;
}

window.allViewsData = window.allViewsData || {};
function getAllViewsData() {
  const viewsData = getViews();
  viewsData.forEach(data => window.allViewsData[data.postId] = data);
  const postCount = Object.keys(window.allViewsData).length;
  console.log(`Scraping Data... Post count: ${postCount}`);
}

const interval = setInterval(scrollWithAction(getAllViewsData), 2000);
window.stopScraping = () => {
  window.clearInterval(interval);
  if (Object.keys(window.allViewsData).length === 0) throw new Error('No view data found');
  const allViewsDataArray = Object.keys(window.allViewsData).map(key => window.allViewsData[key]);
  downloadCSV(allViewsDataArray)
};

