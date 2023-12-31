import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { initScroll, shouldLoadMore } from './scroll';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let page = 1;
let currentQuery = '';
let isLoading = false;

const lightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

searchForm.addEventListener('submit', handleFormSubmit);

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
  await fetchImages(searchQuery, page);

  // Initialize scroll after fetching images
  initScroll(currentQuery, handleScroll);
}

window.addEventListener('scroll', handleScroll);

async function handleScroll() {
  const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

  if (isNearBottom && !isLoading && shouldLoadMore(page)) {
    isLoading = true;
    page += 1;
    await fetchImages(currentQuery, page);
    isLoading = false;
  }
}

async function fetchImages(query, page = 1) {
  try {
    const apiKey = '38721909-f69e4340e26f5a05edebcf59f';
    const perPage = 40;
    const response = await axios.get(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`);

    const images = response.data.hits;

    if (images.length === 0) {
      if (page === 1) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      }
      return;
    }

    renderImages(images);

    if (page === 1) {
      await fetchImages(query, 2);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('An error occurred while fetching images. Please try again later.');
  }
}

function renderImages(images) {
  const imageMarkup = images
    .map(image => `
  <div class="photo-card">
    <div class="image-wrap">
    <a href="${image.largeImageURL}" title="${image.tags}" data-lightbox="image">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
    </a>
    </div>
    <div class="info">
      <div class="info-wrap">
        <p class="info-item"><b>Likes:</b></p>
        <p>${image.likes}</p>
      </div>
      <div class="info-wrap">
        <p class="info-item"><b>Views:</b></p>
        <p>${image.views}</p>
      </div>
      <div class="info-wrap">
        <p class="info-item"><b>Comments:</b></p>
        <p>${image.comments}</p>
      </div>
      <div class="info-wrap">
        <p class="info-item"><b>Downloads:</b></p>
        <p>${image.downloads}</p>
      </div>
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
