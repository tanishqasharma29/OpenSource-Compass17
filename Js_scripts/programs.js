let programsData = [];

async function loadPrograms() {
    try {
        const response = await fetch('data/programs.json');
        programsData = await response.json();
        displayPrograms(programsData);
    } catch (error) {
        console.error("Error loading programs:", error);
    }
}

function displayPrograms(programs) {
    const grid = document.getElementById('programsGrid');
    if (programs.length === 0) {
        grid.innerHTML = '<p class="text-center">No programs found matching your criteria.</p>';
        return;
    }

    grid.innerHTML = programs.map(p => `
        <div class="card fade-in-up active">
            <h4>${p.name}</h4>
            <span class="badge">${p.category}</span>
            <p style="margin-top: 15px;">${p.description}</p>
            <p><strong>Timeline:</strong> ${p.timeline}</p>
            <p><strong>Reward:</strong> ${p.stipend}</p>
            <a href="${p.link}" class="hero button" style="display:inline-block; margin-top:15px; text-align:center;">View Details</a>
        </div>
    `).join('');
}

function applyFilters() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = programsData.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    displayPrograms(filtered);
}

document.getElementById('searchBar').addEventListener('input', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);