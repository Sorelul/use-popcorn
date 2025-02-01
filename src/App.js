import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    },
    {
        imdbID: "tt0133093",
        Title: "The Matrix",
        Year: "1999",
        Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    },
    {
        imdbID: "tt6751668",
        Title: "Parasite",
        Year: "2019",
        Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
    },
];

const tempWatchedData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        runtime: 148,
        imdbRating: 8.8,
        userRating: 10,
    },
    {
        imdbID: "tt0088763",
        Title: "Back to the Future",
        Year: "1985",
        Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        runtime: 116,
        imdbRating: 8.5,
        userRating: 9,
    },
];

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = process.env.REACT_APP_OMDBAPI_KEY;

export default function App() {
    const [query, setQuery] = useState("Solo leveling");
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const [watched, setWatched] = useState(function () {
        const storedValue = localStorage.getItem("watched");
        return storedValue ? JSON.parse(storedValue) : [];
    });

    function handleMovieSelect(id) {
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
        }
    }

    function handleMovieClose() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
        // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }

    //* Fetch Effect
    useEffect(() => {
        const controller = new AbortController();

        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError("");
                const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`, {
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error("Something went wrong with fetching movies.");
                }

                const data = await res.json();

                if (data.Response === "False") {
                    throw new Error("Movie not found.");
                }

                setMovies(data.Search);
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        if (query.length < 3) {
            setMovies([]);
            setError("");
            return;
        }
        fetchMovies();
        return () => {
            controller.abort();
        };
    }, [query]);

    useEffect(() => {
        localStorage.setItem("watched", JSON.stringify(watched));
    }, [watched]);

    return (
        <>
            <Navbar>
                <SearchBar query={query} setQuery={setQuery} />
                <NumResults movies={movies} />
            </Navbar>
            <MainContent>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && !error && <MovieList movies={movies} onMovieClick={handleMovieSelect} />}
                    {error && <ErrorMessage message={error} />}
                </Box>

                <Box>
                    {selectedId ? (
                        <MovieDetails
                            selectedId={selectedId}
                            onMovieClose={handleMovieClose}
                            onAddWatched={handleAddWatched}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <WatchedSummary watched={watched} />
                            <WatchedMoviesList watched={watched} onWatchedMovieDelete={handleDeleteWatched} />
                        </>
                    )}
                </Box>
            </MainContent>
        </>
    );
}

function Navbar({ children }) {
    return (
        <nav className="nav-bar">
            <Logo />
            {children}
        </nav>
    );
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function NumResults({ movies }) {
    return (
        <p className="num-results">
            Found <strong>{movies?.length}</strong> results
        </p>
    );
}

function SearchBar({ query, setQuery }) {
    const inputEl = useRef(null);

    useEffect(() => {
        function callback(e) {
            if (document.activeElement === inputEl.current) return;

            if (e.code === "Enter") {
                inputEl.current.focus();
                setQuery("");
            }
        }
        document.addEventListener("keydown", callback);
        return () => document.addEventListener("keydown", callback);
    }, [setQuery]);

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputEl}
        />
    );
}

function MainContent({ children }) {
    return <main className="main">{children}</main>;
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="box">
            <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    );
}

function MovieList({ movies, onMovieClick }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} onMovieClick={onMovieClick} />
            ))}
        </ul>
    );
}

function Movie({ movie, onMovieClick }) {
    return (
        <li key={movie.imdbID} onClick={() => onMovieClick(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function MovieDetails({ selectedId, onMovieClose, onAddWatched, watched }) {
    const [movieDetails, setMovieDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState("");

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movieDetails;

    const isWatched = watched.some((movie) => movie.imdbID === selectedId);
    const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

    //* Fetch Effect
    useEffect(
        function () {
            async function getMovieDetails() {
                setIsLoading(true);
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
                const data = await res.json();
                setMovieDetails(data);
                setIsLoading(false);
            }
            getMovieDetails();
        },
        [selectedId]
    );

    //* Escape button Effect
    useEffect(() => {
        function callback(e) {
            if (e.code === "Escape") {
                onMovieClose();
            }
        }

        document.addEventListener("keydown", callback);

        return function () {
            document.removeEventListener("keydown", callback);
        };
    }, [onMovieClose]);

    //* Title Effect
    useEffect(() => {
        if (!title) return;
        document.title = `Movie | ${title}`;

        return function () {
            document.title = "usePopcorn";
        };
    }, [title]);

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            userRating: userRating,
            runtime: Number(runtime.split(" ").at(0)),
        };

        onAddWatched(newWatchedMovie);
        onMovieClose();
    }

    return (
        <div className="details">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header>
                        <button className="btn-back" onClick={onMovieClose}>
                            &larr;
                        </button>
                        <img src={poster} alt={`Poster of ${title}`}></img>
                        <div className="details-overview">
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {runtime}
                            </p>
                            <p>{genre}</p>
                            <p>
                                <span>⭐</span>
                                {imdbRating} IMDb rating
                            </p>
                        </div>
                    </header>

                    <section>
                        <div className="rating">
                            {!isWatched ? (
                                <>
                                    <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
                                    {userRating > 0 && (
                                        <button className="btn-add" onClick={handleAdd}>
                                            ➕ Add to list
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>
                                    You rated this movie with {watchedUserRating} <span>⭐</span>.
                                </p>
                            )}
                        </div>
                        <p>
                            <em>{plot}</em>
                        </p>
                        <p>Starring {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            )}
        </div>
    );
}

function WatchedSummary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    );
}

function WatchedMoviesList({ watched, onWatchedMovieDelete }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie movie={movie} key={movie.imdbID} onWatchedMovieDelete={onWatchedMovieDelete} />
            ))}
        </ul>
    );
}

function WatchedMovie({ movie, onWatchedMovieDelete }) {
    return (
        <li key={movie.imdbID}>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
                <button className="btn-delete" onClick={() => onWatchedMovieDelete(movie.imdbID)}>
                    X
                </button>
            </div>
        </li>
    );
}

function Loader() {
    return <div className="loader">Loading...</div>;
}

function ErrorMessage({ message }) {
    return (
        <p className="error">
            <span>❌</span> {message}
        </p>
    );
}
