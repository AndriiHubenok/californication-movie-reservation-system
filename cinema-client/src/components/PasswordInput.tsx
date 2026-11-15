import { useState} from "react";

interface PasswordInputProps {
    id?: string;
    label?: string;
    value?: string;
    error?: string;
    onChange: (value: string) => void;
}

export const PasswordInput = ({
                                  id = 'password',
                                  label = 'Password',
                                  value,
                                  error,
                                  onChange,
                              }: PasswordInputProps) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <div style={{ position: 'relative', display: 'flex' }}>
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    className={error ? 'input-error' : ''}
                    style={{ width: '100%' }}
                    onChange={(e) => onChange(e.target.value)}
                    required
                />
                <button
                    type="button"
                    onClick={() => setVisible((prev) => !prev)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    style={{ marginLeft: '8px' }}
                >
                    {visible ? 'Hide' : 'Show'}
                </button>
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};