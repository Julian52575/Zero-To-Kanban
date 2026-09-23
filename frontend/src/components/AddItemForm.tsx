import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { createItem } from '../services/itemsApi';
import type { Item } from '../types/item';
import { getErrorMessage } from '../utils/errorMessage';

interface AddItemFormProps {
    onNewItem: (item: Item) => void;
}

function AddItemForm({ onNewItem }: AddItemFormProps) {
    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const submitNewItem = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        createItem(newItem)
            .then(item => {
                onNewItem(item);
                setNewItem('');
            })
            .catch(error => {
                console.error(error);
                setError(getErrorMessage(error));
            })
            .finally(() => {
                setSubmitting(false);
            });
    };
    const isDisabled = submitting || newItem.trim().length === 0;

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <Button
                    type="submit"
                    variant="success"
                    className={isDisabled ? 'disabled' : ''}
                    disabled={isDisabled}
                >
                    {submitting ? 'Adding...' : 'Add Item'}
                </Button>
            </InputGroup>
            {error && (
                <p className="text-danger">
                    {error}
                </p>
            )}
        </Form>
    );
}

export default AddItemForm;