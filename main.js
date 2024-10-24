class Roommate {
    constructor(name, bio, projects) {
        this.name = name;
        this.bio = bio;
        this.projects = projects;
    }

    render() {
        const section = document.createElement('section');
        section.classList.add('section');
        section.id = this.name.toLowerCase();

        section.innerHTML = `
            <h2>${this.name}</h2>
            <p>${this.bio}</p>
            <h3>Projects:</h3>
            <ul>${this.projects.map(project => `<li>${project}</li>`).join('')}</ul>
        `;

        return section;
    }
}

// Create Roommate instances
const omed = new Roommate('Omed', 'Bio: [Your bio here]', ['Project 1 details', 'Project 2 details']);
const peno = new Roommate('Peno', 'Bio: [Peno\'s bio here]', ['Project 1 details', 'Project 2 details']);
const ammar = new Roommate('Ammar', 'Bio: [Ammar\'s bio here]', ['Project 1 details', 'Project 2 details']);
const matthew = new Roommate('Matthew', 'Bio: [Matthew\'s bio here]', ['Project 1 details', 'Project 2 details']);
const marvin = new Roommate('Marvin', 'Bio: [Marvin\'s bio here]', ['Project 1 details', 'Project 2 details']);

// Function to render navigation
function renderNavigation(roommates) {
    const navList = document.getElementById('nav-list');
    roommates.forEach(roommate => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${roommate.name.toLowerCase()}">${roommate.name}</a>`;
        navList.appendChild(li);
    });
}

// Function to render all roommates
function renderRoommates(roommates) {
    const mainContent = document.getElementById('main-content');
    roommates.forEach(roommate => {
        mainContent.appendChild(roommate.render());
    });
}

// Array of roommates
const roommates = [omed, peno, ammar, matthew, marvin];

// Render navigation and roommates
renderNavigation(roommates);
renderRoommates(roommates);
