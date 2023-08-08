import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentQuery = '';

const lightbox = new SimpleLightbox('.photo-card a');

searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.currentTarget);
  const searchQuery = formData.get('searchQuery');

  if (searchQuery.trim() === '') {
    return;
  }

  currentQuery = searchQuery;
  page = 1;

  clearGallery();
  await fetchImages(searchQuery);
}

async function loadMoreImages() {
  page += 1;
  await fetchImages(currentQuery, page);
  scrollToNextPage();
}

async function fetchImages(query, page = 1) {
  try {
    const apiKey = '38721909-f69e4340e26f5a05edebcf59f';
    const response = await axios.get(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`);
    
    const images = response.data.hits;
    
    if (images.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    renderImages(images);

    if (images.length < 40) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      loadMoreBtn.style.display = 'block';
    }
    
    Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('An error occurred while fetching images. Please try again later.');
  }
}

function renderImages(images) {
  const imageMarkup = images
    .map(image => `
      <div class="photo-card">
        <a href="${image.largeImageURL}" title="${image.tags}" data-lightbox="image">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </div>
    `)
    .join('');

  gallery.insertAdjacentHTML('beforeend', imageMarkup);
  lightbox.refresh();
}

function clearGallery() {
  gallery.innerHTML = '';
}

function scrollToNextPage() {
  const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
