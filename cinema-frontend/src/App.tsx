import { MovieList } from './features/movies/components/MovieList'

function App() {
  return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <header className="p-4 bg-white border-b shadow-sm">
          <h1 className="text-2xl font-bold max-w-6xl mx-auto">Cinema</h1>
        </header>
        <div className="max-w-6xl mx-auto">
          <MovieList />
        </div>
      </main>
  )
}

export default App