let restaurants = [];
let map;
let markers = [];

fetch('restaurants.json')  // JSON 파일의 경로
    .then(response => response.json())
    .then(data => {
        restaurants = data;
        initMap();
        displayRestaurants(restaurants);
        document.getElementById('search').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchRestaurants();
            }
        });
    });

function initMap() {
    const center = { lat: 36.3333824, lng: 127.4347087 }; // 대전광역시 동구 동대전로 171의 위도와 경도
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: center
    });
    displayMarkers(restaurants);
}

function displayMarkers(filteredRestaurants) {
    clearMarkers();
    filteredRestaurants.forEach(restaurant => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: restaurant.address }, (results, status) => {
            if (status === 'OK') {
                const marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    title: restaurant.name
                });
                markers.push(marker);
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <h5>${restaurant.name}</h5>
                            <p>${restaurant.address}</p>
                            <p>${restaurant.type}</p>
                            <p id="info-window-rating-${restaurant.name}">별점: </p>
                        </div>
                    `
                });
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                    getPlaceRatingForInfoWindow(restaurant);
                });
            }
        });
    });
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

function displayRestaurants(filteredRestaurants) {
    const container = document.getElementById('restaurant-list');
    container.innerHTML = '';
    filteredRestaurants.forEach(restaurant => {
        const form = document.createElement('form');
        form.action = `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.address)}`;
        form.method = 'get';
        form.target = '_blank';

        const card = document.createElement('div');
        card.className = 'card h-100';
        card.innerHTML = `
            <img src="${restaurant.photo}" class="card-img-top" alt="${restaurant.name}">
            <div class="card-body">
                <h5 class="card-title">${restaurant.name}</h5>
                <p class="card-text">${restaurant.address}</p>
                <p class="card-text">${restaurant.type}</p>
                <p class="card-text rating" id="rating-${restaurant.name}">별점: </p>
                <p class="card-text">대표 메뉴: ${restaurant.menu.join(", ")}</p>
                <p class="card-text">가격: ${restaurant.price}</p>
            </div>
        `;
        card.onclick = function() {
            form.submit();
        };
        form.appendChild(card);
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.appendChild(form);
        container.appendChild(col);
        getPlaceRating(restaurant);
    });
}

function searchRestaurants() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = restaurants.filter(restaurant => restaurant.name.toLowerCase().includes(query));
    displayRestaurants(filtered);
    displayMarkers(filtered);
}

function filterCuisine(type) {
    if (type === 'all') {
        displayRestaurants(restaurants);
        displayMarkers(restaurants);
    } else {
        const filtered = restaurants.filter(restaurant => restaurant.type === type);
        displayRestaurants(filtered);
        displayMarkers(filtered);
    }
}

function getPlaceRating(restaurant) {
    const service = new google.maps.places.PlacesService(map);
    service.textSearch({ query: restaurant.name }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const place = results[0];
            const rating = place.rating || 3;
            document.getElementById(`rating-${restaurant.name}`).textContent = `별점: ${rating}`;
        }
    });
}

function getPlaceRatingForInfoWindow(restaurant) {
    const service = new google.maps.places.PlacesService(map);
    service.textSearch({ query: restaurant.name }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const place = results[0];
            const rating = place.rating || 3;
            document.getElementById(`info-window-rating-${restaurant.name}`).textContent = `별점: ${rating}`;
        }
    });
}
