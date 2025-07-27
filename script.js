const apiKey = '6360eb433f3020d94a5de4f0fb52c720';
const lang = 'pt-BR';
const baseUrl = 'https://api.themoviedb.org/3';

let movieId = null;

function start() {
  const input = document.getElementById('movieId').value;
  if (!input) {
    alert('Por favor, digite um ID válido.');
    return;
  }
  movieId = input;
  document.getElementById('id-dialog').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
  loadMovieDetails();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('active');
  modal.querySelector('iframe').src = '';
}

async function loadMovieDetails() {
  try {
    const [detailsRes, creditsRes, similarRes, videosRes] = await Promise.all([
      fetch(`${baseUrl}/movie/${movieId}?api_key=${apiKey}&language=${lang}`),
      fetch(`${baseUrl}/movie/${movieId}/credits?api_key=${apiKey}&language=${lang}`),
      fetch(`${baseUrl}/movie/${movieId}/similar?api_key=${apiKey}&language=${lang}`),
      fetch(`${baseUrl}/movie/${movieId}/videos?api_key=${apiKey}&language=${lang}`)
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();
    const similar = await similarRes.json();
    const videos = await videosRes.json();

    document.querySelector('h1').textContent = details.title;
    document.querySelector('.poster-container img').src = `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
    document.querySelector('.info').textContent = `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}min • ${details.genres.map(g => g.name).join(', ')} • ${details.release_date.slice(0, 4)}`;
    document.querySelector('.rating').textContent = `⭐ ${details.vote_average.toFixed(1)} / ${details.vote_count}`;
    document.querySelector('.description').textContent = details.overview;

    const castContainer = document.querySelector('.actors');
    castContainer.innerHTML = '';
    credits.cast.slice(0, 10).forEach(actor => {
      if (!actor.profile_path) return;
      castContainer.innerHTML += `
        <div class="actor">
          <img src="https://image.tmdb.org/t/p/w185${actor.profile_path}" alt="${actor.name}" />
          <div>${actor.name.length > 20 ? actor.name.slice(0, 17) + '...' : actor.name}</div>
        </div>`;
    });

    const similarContainer = document.querySelector('.movies');
    similarContainer.innerHTML = '';
    similar.results.slice(0, 10).forEach(movie => {
      if (!movie.poster_path) return;
      similarContainer.innerHTML += `
        <div class="movie">
          <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
          <div>${movie.title.length > 20 ? movie.title.slice(0, 17) + '...' : movie.title}</div>
        </div>`;
    });

    const trailerBtn = document.querySelector('.btn-trailer');
    const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (trailer) {
      trailerBtn.disabled = false;
      trailerBtn.textContent = 'TRAILER';
      trailerBtn.onclick = () => {
        document.querySelector('#trailer-modal iframe').src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
        document.getElementById('trailer-modal').classList.add('active');
      };
    } else {
      trailerBtn.disabled = true;
      trailerBtn.textContent = 'Trailer indisponível';
    }

    document.querySelector('.btn-play').onclick = () => {
      const player = document.querySelector('#player-modal iframe');
      player.src = `https://embedder.net/e/${movieId}`;
      document.getElementById('player-modal').classList.add('active');
    };
  } catch (error) {
    alert('Erro ao carregar dados do filme.');
  }
}
