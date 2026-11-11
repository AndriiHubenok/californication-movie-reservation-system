import {useEffect, useRef, type MouseEvent} from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isProcessing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({
                                 isOpen,
                                 title,
                                 message,
                                 confirmLabel = 'Accept',
                                 cancelLabel = 'Cancel',
                                 isProcessing = false,
                                 onConfirm,
                                 onCancel,
                             }: ConfirmModalProps) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) {
            dialog.showModal();
        } else if (!isOpen && dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current && !isProcessing) {
            onCancel();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog"
            onCancel={(e) => {
                e.preventDefault();
                if (!isProcessing) {
                    onCancel();
                }
            }}
            onClick={handleBackdropClick}
        >
            <div className="confirm-dialog-content">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-dialog-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={isProcessing}
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        disabled={isProcessing}
                        onClick={onConfirm}
                    >
                        {isProcessing ? 'Completing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
};