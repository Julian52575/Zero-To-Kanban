import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import type { Item } from '../types/item';
import {
    updateItem,
    deleteItem,
} from '../services/itemsApi';

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
    const toggleCompletion = () => {
        updateItem({
            ...item,
            completed: !item.completed,
        })
            .then(updatedItem => onItemUpdate(updatedItem))
            .catch(error => console.error(error));
    };

    const removeItem = () => {
        deleteItem(item.id)
            .then(() => onItemRemoval(item))
            .catch(error => console.error(error));
    };

    return (
        <Container
            fluid
            className={`item ${item.completed ? 'completed' : ''}`}
        >
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