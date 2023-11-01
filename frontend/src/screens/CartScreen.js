import { useContext } from "react";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import { Button, Card, Col, FormControl, ListGroup, Row } from "react-bootstrap";
import MessageBox from "../component/MessageBox";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CartScreen() {
    const navigate = useNavigate();
    
    const {state, dispatch: ctxDispatch} = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

    const updateCartHandler = async (item, quantity) => {
        const { data } = await axios.get(`api/products/${item._id}`);
        if (data.countInStock < quantity) {
            window.alert("Sorry, product is out of stock");
            return;
        }
        ctxDispatch({
            type: 'CART_ADD_ITEM', 
            payload: {...item, quantity },
        });
    };
    
    const removeItemHandler = (item) => {
        ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
    };

    const checkoutHandler = () => {
        navigate('/signin?redirect=/shipping');
    };

    function formatSubtotal(subtotal) {
        return subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

    return (
        <div>
            <Helmet>
                <title>Shopping Cart</title>
            </Helmet>
            <h1>Shopping Cart</h1>
            <Row>
                <Col md={8}> 
                    {cartItems.length === 0 ? (
                        <MessageBox>
                            Cart is empty. <Link to="/">Go Shopping</Link>
                        </MessageBox>
                    ) : (
                        <ListGroup>
                            {cartItems.map((item) => (
                                <ListGroup.Item key={item._id}>
                                    <Row className="align-items-center">
                                        <Col md={4}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="img-fluid rounded img-thumbnail"
                                            ></img>{' '}
                                            <Link style={{textDecoration: 'none'}} className='item' to={`/product/${item.slug}`}>{item.name}</Link>
                                        </Col>
                                        <Col md={3}>
                                            <Button
                                                variant="light"
                                                onClick={() => updateCartHandler(item, item.quantity - 1)}
                                                disabled={item.quantity === 1}
                                            >
                                                <i className="fas fa-minus-circle"></i>
                                            </Button>{' '}
                                            <input
                                                className="input"
                                                type="number"
                                                value={item.quantity}
                                                min="1"
                                                max={item.countInStock}
                                                onInput={(e) => {
                                                // Prevent any non-numeric characters from being entered
                                                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                                updateCartHandler(item, Number(e.currentTarget.value));
                                                }}
                                          />{' '}
                                            <Button
                                                variant="light"
                                                onClick={() => updateCartHandler(item, item.quantity + 1)}
                                                disabled={item.quantity === item.countInStock}
                                            >
                                                <i className="fas fa-plus-circle"></i>
                                            </Button>
                                        </Col>
                                        <Col md={3}>₱{item.price}</Col>
                                        <Col md={2}>
                                            <Button variant="light"
                                                    onClick={() => removeItemHandler(item)}>
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                <h3 className="center">
                                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}items) : ₱
                                    {formatSubtotal(cartItems.reduce((a, c) => a + c.price * c.quantity, 0))}
                                </h3>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <div className="d-grid">
                                        <Button type="button" 
                                                variant="primary"
                                                onClick={checkoutHandler} 
                                                disabled={cartItems.length === 0}
                                        >
                                            Checkout
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
