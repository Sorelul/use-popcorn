# usePopcorn

usePopcorn is a React application that allows users to search for movies using the OMDB API and rate them. Users can also maintain a list of watched movies and see a summary of their ratings.

**Note: This project is still under construction and is not finished yet.**

## Features

-   Search for movies using the OMDB API
-   Rate movies with a star rating system
-   Add movies to a watched list
-   View a summary of watched movies with average ratings and runtime

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/Sorelul/usepopcorn.git
    cd usepopcorn
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your OMDB API key:

    ```sh
    REACT_APP_OMDBAPI_KEY=your_api_key_here
    ```

4. Start the development server:
    ```sh
    npm start
    ```

## Usage

-   Use the search bar to find movies.
-   Click on a movie to view its details.
-   Rate the movie using the star rating system.
-   Add the movie to your watched list.
-   View the summary of your watched movies.

## Components

-   `App.js`: Main application component.
-   `useMovies.js`: Custom hook to fetch movies from the OMDB API.
-   `StarRating.js`: Component for the star rating system.
-   `index.js`: Entry point of the application.
-   `index.css`: Styling for the application.
