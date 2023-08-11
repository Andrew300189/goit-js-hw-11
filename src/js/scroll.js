import axios from 'axios';

let totalHits = 0;
const perPage = 40;

export async function initScroll(query, handleScrollFunction) {
  if (query.trim() !== '') {
    await fetchTotalHits(query);
    handleScrollFunction();
  }
}

export function shouldLoadMore(page) {
  const totalPages = Math.ceil(totalHits / perPage);
  return page < totalPages;
}

async function fetchTotalHits(query) {
  try {
    const apiKey = '38721909-f69e4340e26f5a05edebcf59f';
    const response = await axios.get(`https://pixabay.com/api/?key=${apiKey}&q=${query}`);
    totalHits = response.data.totalHits;
  } catch (error) {
    console.error('Error fetching total hits:', error);
  }
}
