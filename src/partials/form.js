import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from './simple-lightbox';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const params = {
  key: '35273413-b89fdc0e5aebefb0e92a1164e',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  page: 1,
  per_page: 40,
};

let totalPages;

const getImages = async () => {
  try {
    const url = `https://pixabay.com/api/?${new URLSearchParams(params)}`;
    const response = await axios.get(url);
    console.log('Response from axios.get: ', response);
    return response;
  } catch (error) {
    Notify.failure(error.message);
  }
};

const renderImages = images => {
  const markup = images
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<a href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b><b>${likes}</b>
    </p>
    <p class="info-item">
      <b>Views</b><b>${views}</b>
    </p>
    <p class="info-item">
      <b>Comments</b><b>${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads</b><b>${downloads}</b>
    </p>
  </div>
</div></a>
`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
};

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  const {
    elements: { searchQuery },
  } = event.currentTarget;

  if (searchQuery.value == '') {
    Notify.warning('Please enter some text!');
    return;
  }

  params.q = searchQuery.value;
  params.page = 1;

  getImages()
    .then(response => {
      console.log(response);
      const totalHits = response.data.totalHits;
      if (totalHits == 0) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found ${totalHits} images.`);
        totalPages = Math.ceil(totalHits / params.per_page);
      }
      renderImages(response.data.hits);
      const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
      params.page += 1;
      loadMoreBtn.style.display = 'block';
    })
    .catch(error => {
      Notify.failure(error.message);
    });
});

loadMoreBtn.addEventListener('click', () => {
  getImages()
    .then(response => {
      renderImages(response.data.hits);
      const lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
      params.page += 1;
      if (params.page > totalPages) {
        loadMoreBtn.style.display = 'none';
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => Notify.failure(error.message));
});
