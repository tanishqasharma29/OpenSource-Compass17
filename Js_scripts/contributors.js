const OWNER = 'sayeeg-11';
const REPO = 'OpenSource-Compass';

// DOM Elements
const totalContributorsEl = document.getElementById('total-contributors');
const totalCommitsEl = document.getElementById('total-commits');
const totalPRsEl = document.getElementById('total-prs');
const totalPointsEl = document.getElementById('total-points');
const githubStarsEl = document.getElementById('github-stars');
const forksEl = document.getElementById('forks');

const contributorsGrid = document.getElementById('contributors-grid');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoEl = document.getElementById('page-info');

const activityList = document.getElementById('activity-list');

let contributorsData = [];
let currentPage = 1;
const itemsPerPage = 8;

// Fetch Repository Info
async function fetchRepoInfo() {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`);
    if (!res.ok) throw new Error('Failed to fetch repo info');
    const data = await res.json();
    
    githubStarsEl.textContent = data.stargazers_count;
    forksEl.textContent = data.forks_count;
    
    // Get total commits (approximate)
    const commitsRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`);
    if (commitsRes.ok) {
      const linkHeader = commitsRes.headers.get('Link');
      let totalCommits = 0;
      if (linkHeader) {
        const lastPageMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
        if (lastPageMatch) {
          totalCommits = parseInt(lastPageMatch[1]) * 1; // per_page=1
        }
      }
      totalCommitsEl.textContent = totalCommits > 0 ? totalCommits : '...';
    } else {
      totalCommitsEl.textContent = '...';
    }
  } catch (err) {
    console.error('Error fetching repo info:', err);
    githubStarsEl.textContent = '—';
    forksEl.textContent = '—';
    totalCommitsEl.textContent = '—';
  }
}

// Fetch Contributors
async function fetchContributors() {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contributors?per_page=100`);
    if (!res.ok) throw new Error('Failed to fetch contributors');
    contributorsData = await res.json();
    
    totalContributorsEl.textContent = contributorsData.length;
    
    // Calculate total PRs and points (simulated since GitHub API doesn't provide this directly)
    // In a real app, you'd need to calculate from PR data or use a custom backend
    const totalPRs = Math.floor(contributorsData.reduce((sum, c) => sum + (c.contributions || 0), 0) / 10);
    const totalPoints = Math.floor(contributorsData.reduce((sum, c) => sum + (c.contributions || 0), 0) * 1.5);
    
    totalPRsEl.textContent = totalPRs;
    totalPointsEl.textContent = totalPoints;
    
    renderContributors();
  } catch (err) {
    console.error('Error fetching contributors:', err);
    totalContributorsEl.textContent = '—';
    totalPRsEl.textContent = '—';
    totalPointsEl.textContent = '—';
  }
}

// Render Contributors
function renderContributors() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = contributorsData.slice(startIndex, endIndex);
  
  contributorsGrid.innerHTML = pageData.map((contributor, index) => {
    // Highlight first contributor (Project Lead)
    const isLead = contributor.login === 'sayeeg-11';
    const className = isLead ? 'contributor-card highlighted' : 'contributor-card';
    
    return `
      <a href="${contributor.html_url}" target="_blank" class="${className}">
        <img src="${contributor.avatar_url}&s=120" alt="${contributor.login}" />
        <div class="username">${contributor.login}</div>
        <div class="stats">PRs: ${Math.floor(contributor.contributions / 10)} | Pts: ${Math.floor(contributor.contributions * 1.5)}</div>
      </a>
    `;
  }).join('');
  
  // Update pagination
  const totalPages = Math.ceil(contributorsData.length / itemsPerPage);
  pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// Fetch Recent Activity
async function fetchRecentActivity() {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/events?per_page=10`);
    if (!res.ok) throw new Error('Failed to fetch recent activity');
    const events = await res.json();
    
    activityList.innerHTML = events
      .filter(event => event.type === 'PullRequestEvent' || event.type === 'PushEvent')
      .slice(0, 10)
      .map(event => {
        const date = new Date(event.created_at).toLocaleDateString();
        let message = '';
        
        if (event.type === 'PullRequestEvent') {
          const action = event.payload.action;
          const prNumber = event.payload.pull_request.number;
          const title = event.payload.pull_request.title;
          message = `${action === 'closed' ? 'Merge' : 'Open'} pull request #${prNumber} ${title}`;
        } else if (event.type === 'PushEvent') {
          const commitMessage = event.payload.commits?.[0]?.message || 'Commit';
          message = `Pushed commit: ${commitMessage}`;
        }
        
        return `
          <div class="activity-item">
            <img src="${event.actor.avatar_url}&s=60" alt="${event.actor.login}" class="avatar" />
            <div class="details">
              <span class="author">${event.actor.login}</span>: ${message}
            </div>
            <span class="date">${date}</span>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    activityList.innerHTML = '<p>Unable to load recent activity.</p>';
  }
}

// Event Listeners
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderContributors();
  }
});

nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(contributorsData.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderContributors();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await fetchRepoInfo();
  await fetchContributors();
  await fetchRecentActivity();
});