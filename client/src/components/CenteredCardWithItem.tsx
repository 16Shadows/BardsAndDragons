import React, {ReactElement, ReactNode} from "react";
import {Col, Row, Card} from "react-bootstrap";

interface CenteredCardWithItemProps {
    cardBody: ReactNode;
    cardClassName?: string;
    itemAfterCard?: ReactElement;
    title?: string;
    columnWidth?: number;
}

const CenteredCardWithItem = ({
                                  cardBody,
                                  cardClassName = "mb-3",
                                  itemAfterCard,
                                  title,
                                  columnWidth = 4
                              }: CenteredCardWithItemProps) => {
    return (
        <Row className="justify-content-md-center">
            <Col md={columnWidth}>
                <Card className={cardClassName}>
                    <Card.Body>
                        {title && <h1 className="text-center mb-4">{title}</h1>}
                        {cardBody}
                    </Card.Body>
                </Card>
                {itemAfterCard}
            </Col>
        </Row>
    );
}

export default CenteredCardWithItem;
