import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let page = 1;
let currentQuery = '';
let isLoading = false;

const lightbox = new SimpleLightbox('.photo-card a');

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
  await fetchImages(searchQuery);
}

window.addEventListener('scroll', handleScroll);

async function handleScroll() {
  const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

  if (isBottom && !isLoading) {
    isLoading = true;
    page += 1;
    await fetchImages(currentQuery, page);
    isLoading = false;
  }
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
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
    
    isLoading = false;
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('An error occurred while fetching images. Please try again later.');
    isLoading = false;
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
