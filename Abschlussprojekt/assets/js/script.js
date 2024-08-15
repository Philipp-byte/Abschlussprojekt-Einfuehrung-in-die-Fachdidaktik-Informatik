'use strict';

// Navbar variables
const nav = document.querySelector('.mobile-nav');
const navMenuBtn = document.querySelector('.nav-menu-btn');
const navCloseBtn = document.querySelector('.nav-close-btn');

// NavToggle function
const navToggleFunc = function () {
    nav.classList.toggle('active');
};

navMenuBtn.addEventListener('click', navToggleFunc);
navCloseBtn.addEventListener('click', navToggleFunc);

// Theme toggle variables
const themeBtn = document.querySelectorAll('.theme-btn');

// Set default theme to dark
document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');

    for (let i = 0; i < themeBtn.length; i++) {
        themeBtn[i].classList.add('dark');
        themeBtn[i].classList.remove('light');
    }
});

// Theme toggle
for (let i = 0; i < themeBtn.length; i++) {
    themeBtn[i].addEventListener('click', function () {
        // toggle `light-theme` & `dark-theme` class from `body`
        // when clicked `theme-btn`
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');

        for (let i = 0; i < themeBtn.length; i++) {
            // When the `theme-btn` is clicked,
            // it toggles classes between `light` & `dark` for all `theme-btn`.
            themeBtn[i].classList.toggle('light');
            themeBtn[i].classList.toggle('dark');
        }
    });
}

// Fetch and display blog posts
const pageType = document.body.getAttribute('data-page-type');

if (document.getElementById('blog-card-group')) {
    fetch('./assets/data/data.json')
        .then(response => response.json())
        .then(data => {
            const blogCardGroup = document.getElementById('blog-card-group');
            blogCardGroup.innerHTML = '';
            data.veranstaltungen.forEach(post => {
                if (post.type === pageType) {
                    const card = document.createElement('div');
                    card.className = 'blog-card';
                    card.innerHTML = `
                        <div class="blog-card-banner">
                            <img src="${post.bannerImg}" alt="${post.title}" width="250" class="blog-banner-img">
                        </div>
                        <div class="blog-content-wrapper">
                            <h3>
                                <a href="inhalt.html?id=${post.id}" class="h3">${post.title}</a>
                            </h3>
                            <p class="blog-text">${post.textCard}</p>
                            <div class="wrapper-flex">
                                <div class="profile-wrapper">
                                    <img src="${post.authorImg}" alt="${post.authorName}" width="50">
                                </div>
                                <div class="wrapper">
                                    <a href="index.html" class="h4">${post.authorName}</a>
                                    <p class="text-sm">
                                        <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time>
                                        <span class="separator"></span>
                                        <ion-icon name="time-outline"></ion-icon>
                                        <time datetime="${post.readTime}">${Math.ceil(parseInt(post.readTime.slice(2)) / 60)} min</time>
                                    </p>
                                </div>
                            </div>
                        </div>
                    `;
                    blogCardGroup.appendChild(card);
                }
            });
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// Function to get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Display content based on URL parameter
if (document.getElementById('content')) {
    const id = getUrlParameter('id');

    fetch('./assets/data/data.json')
        .then(response => response.json())
        .then(data => {
            const contentContainer = document.getElementById('content');
            const item = data.veranstaltungen.find(item => item.id == id);

            if (item) {
                const pageTitle = document.getElementById('page-title');
                if (item.type === "fachdidaktik") {
                    pageTitle.innerHTML = "<b>Fachdidaktik der Informatik</b>";
                } else if (item.type === "didaktischeKonzeption") {
                    pageTitle.innerHTML = "<b>Didaktische&nbsp;Konzeption</b>";
                }

                contentContainer.innerHTML = `
                    <h2>${item.title}</h2>
                    <iframe src="${item.content}" width="100%" height="100%"></iframe>
                `;

                if (item.downloads && item.downloads.length > 0) {
                    const downloadButton = document.getElementById('download-button');
                    downloadButton.onclick = function() {
                        const zip = new JSZip();
                        const folder = zip.folder("downloads");
                        let downloadPromises = [];

                        item.downloads.forEach(download => {
                            let downloadPromise = fetch(download.filePath)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }
                                    return response.blob();
                                })
                                .then(blob => {
                                    folder.file(download.fileName, blob);
                                })
                                .catch(error => {
                                    console.error('Error fetching file:', error);
                                });
                            downloadPromises.push(downloadPromise);
                        });

                        Promise.all(downloadPromises).then(() => {
                            zip.generateAsync({ type: "blob" })
                                .then(content => {
                                    saveAs(content, "downloads.zip");
                                });
                        }).catch(error => {
                            console.error('Error generating zip file:', error);
                        });
                    };
                }

            } else {
                contentContainer.innerHTML = `
                    <h2>Inhalt nicht gefunden</h2>
                    <p>Der angeforderte Inhalt konnte nicht gefunden werden.</p>
                `;
            }
        })
        .catch(error => console.error('Error loading JSON:', error));
}
