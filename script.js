const roommates = [
    {
        name: 'Omed',
        bio: 'Bio: Omed is an avid coder and loves hiking.',
        projects: ['Web Development', 'Mobile Apps'],
    },
    {
        name: 'Peno',
        bio: 'Bio: Peno enjoys photography and travel.',
        projects: ['Travel Blog', 'Photography Portfolio'],
    },
    {
        name: 'Ammar',
        bio: 'Bio: Ammar is a music enthusiast and wants to learn to play guitar.',
        projects: ['Music Videos', 'Songwriting'],
    },
    {
        name: 'Matthew',
        bio: 'Bio: Matthew loves gaming and technology.',
        projects: ['Game Development', 'Tech Reviews'],
    },
    {
        name: 'Marvin',
        bio: 'Bio: Marvin is a fitness guru and healthy living advocate.',
        projects: ['Fitness Blog', 'Meal Plans'],
    }
];

// Function to render navigation
function renderNavigation() {
    const navList = document.getElementById('nav-list');
    roommates.forEach(roommate => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-name="${roommate.name.toLowerCase()}">${roommate.name}</a>`;
        navList.appendChild(li);
    });

    // Add click event listener to the navigation links
    navList.addEventListener('click', function(event) {
        const name = event.target.getAttribute('data-name');
        if (name) {
            renderRoommate(name);
        }
    });
}

// Function to render a roommate
function renderRoommate(roommateName) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = ''; // Clear previous content

    const roommate = roommates.find(r => r.name.toLowerCase() === roommateName);
    if (roommate) {
        const section = document.createElement('section');
        section.classList.add('section');

        section.innerHTML = `
            <h2>${roommate.name}</h2>
            <p>${roommate.bio}</p>
            <h3>Projects:</h3>
            <ul>${roommate.projects.map(project => `<li>${project}</li>`).join('')}</ul>
        `;

        mainContent.appendChild(section);
    }
}

// Initial render
renderNavigation();
