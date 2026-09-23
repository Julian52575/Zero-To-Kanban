import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import type { Item } from '../types/item';
import {
    updateItem,
    deleteItem,
} from '../services/itemsApi';
import { getErrorMessage } from '../utils/errorMessage';

interface ItemDisplayProps {
    item: Item;
    onItemUpdate: (item: Item) => void;
    onItemRemoval: (item: Item) => void;
}
function ItemDisplay({
    item,
    onItemUpdate,
    onItemRemoval,
}: ItemDisplayProps) {
    const [error, setError] = React.useState<string | null>(null);
    const toggleCompletion = () => {
        setError(null);
        updateItem({
            ...item,
            completed: !item.completed,
        })
            .then(updatedItem => onItemUpdate(updatedItem))
            .catch(error => {
                console.error(error);
                setError(getErrorMessage(error));
            });
    };
    const removeItem = () => {
        fetch(`/api/items/${item.id}`, {
            method: 'DELETE',
        }).then(() => onItemRemoval(item));
        setError(null);

        deleteItem(item.id)
            .then(() => onItemRemoval(item))
            .catch(error => {
                console.error(error);
                setError(getErrorMessage(error));
            });
    };
    return (
        <Container
            fluid
            className={`item ${item.completed ? 'completed' : ''}`}
        >
            {error && (
                <Row>
                    <Col className="text-danger">
                        {error}
                    </Col>
                </Row>
            )}
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed
                                    ? 'fa-check-square'
                                    : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default ItemDisplay;