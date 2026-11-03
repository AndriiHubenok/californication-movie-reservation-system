import {useNavigate} from "react-router-dom";


export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
            <h2>404 - Page Not Found</h2>
            <p style={{ margin: '16px 0' }}>
                The page you are looking for does not exist. :(
            </p>
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/')}
            >
                Go to Home
            </button>
        </main>
    );
}