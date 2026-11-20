import {useAuth} from "../context/AuthContext.tsx";
import {useEffect, useState} from "react";
import {type TicketValidationResponse, validateTicket} from "../api/reservations.ts";
import {ApiError} from "../api/client.ts";


export const ValidateTicketPage = () => {

    const [ code, setCode ] = useState<string | null>(null);
    const [ error, setError ] = useState<string | null>(null);
    const [ validationResult, setValidationResult ] = useState<TicketValidationResponse | null>(null);

    useEffect(() => {
        setError(null);

        const validateCode = async () => {
            if (code) {
                try {
                    const response = await validateTicket(code);
                    setValidationResult(response);

                } catch (err) {
                    if (err instanceof Error && err.name === 'AbortError') {
                        return;
                    }
                    setError(
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to load your reservations.'
                    );
                }
            }
        };


        validateCode();
    }, [code]);

    return (
        <main className="validate-ticket-page">
            <h2>Validate Ticket</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="token">Ticket Token</label>
                    <input
                        id="token"
                        type="text"
                        value={code || ''}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter ticket token"
                        required
                    />
                </div>
            </form>
            {error && <p style={{color: '#ff4d4d', fontSize: '0.9rem'}}>{error}</p>}
            {validationResult && (
                <div className="validation-result">
                    <h3>Validation Result</h3>
                    <p><strong>Ticket ID:</strong> {validationResult.ticket_id}</p>
                    <p><strong>Movie Title:</strong> {validationResult.movie_title}</p>
                    <p><strong>Showtime:</strong> {validationResult.showtime}</p>
                    <p><strong>Seat:</strong> {validationResult.seat}</p>
                    <p><strong>User:</strong> {validationResult.user}</p>
                </div>
            )}
        </main>
    );
}